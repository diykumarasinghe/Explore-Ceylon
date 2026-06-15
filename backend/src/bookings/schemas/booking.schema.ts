import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Package } from '../../packages/schemas/package.schema';
import { BookingStatus } from '../../common/enums/booking-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { TourStatus } from '../../common/enums/tour-status.enum';
import { GuideDecision } from '../../common/enums/guide-decision.enum';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  customer: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Package', required: true })
  package: Package;

  @Prop({ required: true, default: Date.now })
  bookingDate: Date;

  @Prop({ required: true })
  travelDate: Date;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true, default: 1 })
  guestsCount: number;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.NOT_PAID })
  paymentStatus: PaymentStatus;

  @Prop({ required: true, enum: BookingStatus, default: BookingStatus.PENDING })
  bookingStatus: BookingStatus;

  @Prop({ required: true, enum: TourStatus, default: TourStatus.UPCOMING })
  tourStatus: TourStatus;

  @Prop()
  paymentReceipt?: string;

  @Prop()
  paymentMethod?: string;

  @Prop({ type: Date })
  paymentDate?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  approvedBy?: User;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  assignedGuide?: User;

  @Prop()
  contactNumber?: string;

  @Prop()
  specialRequests?: string;

  @Prop()
  tourProgress?: string;

  @Prop({ type: String, enum: GuideDecision, default: GuideDecision.PENDING })
  guideDecision: GuideDecision;

  @Prop()
  rejectionReason?: string;

  @Prop({ type: Date })
  guideResponseAt?: Date;

  @Prop()
  stripeSessionId?: string;

  @Prop({ type: Boolean, default: false })
  guideApprovedByAdmin?: boolean;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
