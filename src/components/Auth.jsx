import React, { useState } from 'react';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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
               <img src="/src/assets/logo.png" className="w-full h-full object-contain" alt="Logo" />
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
                isLogin ? 'Sign in' : 'Create account'}
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
