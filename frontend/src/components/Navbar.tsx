import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { Compass, Menu, X, LogOut, Heart, LayoutDashboard, Bell, Check } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, logout, wishlist, notifications, markNotificationRead } = useTravel();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns on route change
  useEffect(() => {
    setShowNotifications(false);
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'admin') return '/admin';
    if (currentUser.role === 'guide') return '/guide';
    return '/customer';
  };

  const unreadNotifications = (notifications || []).filter((n: any) => !n.isRead);

  return (
    <nav className="bg-deep-navy text-white sticky top-0 z-50 shadow-md">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 w-full">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold tracking-wider text-primary-blue hover:text-white transition duration-300">
              <Compass className="h-8 text-aqua-accent animate-spin-slow" />
              <span>Explore <span className="text-white font-extrabold">Ceylon</span></span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8 text-sm font-medium">
            <Link to="/" className={`hover:text-aqua-accent transition-colors py-2 ${isActive('/') ? 'text-aqua-accent border-b-2 border-aqua-accent' : 'text-slate-300'}`}>
              Home
            </Link>
            <Link to="/destinations" className={`hover:text-aqua-accent transition-colors py-2 ${isActive('/destinations') ? 'text-aqua-accent border-b-2 border-aqua-accent' : 'text-slate-300'}`}>
              Destinations
            </Link>
            <Link to="/packages" className={`hover:text-aqua-accent transition-colors py-2 ${isActive('/packages') ? 'text-aqua-accent border-b-2 border-aqua-accent' : 'text-slate-300'}`}>
              Packages
            </Link>
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                {/* Wishlist Link (only for customers) */}
                {currentUser.role === 'customer' && (
                  <Link to="/wishlist" className="text-slate-300 hover:text-red-500 relative transition-colors p-1" title="Wishlist">
                    <Heart className="h-5 w-5" />
                    {wishlist.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>
                )}

                {/* Dashboard Link */}
                <Link to={getDashboardPath()} className="text-slate-300 hover:text-aqua-accent transition-colors p-1" title="Dashboard">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="text-slate-300 hover:text-aqua-accent relative transition-colors p-1 focus:outline-none cursor-pointer flex items-center"
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-bold animate-pulse">
                        {unreadNotifications.length}
                      </span>
                    )}
                  </button>

                  {/* Dropdown panel */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden text-slate-800 animate-fade-in">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
                        <span className="font-extrabold text-xs text-deep-navy">Notifications</span>
                        {unreadNotifications.length > 0 && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                            {unreadNotifications.length} New
                          </span>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                        {notifications && notifications.length > 0 ? (
                          notifications.map((n: any) => (
                            <div key={n._id} className={`p-3 text-xs flex items-start justify-between space-x-2.5 transition-colors ${!n.isRead ? 'bg-sky-50/40' : 'hover:bg-slate-50'}`}>
                              <div className="space-y-0.5 flex-grow text-left">
                                <p className={`leading-normal ${!n.isRead ? 'font-bold text-slate-850' : 'text-slate-600 font-medium'}`}>{n.message}</p>
                                <span className="text-[9px] text-slate-400 font-semibold">{new Date(n.createdAt).toLocaleDateString()}</span>
                              </div>
                              {!n.isRead && (
                                <button
                                  onClick={() => markNotificationRead(n._id)}
                                  className="text-primary-blue hover:text-emerald-600 p-0.5 border border-slate-200 hover:border-emerald-200 bg-white rounded-md shrink-0 cursor-pointer"
                                  title="Mark as read"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-xs text-slate-400 font-semibold italic">
                            No notifications yet
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User info (link to Profile) */}
                <Link to="/profile" className="flex items-center space-x-2 hover:opacity-85 transition-opacity" title="Profile Settings">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full border border-aqua-accent object-cover"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold leading-tight">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{currentUser.role === 'customer' ? 'Tourist' : currentUser.role}</p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-slate-300 hover:text-red-400 text-sm font-semibold transition-colors duration-300 border border-slate-700 rounded-lg px-2.5 py-1 hover:border-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors py-1.5 px-3">
                  Log In
                </Link>
                <Link to="/register" className="text-sm font-semibold bg-primary-blue hover:bg-sky-500 text-white rounded-lg py-1.5 px-4 transition-all shadow-md">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 rounded-md hover:text-aqua-accent focus:outline-none text-slate-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Home
          </Link>
          <Link
            to="/destinations"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Destinations
          </Link>
          <Link
            to="/packages"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Packages
          </Link>

          {currentUser ? (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex items-center px-3 space-x-3 mb-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full border border-aqua-accent object-cover"
                />
                <div>
                  <p className="text-sm font-semibold">{currentUser.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{currentUser.role}</p>
                </div>
              </div>

              {currentUser.role === 'customer' && (
                <>
                  <Link
                    to="/wishlist"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <Heart className="h-5 w-5 text-red-500" />
                    <span>My Wishlist ({wishlist.length})</span>
                  </Link>
                  <Link
                    to="/customer"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span>My Dashboard</span>
                  </Link>
                </>
              )}

              {currentUser.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              {currentUser.role === 'guide' && (
                <Link
                  to="/guide"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Guide Dashboard</span>
                </Link>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-slate-800"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-800 flex flex-col space-y-2 px-3">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="text-center py-2 rounded-md font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="text-center py-2 bg-primary-blue hover:bg-sky-500 text-white rounded-md font-semibold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
