import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Destination, DestinationDocument } from '../destinations/schemas/destination.schema';
import { Package, PackageDocument } from '../packages/schemas/package.schema';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import { BookingStatus } from '../common/enums/booking-status.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Destination.name) private destinationModel: Model<DestinationDocument>,
    @InjectModel(Package.name) private packageModel: Model<PackageDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

  async getDashboardData() {
    const [
      totalUsers,
      usersByRole,
      totalDestinations,
      totalPackages,
      totalBookings,
      bookingsByStatus,
      revenueData,
      averageRatingData,
    ] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.userModel.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]).exec(),
      this.destinationModel.countDocuments().exec(),
      this.packageModel.countDocuments().exec(),
      this.bookingModel.countDocuments().exec(),
      this.bookingModel.aggregate([
        { $group: { _id: '$bookingStatus', count: { $sum: 1 } } }
      ]).exec(),
      this.bookingModel.aggregate([
        {
          $match: {
            bookingStatus: { $in: [BookingStatus.CONFIRMED, BookingStatus.ONGOING, BookingStatus.COMPLETED] },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]).exec(),
      this.destinationModel.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]).exec(),
    ]);

    // Format aggregate results into key-value counts
    const roles = { Admin: 0, Customer: 0, 'Tour Guide': 0 };
    usersByRole.forEach((item) => {
      if (item._id in roles) {
        roles[item._id] = item.count;
      }
    });

    const statuses = {
      [BookingStatus.PENDING]: 0,
      [BookingStatus.AWAITING_GUIDE_ASSIGNMENT]: 0,
      [BookingStatus.GUIDE_ASSIGNED]: 0,
      [BookingStatus.GUIDE_ACCEPTED]: 0,
      [BookingStatus.GUIDE_REJECTED]: 0,
      [BookingStatus.CONFIRMED]: 0,
      [BookingStatus.ONGOING]: 0,
      [BookingStatus.CANCELLED]: 0,
      [BookingStatus.COMPLETED]: 0,
    };
    bookingsByStatus.forEach((item) => {
      if (item._id in statuses) {
        statuses[item._id] = item.count;
      }
    });

    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    const avgRating = averageRatingData.length > 0 ? parseFloat(averageRatingData[0].avgRating.toFixed(1)) : 0;

    return {
      overview: {
        totalUsers,
        totalDestinations,
        totalPackages,
        totalBookings,
        totalRevenue,
        averageDestinationRating: avgRating,
      },
      usersByRole: roles,
      bookingsByStatus: statuses,
    };
  }
}
