import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Destination, DestinationSchema } from '../destinations/schemas/destination.schema';
import { Package, PackageSchema } from '../packages/schemas/package.schema';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Destination.name, schema: DestinationSchema },
      { name: Package.name, schema: PackageSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
