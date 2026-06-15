import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import { Package, PackageSchema } from '../packages/schemas/package.schema';
import { Wishlist, WishlistSchema } from '../wishlist/schemas/wishlist.schema';
import { Destination, DestinationSchema } from '../destinations/schemas/destination.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Package.name, schema: PackageSchema },
      { name: Wishlist.name, schema: WishlistSchema },
      { name: Destination.name, schema: DestinationSchema },
    ]),
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
