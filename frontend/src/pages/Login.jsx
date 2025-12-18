import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-brand-red/10 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-surface/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-red/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-red/20 shadow-[0_0_20px_rgba(255,0,51,0.2)]">
              <Shield className="w-8 h-8 text-brand-red" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {isLogin ? 'Welcome Back' : 'Secure Access'}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              {isLogin ? 'Enter your credentials to access encrypted chat' : 'Create a new identity for secure communication'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Username</label>
              <div className="relative group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-xl px-5 py-3 pl-12 focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 transition-all text-white placeholder-gray-600"
                  placeholder="Enter username"
                  required
                />
                <User className="w-5 h-5 text-gray-600 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand-red transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-xl px-5 py-3 pl-12 focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 transition-all text-white placeholder-gray-600"
                  placeholder="Enter password"
                  required
                />
                <Lock className="w-5 h-5 text-gray-600 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand-red transition-colors" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-red hover:bg-brand-dark text-white font-medium py-4 rounded-xl shadow-lg shadow-brand-red/20 hover:shadow-brand-red/40 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isLogin ? 'Sign In' : 'Create Credentials'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              {isLogin ? "Don't have an ID? " : "Already established? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-brand-red hover:text-white transition-colors font-medium ml-1"
              >
                {isLogin ? 'Generate Keys' : 'Access System'}
              </button>
            </p>

            <button
              onClick={() => {
                if (confirm("This will clear all saved keys and local data. You will need to re-register. Continue?")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="mt-8 text-xs text-gray-600 hover:text-red-500 underline transition-colors"
            >
              ⚠ Reset Application State
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
