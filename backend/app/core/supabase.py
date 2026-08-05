from typing import Optional
import logging
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)

def get_supabase_client() -> Optional[Client]:
    """
    Returns an initialized Supabase Client if credentials are configured,
    or None if SUPABASE_URL / SUPABASE_KEY are omitted.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        return None
    try:
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None
