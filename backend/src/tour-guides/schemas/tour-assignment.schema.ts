import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Booking } from '../../bookings/schemas/booking.schema';
import { User } from '../../users/schemas/user.schema';

export type TourAssignmentDocument = TourAssignment & Document;

@Schema({ timestamps: true })
export class TourAssignment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Booking', required: true })
  booking: Booking;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  guide: User;

  @Prop({ required: true, default: 'Assigned' })
  status: string; // Assigned, Active, Completed, Cancelled

  @Prop({ default: '' })
  tourProgress: string;

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: Date.now })
  assignedAt: Date;
}

export const TourAssignmentSchema = SchemaFactory.createForClass(TourAssignment);
