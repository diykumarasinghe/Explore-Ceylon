import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Booking } from '../../bookings/schemas/booking.schema';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Booking', required: true })
  booking: Booking;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop({ required: true, unique: true })
  transactionId: string;

  @Prop({ required: true, default: 'Pending' })
  status: string; // Pending, Completed, Failed

  createdAt: Date;
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
