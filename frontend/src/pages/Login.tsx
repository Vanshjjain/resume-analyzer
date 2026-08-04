import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle, Sparkles, Shield, Github } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, googleSignIn, githubSignIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'user' | 'admin') => {
    setError(null);
    setIsLoading(true);
    try {
      const demoEmail = role === 'admin' ? 'admin@example.com' : 'vanshjain50355@gmail.com';
      const demoPass = 'password123';
      await login(demoEmail, demoPass);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Demo login failed. Make sure the backend service is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await googleSignIn(
        'vanshjain50355@gmail.com',
        'Vansh Jain',
        'https://api.dicebear.com/7.x/initials/svg?seed=Vansh'
      );
      navigate('/dashboard');
    } catch (err: any) {
      setError('Google Sign-In failed. Ensure FastAPI backend is online.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await githubSignIn(
        'vanshjain50355@gmail.com',
        'Vansh Jain',
        'https://api.dicebear.com/7.x/identicon/svg?seed=Vansh'
      );
      navigate('/dashboard');
    } catch (err: any) {
      setError('GitHub Sign-In failed. Ensure FastAPI backend is online.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b] relative overflow-hidden px-4 py-8">
      {/* Background Lighting Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[280px] h-[280px] bg-indigo-500/15 rounded-full blur-[90px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#121214]/90 border border-[#26262b] rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 text-white shadow-xl shadow-primary/25 mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome to Resume Catcher AI</h2>
          <p className="text-xs text-gray-400 mt-1">Sign in to your ATS career workspace</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#1c1c1f] border border-[#2c2c30] rounded-xl py-3.5 pl-12 pr-4 text-white text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Password</label>
              <Link to="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1c1c1f] border border-[#2c2c30] rounded-xl py-3.5 pl-12 pr-4 text-white text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 transition-all duration-200 mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4.5 h-4.5" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Access Buttons */}
        <div className="mt-4 pt-4 border-t border-[#26262b]/80 space-y-2">
          <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center">Quick Demo Shortcuts</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('user')}
              disabled={isLoading}
              className="py-2.5 px-3 rounded-xl bg-card-border/10 border border-border/20 hover:bg-card-border/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>User Sign In</span>
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading}
              className="py-2.5 px-3 rounded-xl bg-card-border/10 border border-border/20 hover:bg-card-border/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin Sign In</span>
            </button>
          </div>
        </div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#26262b]" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-[#121214] px-3 text-gray-500 uppercase tracking-widest">Or continue with</span></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-transparent border border-[#2c2c30] hover:bg-[#1c1c1f] text-white rounded-xl py-3 font-semibold text-xs flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </button>

          <button
            onClick={handleGithubSignIn}
            disabled={isLoading}
            className="w-full bg-transparent border border-[#2c2c30] hover:bg-[#1c1c1f] text-white rounded-xl py-3 font-semibold text-xs flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <Github className="w-4 h-4 shrink-0 text-white" />
            <span>GitHub</span>
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
};
