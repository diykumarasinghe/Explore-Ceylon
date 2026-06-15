import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Booking } from '../../bookings/schemas/booking.schema';
import { User } from '../../users/schemas/user.schema';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Booking', required: true })
  bookingId: Booking;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  customerId: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  guideId: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  senderId: User;

  @Prop({ required: true })
  senderRole: string; // 'Customer' | 'Tour Guide'

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: false })
  isArchived: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
