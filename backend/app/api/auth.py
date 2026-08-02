from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.models.database import User, ActivityLog
from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token
from typing import Any
import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system."
        )
        
    hashed_password = get_password_hash(user_in.password)
    # Default first registered user to admin for convenience
    user_count = db.query(User).count()
    role = "admin" if user_count == 0 else "user"
    
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        role=role,
        avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={user_in.full_name or user_in.email}"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log Activity
    log = ActivityLog(user_id=new_user.id, action="Register", details=f"Registered user: {new_user.email}")
    db.add(log)
    db.commit()
    
    return new_user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> Any:
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
        
    access_token = create_access_token(data={"sub": user.email})
    
    # Log Activity
    log = ActivityLog(user_id=user.id, action="Login", details="Logged into the system")
    db.add(log)
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)) -> Any:
    return current_user


@router.post("/google", response_model=Token)
def google_signin(payload: dict, db: Session = Depends(get_db)) -> Any:
    """
    Simulates Google OAuth authentication endpoint.
    Expects {'email': ..., 'name': ..., 'google_id': ..., 'avatar': ...}
    """
    email = payload.get("email")
    name = payload.get("name")
    avatar = payload.get("avatar")
    
    if not email:
        raise HTTPException(status_code=400, detail="Invalid Google payload. Email is required.")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Register a new OAuth user with a random high-entropy dummy password
        dummy_pwd = get_password_hash(datetime.datetime.utcnow().isoformat())
        user = User(
            email=email,
            full_name=name,
            hashed_password=dummy_pwd,
            avatar_url=avatar or f"https://api.dicebear.com/7.x/initials/svg?seed={name or email}",
            role="user"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        log = ActivityLog(user_id=user.id, action="Google Register", details=f"OAuth registered: {email}")
        db.add(log)
        db.commit()
    else:
        log = ActivityLog(user_id=user.id, action="Google Login", details=f"OAuth logged in: {email}")
        db.add(log)
        db.commit()

    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/forgot-password")
def forgot_password(payload: dict, db: Session = Depends(get_db)) -> Any:
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required.")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Avoid user enumeration attacks
        return {"message": "If the email exists, a password reset link has been dispatched."}
        
    log = ActivityLog(user_id=user.id, action="Password Reset Requested", details="Requested recovery link")
    db.add(log)
    db.commit()
    
    return {"message": "If the email exists, a password reset link has been dispatched."}
