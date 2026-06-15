import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import { Package, PackageDocument } from '../packages/schemas/package.schema';
import { Wishlist, WishlistDocument } from '../wishlist/schemas/wishlist.schema';
import { Destination, DestinationDocument } from '../destinations/schemas/destination.schema';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Package.name) private packageModel: Model<PackageDocument>,
    @InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>,
    @InjectModel(Destination.name) private destinationModel: Model<DestinationDocument>,
  ) {}

  async getPersonalized(userId: string): Promise<PackageDocument[]> {
    // 1. Get user's wishlist and bookings to find preferred categories and destinations
    const [wishlist, bookings] = await Promise.all([
      this.wishlistModel.find({ user: userId }).populate('package').exec(),
      this.bookingModel.find({ customer: userId }).populate('package').exec(),
    ]);

    const userCategories = new Set<string>();
    const userDestinations = new Set<string>();

    wishlist.forEach(w => {
      if (w.package) {
        if ((w.package as any).category) userCategories.add((w.package as any).category);
        if ((w.package as any).destination) userDestinations.add((w.package as any).destination.toString());
      }
    });

    bookings.forEach(b => {
      if (b.package) {
        if ((b.package as any).category) userCategories.add((b.package as any).category);
        if ((b.package as any).destination) userDestinations.add((b.package as any).destination.toString());
      }
    });

    // 2. Query packages
    let query: any = {};
    if (userCategories.size > 0 || userDestinations.size > 0) {
      const conditions: any[] = [];
      if (userCategories.size > 0) {
        conditions.push({ category: { $in: Array.from(userCategories) } });
      }
      if (userDestinations.size > 0) {
        conditions.push({ destination: { $in: Array.from(userDestinations) } });
      }
      query = { $or: conditions };
    }

    let recommendations = await this.packageModel.find(query).populate('destination').exec();

    // Exclude packages the user already booked
    const bookedPackageIds = bookings.map(b => b.package ? (b.package as any)._id.toString() : '');
    recommendations = recommendations.filter(r => !bookedPackageIds.includes(r._id.toString()));

    // If we have fewer than 3 recommendations, backfill with general popular/top packages
    if (recommendations.length < 3) {
      const backfill = await this.packageModel.find({
        _id: { $nin: [...bookedPackageIds, ...recommendations.map(r => r._id.toString())] }
      }).limit(5).populate('destination').exec();
      recommendations = [...recommendations, ...backfill];
    }

    return recommendations.slice(0, 4);
  }

  async getTrendingDestinations(): Promise<DestinationDocument[]> {
    // Trending = highest rated destinations
    return this.destinationModel.find().sort({ rating: -1 }).limit(4).exec();
  }

  async getPopularPackages(): Promise<PackageDocument[]> {
    // Popular = packages with the most bookings
    const bookings = await this.bookingModel.find().populate('package').exec();
    const counts: Record<string, number> = {};
    
    bookings.forEach(b => {
      if (b.package) {
        const id = (b.package as any)._id.toString();
        counts[id] = (counts[id] || 0) + 1;
      }
    });

    const packages = await this.packageModel.find().populate('destination').exec();
    
    // Sort packages by booking count descending
    packages.sort((a, b) => {
      const countA = counts[a._id.toString()] || 0;
      const countB = counts[b._id.toString()] || 0;
      return countB - countA;
    });

    return packages.slice(0, 4);
  }
}
