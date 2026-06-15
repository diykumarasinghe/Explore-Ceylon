import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { Compass, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { resetPassword } = useTravel();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setIsLoading(true);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('New password and confirm password must match.');
      setIsLoading(false);
      return;
    }

    if (!token) {
      setErrorMsg('Invalid or missing password reset token.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await resetPassword(token, password);
      if (result.success) {
        setSuccessMsg('Password has been reset successfully. Redirecting to login...');
        setPassword('');
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
            Please enter your new password below.
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
            <h4 className="font-extrabold text-sm text-slate-800">Success!</h4>
            <p className="text-xs text-slate-500 font-semibold leading-normal">{successMsg}</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-blue hover:bg-sky-500 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Resetting...' : 'Reset Password'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
