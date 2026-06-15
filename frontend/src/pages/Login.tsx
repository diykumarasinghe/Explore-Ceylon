import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { Compass, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, currentUser } = useTravel();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // dummy field for UX
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto redirect if already logged in
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') navigate('/admin');
      else if (currentUser.role === 'guide') navigate('/guide');
      else navigate('/customer');
    }
  }, [currentUser, navigate]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errorMsg) setErrorMsg('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    if (!email) {
      setErrorMsg('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(email, password);
      if (!success) {
        setErrorMsg('Invalid credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <Compass className="h-12 w-12 text-primary-blue animate-spin-slow" />
          </div>
          <h2 className="mt-4 text-3xl font-black text-deep-navy">Welcome Back</h2>
          <p className="mt-1.5 text-xs text-text-gray font-semibold">
            Log in to manage bookings, view dashboards, and discover Ceylon.
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="bg-red-50 text-error-red border border-red-100 rounded-xl p-3.5 flex items-start space-x-2 text-xs font-semibold leading-normal">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="tourist@exploreceylon.lk"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isLoading}
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-blue text-slate-700 font-semibold transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-blue text-slate-700 font-semibold transition-all disabled:opacity-50"
                />
              </div>
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-primary-blue hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-blue hover:bg-sky-500 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? 'Logging In...' : 'Log In'}</span>
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center text-xs text-text-gray font-semibold">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-blue hover:underline font-bold">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};
