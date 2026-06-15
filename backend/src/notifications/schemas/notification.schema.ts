import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, default: false })
  isRead: boolean;

  @Prop({ required: true, default: 'info' })
  type: string; // info, success, warning
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
