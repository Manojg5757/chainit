import React, { useState } from 'react';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../assets/logo.png';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // No setLoading(false) here on success as it seamlessly redirects to Google
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (isForgotPassword) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage("Password reset link sent! Check your email.");
        setEmail('');
      }
    } else {
      const { error, data } = isLogin 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) {
        setError(error.message);
      } else if (!isLogin && data.user && data.session === null) {
        // Supabase requires email confirmation and session is null
        setSuccessMessage("Account created! Please check your email to confirm.");
        setEmail('');
        setPassword('');
      } else if (!isLogin && data.user && data.session !== null) {
         // Auto login if email confirmation is disabled
         // Handled natively by App.jsx listener
      }
    }
    
    setLoading(false);
  };

  const toggleMode = (mode) => {
    setError(null);
    setSuccessMessage(null);
    if (mode === 'login') {
      setIsLogin(true);
      setIsForgotPassword(false);
    } else if (mode === 'signup') {
      setIsLogin(false);
      setIsForgotPassword(false);
    } else if (mode === 'forgot') {
      setIsForgotPassword(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 lg:px-8 selection:bg-blue-500/30">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[120px]" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-400/20 blur-[150px]" />
      </div>

      <div className="mx-auto w-full max-w-sm z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl py-10 px-8 shadow-2xl shadow-slate-200/50 rounded-3xl border border-slate-200"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center justify-center p-1.5 mb-4">
               <img src={Logo} className="w-full h-full object-contain" alt="Logo" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight text-center">
              {isForgotPassword 
                ? 'Reset your password' 
                : isLogin ? 'Welcome back to Chain It' : 'Secure your memory vault'}
            </h2>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold flex items-start gap-2 border border-red-100"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-sm font-semibold flex items-start gap-2 border border-emerald-100"
                >
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
                  <span>{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* GOOGLE AUTH BUTTON */}
            {!isForgotPassword && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-3 py-3.5 px-4 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-slate-100"></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Or</span>
                  <div className="flex-1 h-px bg-slate-100"></div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-medium outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-slate-700">Password</label>
                  {isLogin && (
                    <button 
                      type="button" 
                      onClick={() => toggleMode('forgot')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-500 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-medium outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                isForgotPassword ? 'Send Reset Link' : 
                isLogin ? 'Sign in with Email' : 'Create account'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            {isForgotPassword ? (
              <button 
                onClick={() => toggleMode('login')} 
                className="text-sm text-slate-500 hover:text-slate-700 font-bold hover:underline transition-all"
              >
                ← Back to login
              </button>
            ) : (
              <p className="text-sm text-slate-500 font-medium">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button 
                  onClick={() => toggleMode(isLogin ? 'signup' : 'login')} 
                  className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
