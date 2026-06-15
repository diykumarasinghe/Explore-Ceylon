import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { 
  LayoutDashboard, MapPin, Compass, FileText, 
  Calendar, Heart, LogOut, Menu, X, UserCheck, User,
  Home, Star, MessageSquare, Bell, ChevronDown, BookOpen, Check
} from 'lucide-react';
import { messagesApi } from '../services/api';

export const DashboardLayout: React.FC = () => {
  const { currentUser, logout, notifications, markNotificationRead } = useTravel();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Dropdown states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'customer' && currentUser.role !== 'guide')) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const response = await messagesApi.getUnreadCount();
        setUnreadCount(response.data.count);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.notifications-menu-btn') && !target.closest('.notifications-dropdown')) {
        setShowNotifications(false);
      }
      if (!target.closest('.user-menu-btn') && !target.closest('.user-dropdown')) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Smooth scroll to element on hash change
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.hash]);

  if (!currentUser) {
    // Redirect if not logged in
    React.useEffect(() => {
      navigate('/login');
    }, [currentUser, navigate]);
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getBreadcrumbTitle = (pathname: string) => {
    switch (pathname) {
      case '/profile':
        return 'Account Settings';
      case '/customer':
      case '/admin':
      case '/guide':
        return 'Overview';
      case '/customer/bookings':
        return 'My Bookings';
      case '/customer/messages':
      case '/guide/messages':
        return 'Messages';
      case '/wishlist':
        return 'My Wishlist';
      case '/admin/destinations':
        return 'Manage Destinations';
      case '/admin/packages':
        return 'Manage Packages';
      case '/admin/bookings':
        return 'Manage Bookings';
      case '/admin/reports':
        return 'Reports & Stats';
      case '/guide/tours':
        return 'Assigned Tours';
      default:
        return 'Overview';
    }
  };

  const unreadNotifications = (notifications || []).filter((n: any) => !n.isRead);

  // Grouped Navigation Links by role
  const getGroupedLinks = () => {
    const role = currentUser.role;
    const groups = [];

    // Group 1: MAIN MENU
    const mainMenu = {
      title: 'MAIN MENU',
      items: [] as any[]
    };

    if (role === 'admin') {
      mainMenu.items.push(
        { label: 'Overview', path: '/admin', icon: LayoutDashboard },
        { label: 'Manage Destinations', path: '/admin/destinations', icon: MapPin },
        { label: 'Manage Packages', path: '/admin/packages', icon: Compass },
        { label: 'Manage Bookings', path: '/admin/bookings', icon: Calendar },
        { label: 'Reports & Stats', path: '/admin/reports', icon: FileText }
      );
    } else if (role === 'guide') {
      mainMenu.items.push(
        { label: 'Overview', path: '/guide', icon: LayoutDashboard },
        { label: 'Assigned Tours', path: '/guide/tours', icon: UserCheck },
        { label: 'Messages', path: '/guide/messages', icon: MessageSquare }
      );
    } else {
      // Customer
      mainMenu.items.push(
        { label: 'Dashboard', path: '/customer', icon: LayoutDashboard },
        { label: 'Recommendations', path: '/customer#recommendations', icon: Star },
        { label: 'My Bookings', path: '/customer/bookings', icon: Calendar },
        { label: 'Messages', path: '/customer/messages', icon: MessageSquare },
        { label: 'Wishlist', path: '/wishlist', icon: Heart }
      );
    }
    groups.push(mainMenu);

    // Group 2: EXPLORE
    const exploreGroup = {
      title: 'EXPLORE',
      items: [
        { label: 'Destinations', path: '/destinations', icon: MapPin },
        { label: 'Packages', path: '/packages', icon: Compass },
      ]
    };
    if (role === 'customer') {
      exploreGroup.items.push({ label: 'Travel Guides', path: '/destinations', icon: BookOpen });
    }
    groups.push(exploreGroup);

    // Group 3: ACCOUNT
    const accountGroup = {
      title: 'ACCOUNT',
      items: [
        { label: 'Profile Settings', path: '/profile', icon: User },
        { label: 'Notifications', path: '#notifications', icon: Bell, badge: unreadNotifications.length },
      ]
    };
    groups.push(accountGroup);

    return groups;
  };

  const navGroups = getGroupedLinks();

  const roleLabel =
    currentUser.role === 'customer' ? 'Tourist / Traveler' :
    currentUser.role === 'guide' ? 'Tour Guide' :
    'Admin Portal';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="bg-deep-navy text-white px-4 py-3 flex items-center justify-between md:hidden border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold tracking-wider text-sm capitalize">{currentUser.role} Panel</span>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="text-xs font-bold bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 hover:text-white"
          >
            Home
          </Link>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-md text-slate-300 hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Sidebar Drawer Backdrop for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-deep-navy text-slate-350 z-50 transform transition-transform duration-300 ease-in-out border-r border-slate-800
        md:translate-x-0 md:static md:flex md:flex-col md:w-64 shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
          <Link to="/" className="flex items-center space-x-2 text-lg font-bold tracking-wider text-primary-blue hover:text-white transition duration-300">
            <Compass className="h-7 w-7 text-aqua-accent animate-spin-slow" />
            <span>Explore <span className="text-white font-extrabold">Ceylon</span></span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User profile details */}
        <div className="p-6 border-b border-slate-800 flex flex-col items-center text-center shrink-0">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-14 h-14 rounded-full border-2 border-slate-700 object-cover shadow-md"
            />
          </div>
          <h4 className="mt-3 text-sm font-extrabold text-white leading-tight">{currentUser.name}</h4>
          <p className="text-[11px] text-slate-400 font-semibold truncate w-full mt-0.5">{currentUser.email}</p>
          
          <span className="mt-2.5 text-[9px] uppercase font-black tracking-wider text-sky-400 bg-sky-950/60 border border-sky-850 px-3.5 py-1 rounded-full">
            {roleLabel}
          </span>
          
          {/* Online indicator */}
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-[10px] uppercase tracking-wider">Online</span>
          </div>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-grow p-4 space-y-5 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block">
                {group.title}
              </span>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isNotificationLink = item.path === '#notifications';
                  
                  // Compute active state
                  let active = false;
                  if (!isNotificationLink) {
                    if (item.path.includes('#')) {
                      const [basePath, hash] = item.path.split('#');
                      active = location.pathname === basePath && location.hash === `#${hash}`;
                    } else {
                      active = location.pathname === item.path && !location.hash;
                    }
                  }

                  const baseClass = "flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 group w-full cursor-pointer";
                  const activeClass = "bg-primary-blue text-white shadow-md font-bold";
                  const inactiveClass = "hover:bg-slate-800 hover:text-white text-slate-400";

                  const content = (
                    <>
                      <div className="flex items-center space-x-3 min-w-0">
                        <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-aqua-accent transition-colors'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.label === 'Messages' && unreadCount > 0 && (
                        <span className="bg-sky-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shrink-0">
                          {unreadCount}
                        </span>
                      )}
                      {isNotificationLink && item.badge > 0 && (
                        <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </>
                  );

                  if (isNotificationLink) {
                    return (
                      <button
                        key={item.label}
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`${baseClass} ${inactiveClass} notifications-menu-btn`}
                      >
                        {content}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`${baseClass} ${active ? activeClass : inactiveClass}`}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0 text-red-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content layout with Desktop Header */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-100 items-center justify-between px-8 sticky top-0 z-30 shrink-0">
          {/* Breadcrumbs & Back to Home Button */}
          <div className="flex items-center space-x-5">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
              <Link to="/" className="hover:text-primary-blue transition-colors flex items-center">
                <Home className="h-4 w-4" />
              </Link>
              <span className="text-slate-300 font-bold">&gt;</span>
              <span className="capitalize">{currentUser.role} Dashboard</span>
              <span className="text-slate-300 font-bold">&gt;</span>
              <span className="text-slate-700 font-black">{getBreadcrumbTitle(location.pathname)}</span>
            </div>

            {/* Back to Home Page button */}
            <Link
              to="/"
              className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 text-slate-655 hover:text-primary-blue hover:border-primary-blue rounded-xl text-xs font-bold transition-all bg-white shadow-2xs hover:shadow-xs"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Back to Home Page</span>
            </Link>
          </div>

          {/* Notifications & Profile dropdown */}
          <div className="flex items-center space-x-5">
            {/* Bell icon dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserDropdown(false);
                }}
                className="text-slate-400 hover:text-slate-600 relative transition-colors p-1.5 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center notifications-menu-btn"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 bg-amber-505 text-white bg-amber-500 rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-bold animate-pulse">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-150 rounded-2xl shadow-xl z-50 overflow-hidden text-slate-800 animate-fade-in notifications-dropdown">
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
                              className="text-primary-blue hover:text-emerald-600 p-0.5 border border-slate-200 hover:border-emerald-250 bg-white rounded-md shrink-0 cursor-pointer"
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

            {/* Profile Dropdown Widget */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-3 hover:bg-slate-50 p-1.5 rounded-xl transition-all cursor-pointer user-menu-btn"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover shadow-2xs"
                />
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-black text-slate-800 leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold capitalize">{currentUser.role === 'customer' ? 'Tourist' : currentUser.role}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-fade-in user-dropdown">
                  <Link
                    to="/profile"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center space-x-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Profile Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2.5 text-xs font-bold text-red-650 hover:bg-red-50/50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content displays here */}
        <main className="flex-1 overflow-y-auto min-h-screen px-4 py-6 sm:px-8 sm:py-8">
          <div className="max-w-6xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

