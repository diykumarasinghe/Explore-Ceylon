import axios from 'axios';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on the login page AND not calling the login endpoint
      const isLoginRequest = error.config && error.config.url && error.config.url.includes('/auth/login');
      const isAlreadyOnLoginPage = window.location.pathname === '/login';
      if (!isLoginRequest && !isAlreadyOnLoginPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authApi = {
  login: (credentials: { email: string; password?: string }) => 
    apiClient.post('/auth/login', { email: credentials.email, password: credentials.password || 'dummy-password' }),
  register: (data: { name: string; email: string; password?: string; role: string; phoneNumber?: string }) => {
    const roleMapping: Record<string, string> = {
      admin: 'Admin',
      customer: 'Customer',
      guide: 'Tour Guide',
    };
    const mappedRole = roleMapping[data.role] || data.role;
    return apiClient.post('/auth/register', { 
      ...data, 
      role: mappedRole, 
      password: data.password || 'dummy-password' 
    });
  },
  getProfile: () => apiClient.get('/auth/profile'),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  forgotPasswordReset: (data: { email: string; newPassword?: string }) => apiClient.post('/auth/forgot-password-reset', data),
  resetPassword: (token: string, password?: string) => apiClient.post(`/auth/reset-password/${token}`, { password }),
  updateProfile: (data: any) => apiClient.patch('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.patch('/auth/change-password', data),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/auth/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Users Service (Admin Management)
export const usersApi = {
  getUsers: () => apiClient.get('/users'),
  updateUser: (id: string, data: any) => apiClient.patch(`/users/${id}`, data),
};

// Destinations Service
export const destinationsApi = {
  getDestinations: () => apiClient.get('/destinations'),
  getDestination: (id: string) => apiClient.get(`/destinations/${id}`),
  createDestination: (data: any) => apiClient.post('/destinations', data),
  updateDestination: (id: string, data: any) => apiClient.patch(`/destinations/${id}`, data),
  deleteDestination: (id: string) => apiClient.delete(`/destinations/${id}`),
};

// Packages Service
export const packagesApi = {
  getPackages: () => apiClient.get('/packages'),
  getPackage: (id: string) => apiClient.get(`/packages/${id}`),
  createPackage: (data: any) => apiClient.post('/packages', data),
  updatePackage: (id: string, data: any) => apiClient.patch(`/packages/${id}`, data),
  deletePackage: (id: string) => apiClient.delete(`/packages/${id}`),
};

// Bookings Service
export const bookingsApi = {
  getBookings: () => apiClient.get('/bookings'),
  getBooking: (id: string) => apiClient.get(`/bookings/${id}`),
  createBooking: (data: { package: string; travelDate: string; totalAmount: number; guestsCount: number; contactNumber?: string; specialRequests?: string }) =>
    apiClient.post('/bookings', data),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/bookings/${id}`, { status }),
  adminReview: (id: string, action: 'approve' | 'reject', guideId?: string) =>
    apiClient.patch(`/bookings/${id}/admin-review`, { action, guideId }),
  submitPayment: (id: string, paymentMethod: string, receipt: File) => {
    const formData = new FormData();
    formData.append('paymentMethod', paymentMethod);
    formData.append('receipt', receipt);
    return apiClient.patch(`/bookings/${id}/submit-payment`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  verifyPayment: (id: string, action: 'approve' | 'reject') =>
    apiClient.patch(`/bookings/${id}/verify-payment`, { action }),
  updateTourStatus: (id: string, tourStatus: string, tourProgress?: string) =>
    apiClient.patch(`/bookings/${id}/tour-status`, { tourStatus, tourProgress }),
  guideDecision: (id: string, action: 'accept' | 'reject', rejectionReason?: string) =>
    apiClient.patch(`/bookings/${id}/guide-decision`, { action, rejectionReason }),
};

// Wishlist Service
export const wishlistApi = {
  getWishlist: () => apiClient.get('/wishlist'),
  // Send both field names — backend DTO accepts either `package` or `packageId`
  addToWishlist: (packageId: string) => {
    console.log('[api.ts:131] addToWishlist called with packageId:', packageId);
    return apiClient.post('/wishlist', { package: packageId, packageId });
  },
  removeFromWishlist: (packageId: string) => {
    console.log('[api.ts] removeFromWishlist called with packageId:', packageId);
    return apiClient.delete(`/wishlist/${packageId}`);
  },
};

// Reviews Service
export const reviewsApi = {
  getReviews: (destinationId?: string) => 
    apiClient.get('/reviews', { params: destinationId ? { destination: destinationId } : {} }),
  createReview: (data: { destination: string; rating: number; comment: string }) =>
    apiClient.post('/reviews', data),
  updateReview: (id: string, data: { rating?: number; comment?: string }) =>
    apiClient.patch(`/reviews/${id}`, data),
  deleteReview: (id: string) => apiClient.delete(`/reviews/${id}`),
};

// Payments Service
export const paymentsApi = {
  createPayment: (bookingId: string, paymentMethod: string) =>
    apiClient.post('/payments/create-payment', { bookingId, paymentMethod }),
  confirmPayment: (bookingId: string, transactionId: string) =>
    apiClient.post('/payments/confirm-payment', { bookingId, transactionId }),
  downloadReceiptPdf: (bookingId: string) =>
    apiClient.get(`/payments/receipt/${bookingId}/pdf`, { responseType: 'blob' }),
};

// Reports Service (Admin Analytics)
export const reportsApi = {
  getBookingsReport: () => apiClient.get('/reports/bookings'),
  getRevenueReport: () => apiClient.get('/reports/revenue'),
  getDestinationsReport: () => apiClient.get('/reports/destinations'),
  downloadPdfReport: () => 
    apiClient.get('/reports/export-pdf', { responseType: 'blob' }),
};

// Recommendations Service
export const recommendationsApi = {
  getPersonalized: () => apiClient.get('/recommendations/personalized'),
  getTrendingDestinations: () => apiClient.get('/recommendations/trending'),
  getPopularPackages: () => apiClient.get('/recommendations/popular-packages'),
};

// Notifications Service
export const notificationsApi = {
  getNotifications: () => apiClient.get('/notifications'),
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
};

// Tour Guides Service
export const tourGuidesApi = {
  assignGuide: (bookingId: string, guideId: string) =>
    apiClient.post('/tour-guides/assign', { bookingId, guideId }),
  getAssignments: () => apiClient.get('/tour-guides/assignments'),
  updateProgress: (assignmentId: string, data: { tourProgress?: string; notes?: string; status?: string }) =>
    apiClient.patch(`/tour-guides/assignments/${assignmentId}/progress`, data),
};

// Messages Service
export const messagesApi = {
  getConversation: (bookingId: string) =>
    apiClient.get(`/messages/booking/${bookingId}`),
  sendMessage: (bookingId: string, message: string) =>
    apiClient.post('/messages', { bookingId, message }),
  markAsRead: (id: string) =>
    apiClient.patch(`/messages/read/${id}`),
  getUnreadCount: () =>
    apiClient.get('/messages/unread/count'),
};
