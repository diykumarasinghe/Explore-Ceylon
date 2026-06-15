import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { TourGuidesModule } from '../tour-guides/tour-guides.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    NotificationsModule,
    TourGuidesModule,
    UsersModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule { }
