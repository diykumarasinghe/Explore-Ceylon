import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { Compass, Mail, Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const { forgotPassword } = useTravel();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Email is required.');
      return;
    }

    if (!newPassword) {
      setErrorMsg('New password is required.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Confirm password must match new password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await forgotPassword(email, newPassword);
      if (result.success) {
        setSuccessMsg(result.message);
        setEmail('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setErrorMsg(result.message);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to reset password.');
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
          <h2 className="mt-4 text-3xl font-black text-deep-navy">Reset Password</h2>
          <p className="mt-1.5 text-xs text-text-gray font-semibold">
            Enter your details below to reset your password.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-error-red border border-red-100 rounded-xl p-3.5 flex items-start space-x-2 text-xs font-semibold leading-normal">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg ? (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto w-12 h-12 bg-emerald-50 text-success-green rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-800">Password Updated</h4>
            <p className="text-xs text-slate-500 font-semibold leading-normal">{successMsg}</p>
            <p className="text-[10px] text-slate-400 font-medium">Redirecting to login page in 3 seconds...</p>
            <div className="pt-4">
              <Link
                to="/login"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-primary-blue hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Login</span>
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="tourist@exploreceylon.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-blue text-slate-700 font-semibold transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-blue text-slate-700 font-semibold transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-blue text-slate-700 font-semibold transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-blue hover:bg-sky-500 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 mt-6"
            >
              <span>{isLoading ? 'Resetting Password...' : 'Reset Password'}</span>
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-primary-blue hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
