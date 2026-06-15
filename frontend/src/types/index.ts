export interface Destination {
  id: string;
  name: string;
  category: 'Beach' | 'Culture' | 'Wildlife' | 'Hill Country' | 'Adventure' | 'Heritage' | 'Nature';
  description: string;
  image: string;
  location: string;
  bestTimeToVisit: string;
  activities: string[];
  highlights: string[];
  budgetRange: 'LKR 10,000 - 25,000' | 'LKR 25,000 - 50,000' | 'LKR 50,000 - 100,000' | 'LKR 100,000+';
  rating: number;
}

export interface ItineraryItem {
  day: number;
  title: string;
  description: string;
}

export interface Package {
  id: string;
  destinationId: string;
  name: string;
  description: string;
  image: string;
  price: number;
  durationDays: number;
  duration?: string;
  maxGroupSize: number;
  includedServices: string[];
  itinerary: ItineraryItem[];
  rating: number;
  category: 'Beach' | 'Culture' | 'Wildlife' | 'Hill Country' | 'Adventure' | 'Heritage' | 'Nature';
}

export enum BookingStatus {
  PENDING = "PENDING",
  AWAITING_GUIDE_ASSIGNMENT = "AWAITING_GUIDE_ASSIGNMENT",
  GUIDE_ASSIGNED = "GUIDE_ASSIGNED",
  GUIDE_ACCEPTED = "GUIDE_ACCEPTED",
  GUIDE_REJECTED = "GUIDE_REJECTED",
  CONFIRMED = "CONFIRMED",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum PaymentStatus {
  NOT_PAID = "NOT_PAID",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  PAID = "PAID",
  REJECTED = "REJECTED"
}

export enum TourStatus {
  UPCOMING = "UPCOMING",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer' | 'guide';
  avatar: string;
  phoneNumber?: string;
}

export interface Booking {
  id: string;
  packageId: string;
  packageName: string;
  packageImage: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  guideId?: string;
  guideName?: string;
  guidePhone?: string;
  guideEmail?: string;
  guideAvatar?: string;
  customerPhone?: string;
  startDate: string;
  guestsCount: number;
  totalAmount: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  tourStatus: TourStatus;
  paymentReceipt?: string;
  paymentMethod?: string;
  paymentDate?: string;
  approvedBy?: string;
  approvedAt?: string;
  assignedGuide?: any;
  specialRequests?: string;
  guideDecision?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  rejectionReason?: string;
  guideResponseAt?: string;
  
  // Compatibility properties
  status: 'pending' | 'awaiting_guide_assignment' | 'guide_assigned' | 'guide_accepted' | 'guide_rejected' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  tourProgress?: string;
  bookingDate?: string;
  guideApprovedByAdmin?: boolean;
}
