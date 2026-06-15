import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Package } from '../../packages/schemas/package.schema';

export type TourUpdateDocument = TourUpdate & Document;

@Schema({ timestamps: true })
export class TourUpdate {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  guide: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Package', required: true })
  package: Package;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  image?: string;
}

export const TourUpdateSchema = SchemaFactory.createForClass(TourUpdate);
