import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import {
  Mail, Lock, Eye, EyeOff, Loader2, ShieldAlert,
  KeyRound, Sparkles, ArrowRight,
} from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated, user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // Mode State
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Handle Redirection based on Role/Status
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      if (user.role === 'superAdmin') navigate('/super-admin/dashboard');
      else if (user.role === 'collegeAdmin') navigate('/college-admin/dashboard');
      else if (user.role === 'officer') navigate('/officer/dashboard');
      else if (user.academicStatus === 'GRADUATED') navigate('/alumni/dashboard');
      else navigate('/student/dashboard');
    }
  }, [isAuthenticated, user, navigate, location]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
      setPassword(''); // Strictly clear only the password field on failure
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email first');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/send-login-otp', { email });
      setOtpSent(true);
      toast.success(res.data.message || 'OTP sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/verify-login-otp', { email, otp });
      const { token, user: userData } = res.data.data;

      // Update global auth context manually since we bypassed the standard context login
      updateUser({ ...userData, token });
      toast.success('Login successful!');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-lg shadow-indigo-500/20 mb-5">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Or{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              create a new account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100">

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-2.5"
              >
                <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {!isOtpMode ? (
                <motion.form
                  key="password-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                  onSubmit={handlePasswordLogin}
                >
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                      Email address
                    </label>
                    <div className="mt-1.5 relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email address"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white sm:text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                        Password
                      </label>
                      <Link to="/forgot-password" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                        Forgot your password?
                      </Link>
                    </div>
                    <div className="mt-1.5 relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="password"
                        name="password"
                        type={showPw ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="********"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white sm:text-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm shadow-indigo-500/20 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>Sign in <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                  onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
                >
                  <div>
                    <label htmlFor="email-otp" className="block text-sm font-semibold text-gray-700">
                      Email address
                    </label>
                    <div className="mt-1.5 relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="email-otp"
                        name="email"
                        type="email"
                        placeholder="Email address"
                        required
                        disabled={otpSent}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white sm:text-sm transition-all disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  {otpSent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">
                        One-Time Password (OTP)
                      </label>
                      <div className="mt-1.5 relative">
                        <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="otp"
                          name="otp"
                          type="text"
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="123456"
                          className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white sm:text-sm transition-all tracking-widest"
                        />
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm shadow-indigo-500/20 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : otpSent ? (
                        <>Verify OTP & Sign In <ArrowRight className="w-4 h-4" /></>
                      ) : (
                        'Send OTP'
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-400 font-medium">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    setIsOtpMode(!isOtpMode);
                    setError('');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 rounded-lg shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  {isOtpMode ? <Lock className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
                  {isOtpMode ? 'Password Login' : 'OTP Login'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;