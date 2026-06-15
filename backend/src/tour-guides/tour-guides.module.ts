import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TourGuidesController } from './tour-guides.controller';
import { TourGuidesService } from './tour-guides.service';
import { TourAssignment, TourAssignmentSchema } from './schemas/tour-assignment.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TourAssignment.name, schema: TourAssignmentSchema },
      { name: User.name, schema: UserSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [TourGuidesController],
  providers: [TourGuidesService],
  exports: [TourGuidesService],
})
export class TourGuidesModule {}
