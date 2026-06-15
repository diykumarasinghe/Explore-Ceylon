import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { Compass, Mail, Lock, User, AlertCircle, ArrowRight, Phone } from 'lucide-react';

export const Register: React.FC = () => {
  const { register, currentUser } = useTravel();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'customer' | 'admin' | 'guide'>('customer');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto redirect if already logged in
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') navigate('/admin');
      else if (currentUser.role === 'guide') navigate('/guide');
      else navigate('/customer');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !password) {
      setErrorMsg('Please fill in all fields including name, email, and password.');
      return;
    }

    try {
      await register(name, email, password, role, phoneNumber);
    } catch (err: any) {
      console.error('Registration Error:', err);
      let errMsg = 'Failed to create account. Admin account might already exist.';
      if (err.response?.data?.message) {
        errMsg = Array.isArray(err.response.data.message) 
          ? err.response.data.message.join(', ') 
          : err.response.data.message;
      } else if (err.message) {
        errMsg = err.message;
      }
      setErrorMsg(errMsg);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <Compass className="h-12 w-12 text-primary-blue animate-spin-slow" />
          </div>
          <h2 className="mt-4 text-3xl font-black text-deep-navy">Create Account</h2>
          <p className="mt-1.5 text-xs text-text-gray font-semibold">
            Join Explore Ceylon to start planning your Sri Lankan holiday.
          </p>
        </div>

        {/* Register Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="bg-red-50 text-error-red border border-red-100 rounded-xl p-3.5 flex items-start space-x-2 text-xs font-semibold leading-normal">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Alice Smith"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-blue text-slate-700 font-semibold transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="alice@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-blue text-slate-700 font-semibold transition-all"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+94 77 123 4567"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-blue text-slate-700 font-semibold transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-blue text-slate-700 font-semibold transition-all"
                />
              </div>
            </div>

            {/* Role Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Join As</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-blue text-slate-700 font-semibold cursor-pointer"
              >
                <option value="customer">Tourist / Traveler</option>
                <option value="admin">Administrator (Demo)</option>
                <option value="guide">Professional Tour Guide</option>
              </select>
              <p className="text-[10px] text-text-gray font-medium leading-normal">
                Demo role allows you to test Admin capabilities or Guide tour tracking features.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary-blue hover:bg-sky-500 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5"
          >
            <span>Create Account</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-xs text-text-gray font-semibold">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-blue hover:underline font-bold">
            Sign In Instead
          </Link>
        </p>
      </div>
    </div>
  );
};
