import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import {
  ArrowLeft, User, Mail, Camera, Shield,
  Key, AlertCircle, CheckCircle, Phone, Loader, Eye, EyeOff,
  Calendar, ImagePlus, Save, Lock
} from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { authApi } from '../services/api';

export const Profile: React.FC = () => {
  const { currentUser, updateProfile } = useTravel();

  if (!currentUser) return null;

  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDashboardPath = () => {
    if (currentUser.role === 'admin') return '/admin';
    if (currentUser.role === 'guide') return '/guide';
    return '/customer';
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setSuccessMsg('');
  };

  const processImageFile = async (file: File) => {
    setUploading(true);
    setErrorMsg('');
    try {
      const res = await authApi.uploadImage(file);
      setAvatar(res.data.url);
      showSuccess('Photo uploaded. Click "Save Profile" to apply.');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    await processImageFile(e.target.files[0]);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setIsUpdating(true);

    if (!name.trim()) {
      showError('Display name cannot be empty.');
      setIsUpdating(false);
      return;
    }

    const success = await updateProfile(name, avatar, phoneNumber);
    setIsUpdating(false);
    if (success) {
      showSuccess('Profile updated successfully!');
    } else {
      showError('Failed to update profile details.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!currentPassword) {
      showError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      showError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      showSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const roleLabel =
    currentUser.role === 'customer' ? 'Tourist / Traveler' :
    currentUser.role === 'guide' ? 'Tour Guide' :
    'Admin Portal';

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Back Button */}
      <div className="relative">
        <Link
          to={getDashboardPath()}
          className="absolute -left-14 top-0 hidden xl:flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:text-primary-blue hover:border-primary-blue hover:shadow-md rounded-full p-2.5 transition-all shadow-xs w-10 h-10"
          title="Back to Dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Link
          to={getDashboardPath()}
          className="flex xl:hidden items-center justify-center bg-white border border-slate-200 text-slate-600 hover:text-primary-blue hover:border-primary-blue hover:shadow-md rounded-full p-2.5 transition-all shadow-xs w-10 h-10 mb-4"
          title="Back to Dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <SectionHeader
        title="My Profile Settings"
        subtitle="Manage your personal details, update your avatar, and handle security credentials."
        badge="Account Settings"
      />

      {/* Success/Error Alerts */}
      {successMsg && (
        <div className="bg-emerald-50 text-success-green border border-emerald-100 rounded-2xl p-4 flex items-start space-x-2 text-xs font-semibold leading-normal animate-fade-in">
          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 text-error-red border border-red-100 rounded-2xl p-4 flex items-start space-x-2 text-xs font-semibold leading-normal animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Profile Summary + Avatar Upload */}
        <div className="lg:col-span-4 space-y-5">
          {/* Profile Summary Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col items-center text-center space-y-4">
            <h3 className="text-sm font-black text-deep-navy w-full text-left flex items-center space-x-2">
              <User className="h-4 w-4 text-primary-blue" />
              <span>Profile Summary</span>
            </h3>

            {/* Avatar with camera overlay */}
            <div className="relative group">
              <img
                src={avatar}
                alt={currentUser.name}
                className="w-28 h-28 rounded-full border-4 border-primary-blue object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
              />
              <label
                htmlFor="summary-avatar-upload"
                className="absolute inset-0 bg-slate-900/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
              >
                {uploading ? (
                  <Loader className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <Camera className="h-6 w-6" />
                )}
              </label>
              <input
                id="summary-avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
                ref={fileInputRef}
              />
              {/* Camera badge */}
              <label
                htmlFor="summary-avatar-upload"
                className="absolute bottom-1 right-1 w-7 h-7 bg-primary-blue rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-sky-500 transition-colors"
              >
                <Camera className="h-3.5 w-3.5 text-white" />
              </label>
            </div>

            <div>
              <h4 className="text-base font-black text-deep-navy">{currentUser.name}</h4>
              <p className="text-xs text-text-gray font-semibold mt-0.5">{currentUser.email}</p>
              <span className="mt-2.5 inline-block text-[9px] uppercase font-black tracking-widest text-primary-blue bg-sky-50 border border-sky-100 px-3 py-1 rounded-full">
                {roleLabel}
              </span>
            </div>

            <div className="w-full border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500 text-left space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Shield className="h-3.5 w-3.5 text-slate-400" />
                  <span>Account Status</span>
                </span>
                <span className="text-emerald-600 font-bold">Active Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Member Since</span>
                </span>
                <span className="text-slate-700 font-bold">June 2026</span>
              </div>
            </div>
          </div>

          {/* Avatar Image Upload Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-deep-navy flex items-center space-x-2">
              <ImagePlus className="h-4 w-4 text-primary-blue" />
              <span>Avatar Image</span>
            </h3>

            {/* Drag & Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-primary-blue bg-sky-50 scale-[1.02]'
                  : 'border-slate-200 hover:border-primary-blue hover:bg-slate-50'
              }`}
            >
              {uploading ? (
                <>
                  <Loader className="h-8 w-8 text-primary-blue animate-spin mb-2" />
                  <p className="text-xs font-bold text-primary-blue">Uploading...</p>
                </>
              ) : (
                <>
                  <ImagePlus className={`h-8 w-8 mb-2 ${isDragOver ? 'text-primary-blue' : 'text-slate-300'}`} />
                  <p className="text-xs font-bold text-slate-600">Drag and drop an image here</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">or click to browse</p>
                </>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">JPG, PNG or WEBP. Max size 2MB.</p>
          </div>
        </div>

        {/* Right Column: Profile Info + Password */}
        <div className="lg:col-span-8 space-y-5">
          {/* Profile Information Form */}
          <form onSubmit={handleUpdateProfile} className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-base font-black text-deep-navy flex items-center space-x-2">
              <User className="h-5 w-5 text-primary-blue" />
              <span>Profile Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    id="profile-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-blue text-slate-700 font-semibold transition-all"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    id="profile-phone"
                    placeholder="+94 77 123 4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-blue text-slate-700 font-semibold transition-all"
                  />
                </div>
              </div>

              {/* Email (Read Only) */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 font-semibold focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                id="save-profile-btn"
                disabled={isUpdating}
                className="bg-primary-blue hover:bg-sky-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isUpdating ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>

          {/* Security / Change Password Card */}
          <form onSubmit={handleChangePassword} className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <h3 className="text-base font-black text-deep-navy flex items-center space-x-2">
              <Lock className="h-5 w-5 text-primary-blue" />
              <span>Security / Change Password</span>
            </h3>

            <div className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    id="current-password"
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-blue text-slate-700 font-semibold transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    id="new-password"
                    placeholder="Enter new password (min. 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-blue text-slate-700 font-semibold transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    id="confirm-password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-blue text-slate-700 font-semibold transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                id="change-password-btn"
                disabled={isChangingPassword}
                className="bg-deep-navy hover:bg-slate-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                <span>{isChangingPassword ? 'Changing...' : 'Change Password'}</span>
              </button>
            </div>

            <p className="text-[10.5px] text-slate-400 font-medium flex items-start space-x-1.5 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
              <span>Password update is optional. Leave password fields empty if you don't want to change it.</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
