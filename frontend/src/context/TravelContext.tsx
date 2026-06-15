import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Destination, Package, User, Booking } from '../types';
import { getDestinationImage, resolveImageUrl } from '../utils/imageResolver';
import {
  authApi,
  destinationsApi,
  packagesApi,
  bookingsApi,
  wishlistApi,
  paymentsApi,
  notificationsApi,
  tourGuidesApi,
  usersApi,
} from '../services/api';

interface TravelContextType {
  destinations: Destination[];
  packages: Package[];
  bookings: Booking[];
  users: User[];
  currentUser: User | null;
  wishlist: any[]; // Raw wishlist items
  notifications: any[];
  tourAssignments: any[];
  isLoading: boolean;
  
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: 'admin' | 'customer' | 'guide') => void;
  register: (name: string, email: string, password?: string, role?: 'admin' | 'customer' | 'guide', phoneNumber?: string) => Promise<void>;
  updateProfile: (name: string, avatar: string, phoneNumber?: string) => Promise<boolean>;
  forgotPassword: (email: string, newPassword?: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; message: string }>;
  
  // Destinations CRUD
  addDestination: (dest: Omit<Destination, 'id'>) => Promise<void>;
  updateDestination: (id: string, dest: Partial<Destination>) => Promise<void>;
  deleteDestination: (id: string) => Promise<void>;

  // Packages CRUD
  addPackage: (pkg: Omit<Package, 'id'>) => Promise<void>;
  updatePackage: (id: string, pkg: Partial<Package>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;

  // Bookings actions
  createBooking: (packageId: string, startDate: string, guestsCount: number, contactNumber?: string, specialRequests?: string) => Promise<any>;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  assignGuide: (bookingId: string, guideId: string) => Promise<void>;
  updateTourProgress: (bookingId: string, progress: string) => Promise<void>;
  adminReviewBooking: (bookingId: string, action: 'approve' | 'reject', guideId?: string) => Promise<void>;
  submitBookingPayment: (bookingId: string, paymentMethod: string, receiptFile: File) => Promise<void>;
  verifyBookingPayment: (bookingId: string, action: 'approve' | 'reject') => Promise<void>;
  updateGuideTourStatus: (bookingId: string, tourStatus: string, tourProgress?: string) => Promise<void>;
  guideDecisionBooking: (bookingId: string, action: 'accept' | 'reject', rejectionReason?: string) => Promise<void>;

  // Wishlist actions
  toggleWishlist: (packageId: string) => Promise<void>;
  isInWishlist: (packageId: string) => boolean;

  // Payments actions
  processPayment: (bookingId: string, method: string) => Promise<any>;
  confirmPayment: (bookingId: string, transactionId: string) => Promise<void>;

  // Notifications actions
  markNotificationRead: (id: string) => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const TravelContext = createContext<TravelContextType | undefined>(undefined);

// Adapters: Map Database models to Frontend Types
const mapDestination = (dbDest: any): Destination => ({
  id: dbDest._id,
  name: dbDest.name || dbDest.title || '',
  category: dbDest.category,
  description: dbDest.description,
  image: getDestinationImage(dbDest.image || (dbDest.images && dbDest.images[0]) || ''),
  location: dbDest.location,
  bestTimeToVisit: dbDest.bestTimeToVisit || '',
  activities: dbDest.activities || [],
  highlights: dbDest.highlights || [],
  budgetRange: dbDest.budgetRange || 'LKR 10,000 - 25,000',
  rating: dbDest.rating || 0,
});

const mapPackage = (dbPkg: any): Package => ({
  id: dbPkg._id,
  destinationId: dbPkg.destination?._id || dbPkg.destination || dbPkg.destinationId || '',
  name: dbPkg.name || dbPkg.title || '',
  description: dbPkg.description,
  image: getDestinationImage(dbPkg.image || (dbPkg.images && dbPkg.images[0]) || ''),
  price: dbPkg.price,
  durationDays: typeof dbPkg.duration === 'number' ? dbPkg.duration : parseInt(dbPkg.duration) || 3,
  duration: dbPkg.duration || `${typeof dbPkg.duration === 'number' ? dbPkg.duration : parseInt(dbPkg.duration) || 3} Days`,
  maxGroupSize: dbPkg.maxGroupSize || dbPkg.maxPeople || 10,
  includedServices: dbPkg.includedServices || dbPkg.includes || [],
  itinerary: dbPkg.itinerary || [],
  rating: dbPkg.rating || 5.0,
  category: dbPkg.category || dbPkg.destination?.category || 'Nature',
});

const mapUser = (dbUser: any): User => ({
  id: dbUser._id,
  name: dbUser.name,
  email: dbUser.email,
  role: dbUser.role.toLowerCase() === 'tour guide' ? 'guide' : (dbUser.role.toLowerCase() as any),
  avatar: resolveImageUrl(dbUser.profileImage || dbUser.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  phoneNumber: dbUser.phoneNumber || '',
});

const mapBooking = (dbBkg: any): Booking => {
  const getBookingDate = () => {
    const rawDate = dbBkg.bookingDate || dbBkg.createdAt;
    if (rawDate) {
      return new Date(rawDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return {
    id: dbBkg._id,
    packageId: dbBkg.package?._id || dbBkg.package || dbBkg.packageId || '',
    packageName: dbBkg.package?.title || dbBkg.package?.name || dbBkg.packageName || 'Ceylon Tour',
    packageImage: dbBkg.package?.image ? resolveImageUrl(dbBkg.package.image) : dbBkg.packageImage || '',
    customerId: dbBkg.customer?._id || dbBkg.customer || dbBkg.customerId || '',
    customerName: dbBkg.customer?.name || dbBkg.customerName || 'Customer',
    customerEmail: dbBkg.customer?.email || dbBkg.customerEmail || '',
    startDate: dbBkg.travelDate ? new Date(dbBkg.travelDate).toISOString().split('T')[0] : dbBkg.startDate || '',
    guestsCount: dbBkg.guestsCount || 1,
    totalAmount: dbBkg.totalAmount || 0,
    bookingStatus: dbBkg.bookingStatus,
    paymentStatus: dbBkg.paymentStatus,
    tourStatus: dbBkg.tourStatus,
    paymentReceipt: dbBkg.paymentReceipt,
    paymentMethod: dbBkg.paymentMethod,
    paymentDate: dbBkg.paymentDate,
    approvedBy: dbBkg.approvedBy?.name || dbBkg.approvedBy || '',
    approvedAt: dbBkg.approvedAt,
    assignedGuide: dbBkg.assignedGuide,
    guideDecision: dbBkg.guideDecision || 'PENDING',
    rejectionReason: dbBkg.rejectionReason || '',
    guideResponseAt: dbBkg.guideResponseAt,
    guideApprovedByAdmin: dbBkg.guideApprovedByAdmin ?? false,
    
    // Compatibility properties
    status: dbBkg.bookingStatus?.toLowerCase() as any,
    guideId: dbBkg.assignedGuide?._id || dbBkg.assignedGuide || '',
    guideName: dbBkg.assignedGuide?.name || '',
    guidePhone: dbBkg.assignedGuide?.phoneNumber || '',
    guideEmail: dbBkg.assignedGuide?.email || '',
    guideAvatar: dbBkg.assignedGuide?.profileImage ? resolveImageUrl(dbBkg.assignedGuide.profileImage) : '',
    customerPhone: dbBkg.customer?.phoneNumber || dbBkg.customerPhone || '',
    bookingDate: getBookingDate(),
    tourProgress: dbBkg.tourProgress || '',
  };
};

const getWishlistPackageId = (item: any): string => {
  if (!item) return '';
  return (
    item.package?._id ||
    item.package?.id ||
    item.package ||
    item.packageId
  )?.toString() || '';
};

export const TravelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [tourAssignments, setTourAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Per-package in-flight lock: prevents duplicate concurrent POST/DELETE calls
  const wishlistInFlight = useRef<Set<string>>(new Set());

  // Initial load check for token and base data
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        // Fetch public destinations and packages
        const [dRes, pRes] = await Promise.all([
          destinationsApi.getDestinations(),
          packagesApi.getPackages(),
        ]);
        setDestinations(dRes.data.map(mapDestination));
        setPackages(pRes.data.map(mapPackage));

        // Check token
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const profileRes = await authApi.getProfile();
            const loggedInUser = mapUser(profileRes.data);
            setCurrentUser(loggedInUser);
            await fetchUserData(loggedInUser);
          } catch (e) {
            console.error('Session restore failed. Clearing credentials.', e);
            localStorage.removeItem('token');
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  const fetchWishlist = async () => {
    try {
      const wRes = await wishlistApi.getWishlist();
      const listData = wRes.data && wRes.data.success ? wRes.data.data : wRes.data;
      setWishlist(Array.isArray(listData) ? listData : []);
    } catch (e) {
      console.error('Error fetching wishlist:', e);
    }
  };

  const fetchUserData = async (user: User) => {
    try {
      // Fetch bookings (if user has permissions)
      const bRes = await bookingsApi.getBookings();
      const mappedBookings = bRes.data.map(mapBooking);
      mappedBookings.sort((a: any, b: any) => b.id.localeCompare(a.id));
      setBookings(mappedBookings);

      // Fetch notifications
      const nRes = await notificationsApi.getNotifications();
      setNotifications(nRes.data);

      if (user.role === 'customer') {
        await fetchWishlist();
      }

      if (user.role === 'guide') {
        const aRes = await tourGuidesApi.getAssignments();
        setTourAssignments(aRes.data);
      }

      if (user.role === 'admin') {
        const uRes = await usersApi.getUsers();
        setUsers(uRes.data.map(mapUser));
      }
    } catch (err) {
      console.error('Error fetching user context details:', err);
    }
  };

  const refreshAllData = async () => {
    if (currentUser) {
      await fetchUserData(currentUser);
    }
    const [dRes, pRes] = await Promise.all([
      destinationsApi.getDestinations(),
      packagesApi.getPackages(),
    ]);
    setDestinations(dRes.data.map(mapDestination));
    setPackages(pRes.data.map(mapPackage));
  };

  // Auth Methods
  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      console.log('[TravelContext] Initiating login request for email:', email);
      const response = await authApi.login({ email, password });
      console.log('[TravelContext] Login response status:', response.status);
      console.log('[TravelContext] Login response body:', response.data);
      const { accessToken, user } = response.data;
      console.log('[TravelContext] Token received:', accessToken);
      
      localStorage.setItem('token', accessToken);
      const mapped = mapUser(user);
      setCurrentUser(mapped);
      await fetchUserData(mapped);
      return true;
    } catch (err: any) {
      console.error('[TravelContext] Login request failed:', err);
      if (err.response) {
        console.error('[TravelContext] Login error response status:', err.response.status);
        console.error('[TravelContext] Login error response body:', err.response.data);
      }
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.clear();
    sessionStorage.clear();
    setBookings([]);
    setWishlist([]);
    setNotifications([]);
    setTourAssignments([]);
    setUsers([]);
    window.location.href = '/login';
  };

  const switchRole = async (role: 'admin' | 'customer' | 'guide') => {
    // Determine target email for sandbox context
    const credentials = {
      admin: { email: 'admin@exploreceylon.lk', password: 'admin123' },
      customer: { email: 'tourist@exploreceylon.lk', password: 'tourist123' },
      guide: { email: 'guide@exploreceylon.lk', password: 'guide123' }
    };
    const cred = credentials[role];
    await login(cred.email, cred.password);
  };

  const register = async (name: string, email: string, password?: string, role?: 'admin' | 'customer' | 'guide', phoneNumber?: string) => {
    try {
      await authApi.register({ name, email, password, role: role || 'customer', phoneNumber });
      await login(email, password);
    } catch (err) {
      console.error('Registration failed:', err);
      throw err;
    }
  };

  const updateProfile = async (name: string, avatar: string, phoneNumber?: string): Promise<boolean> => {
    try {
      const response = await authApi.updateProfile({ name, profileImage: avatar, phoneNumber });
      const updatedUser = mapUser(response.data);
      setCurrentUser(updatedUser);
      await refreshAllData();
      return true;
    } catch (err) {
      console.error('Failed to update profile:', err);
      return false;
    }
  };

  const forgotPassword = async (email: string, newPassword?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authApi.forgotPasswordReset({ email, newPassword });
      return { success: true, message: response.data.message || 'If an account exists with this email, the password has been updated.' };
    } catch (err: any) {
      console.error('Forgot password reset failed:', err);
      return { success: false, message: err.response?.data?.message || 'Failed to reset password.' };
    }
  };

  const resetPassword = async (token: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authApi.resetPassword(token, password);
      return { success: true, message: response.data.message || 'Password has been reset successfully.' };
    } catch (err: any) {
      console.error('Reset password failed:', err);
      return { success: false, message: err.response?.data?.message || 'Failed to reset password.' };
    }
  };

  // Destinations CRUD
  const addDestination = async (dest: Omit<Destination, 'id'>) => {
    // Map properties to backend: name is name
    await destinationsApi.createDestination({
      name: dest.name,
      location: dest.location,
      category: dest.category,
      description: dest.description,
      image: dest.image,
      bestTimeToVisit: dest.bestTimeToVisit,
      activities: dest.activities,
      highlights: dest.highlights,
      budgetRange: dest.budgetRange,
    });
    await refreshAllData();
  };

  const updateDestination = async (id: string, dest: Partial<Destination>) => {
    await destinationsApi.updateDestination(id, dest);
    await refreshAllData();
  };

  const deleteDestination = async (id: string) => {
    await destinationsApi.deleteDestination(id);
    await refreshAllData();
  };

  // Packages CRUD
  const addPackage = async (pkg: Omit<Package, 'id'>) => {
    await packagesApi.createPackage({
      title: pkg.name,
      destination: pkg.destinationId,
      description: pkg.description,
      duration: `${pkg.durationDays} Days`,
      price: pkg.price,
      maxPeople: pkg.maxGroupSize,
      image: pkg.image,
      highlights: pkg.includedServices,
      includedServices: pkg.includedServices,
      itinerary: pkg.itinerary,
    });
    await refreshAllData();
  };

  const updatePackage = async (id: string, pkg: Partial<Package>) => {
    const backendData: any = {};
    if (pkg.name) backendData.title = pkg.name;
    if (pkg.description) backendData.description = pkg.description;
    if (pkg.price) backendData.price = pkg.price;
    if (pkg.image) backendData.image = pkg.image;
    if (pkg.durationDays) backendData.duration = `${pkg.durationDays} Days`;
    if (pkg.maxGroupSize) backendData.maxPeople = pkg.maxGroupSize;
    if (pkg.includedServices) backendData.includedServices = pkg.includedServices;
    if (pkg.itinerary) backendData.itinerary = pkg.itinerary;

    await packagesApi.updatePackage(id, backendData);
    await refreshAllData();
  };

  const deletePackage = async (id: string) => {
    await packagesApi.deletePackage(id);
    await refreshAllData();
  };

  // Bookings Methods
  const createBooking = async (packageId: string, startDate: string, guestsCount: number, contactNumber?: string, specialRequests?: string): Promise<any> => {
    if (!currentUser) return false;
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return false;

    try {
      const response = await bookingsApi.createBooking({
        package: packageId,
        travelDate: startDate,
        totalAmount: pkg.price * guestsCount,
        guestsCount,
        contactNumber,
        specialRequests,
      });
      await refreshAllData();
      return response.data;
    } catch (err) {
      console.error('Create booking failed:', err);
      return false;
    }
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    if (currentUser?.role === 'guide' && status === 'completed') {
      const assignment = tourAssignments.find(a => a.booking?._id === bookingId);
      if (assignment) {
        await tourGuidesApi.updateProgress(assignment._id, { status: 'Completed' });
      }
    } else {
      const statusMap: Record<string, string> = {
        pending: 'PENDING',
        awaiting_guide_assignment: 'AWAITING_GUIDE_ASSIGNMENT',
        guide_assigned: 'GUIDE_ASSIGNED',
        guide_accepted: 'GUIDE_ACCEPTED',
        guide_rejected: 'GUIDE_REJECTED',
        confirmed: 'CONFIRMED',
        ongoing: 'ONGOING',
        completed: 'COMPLETED',
        cancelled: 'CANCELLED',
      };
      await bookingsApi.updateStatus(bookingId, statusMap[status]);
    }
    await refreshAllData();
  };

  const assignGuide = async (bookingId: string, guideId: string) => {
    await tourGuidesApi.assignGuide(bookingId, guideId);
    await refreshAllData();
  };

  const updateTourProgress = async (bookingId: string, progress: string) => {
    // Find guide assignment
    const assignment = tourAssignments.find(a => a.booking?._id === bookingId);
    if (assignment) {
      await tourGuidesApi.updateProgress(assignment._id, { tourProgress: progress });
      await refreshAllData();
    }
  };

  // Wishlist Methods
  const toggleWishlist = async (packageId: string) => {
    if (!currentUser) return;

    // Guard: prevent concurrent calls for the same package (e.g. rapid double-click)
    if (wishlistInFlight.current.has(packageId)) {
      console.warn('[Wishlist] toggleWishlist already in-flight for packageId:', packageId);
      return;
    }
    wishlistInFlight.current.add(packageId);

    try {
      console.log('[Wishlist] POST wishlist called with:', packageId);
      console.trace('[Wishlist] Wishlist POST trace');

      // Always fetch latest state from server first to avoid stale-state 409 conflicts
      const freshRes = await wishlistApi.getWishlist();
      const freshList = freshRes.data && freshRes.data.success ? freshRes.data.data : freshRes.data;
      const freshWishlist: any[] = Array.isArray(freshList) ? freshList : [];

      // Normalise every ID to a plain string for reliable comparison
      const normalise = (id: any): string => (id?._id ?? id?.id ?? id)?.toString?.() ?? '';

      const alreadyInWishlist = freshWishlist.some(
        (item: any) => normalise(item.package) === packageId.toString()
      );

      console.log('[Wishlist] alreadyInWishlist:', alreadyInWishlist, 'for packageId:', packageId);

      if (alreadyInWishlist) {
        console.log('[Wishlist] Calling DELETE /wishlist/' + packageId);
        await wishlistApi.removeFromWishlist(packageId);
      } else {
        console.log('[Wishlist] Calling POST /wishlist with packageId:', packageId);
        await wishlistApi.addToWishlist(packageId);
      }

      await fetchWishlist();
    } catch (err: any) {
      // 409 means already exists — refresh local state to stay in sync
      if (err.response?.status === 409) {
        console.warn('[Wishlist] 409 Conflict — item already in wishlist, syncing local state.');
        await fetchWishlist();
        return;
      }
      console.error('[Wishlist] toggleWishlist error:', err);
    } finally {
      // Always release the lock so the user can toggle again
      wishlistInFlight.current.delete(packageId);
    }
  };

  const isInWishlist = (packageId: string): boolean => {
    if (!packageId) return false;
    return wishlist.some(
      (item: any) => getWishlistPackageId(item)?.toString() === packageId.toString()
    );
  };

  // Payments Action
  const processPayment = async (bookingId: string, method: string): Promise<any> => {
    try {
      // 1. Create transaction log
      const pRes = await paymentsApi.createPayment(bookingId, method);
      const { transactionId, redirectUrl } = pRes.data;

      if (method === 'Stripe' && redirectUrl) {
        return { transactionId, redirectUrl };
      }

      // 2. Confirm transaction
      await paymentsApi.confirmPayment(bookingId, transactionId);
      await refreshAllData();
      return { transactionId };
    } catch (err) {
      console.error('Simulated payment error:', err);
      throw err;
    }
  };

  const confirmPayment = async (bookingId: string, transactionId: string): Promise<void> => {
    try {
      await paymentsApi.confirmPayment(bookingId, transactionId);
      await refreshAllData();
    } catch (err) {
      console.error('Payment confirmation error:', err);
      throw err;
    }
  };

  const adminReviewBooking = async (bookingId: string, action: 'approve' | 'reject', guideId?: string) => {
    await bookingsApi.adminReview(bookingId, action, guideId);
    await refreshAllData();
  };

  const submitBookingPayment = async (bookingId: string, paymentMethod: string, receiptFile: File) => {
    await bookingsApi.submitPayment(bookingId, paymentMethod, receiptFile);
    await refreshAllData();
  };

  const verifyBookingPayment = async (bookingId: string, action: 'approve' | 'reject') => {
    await bookingsApi.verifyPayment(bookingId, action);
    await refreshAllData();
  };

  const updateGuideTourStatus = async (bookingId: string, tourStatus: string, tourProgress?: string) => {
    await bookingsApi.updateTourStatus(bookingId, tourStatus, tourProgress);
    await refreshAllData();
  };

  const guideDecisionBooking = async (bookingId: string, action: 'accept' | 'reject', rejectionReason?: string) => {
    await bookingsApi.guideDecision(bookingId, action, rejectionReason);
    await refreshAllData();
  };

  // Mark notification read
  const markNotificationRead = async (id: string) => {
    await notificationsApi.markAsRead(id);
    await refreshAllData();
  };

  return (
    <TravelContext.Provider
      value={{
        destinations,
        packages,
        bookings,
        users,
        currentUser,
        wishlist,
        notifications,
        tourAssignments,
        isLoading,
        login,
        logout,
        switchRole,
        register,
        updateProfile,
        forgotPassword,
        resetPassword,
        addDestination,
        updateDestination,
        deleteDestination,
        addPackage,
        updatePackage,
        deletePackage,
        createBooking,
        updateBookingStatus,
        assignGuide,
        updateTourProgress,
        adminReviewBooking,
        submitBookingPayment,
        verifyBookingPayment,
        updateGuideTourStatus,
        guideDecisionBooking,
        toggleWishlist,
        isInWishlist,
        processPayment,
        confirmPayment,
        markNotificationRead,
        refreshAllData,
      }}
    >
      {children}
    </TravelContext.Provider>
  );
};

export const useTravel = () => {
  const context = useContext(TravelContext);
  if (context === undefined) {
    throw new Error('useTravel must be used within a TravelProvider');
  }
  return context;
};
