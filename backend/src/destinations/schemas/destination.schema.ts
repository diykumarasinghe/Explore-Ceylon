import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DestinationDocument = Destination & Document;

@Schema({ timestamps: true })
export class Destination {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  image: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: '' })
  bestTimeToVisit: string;

  @Prop({ type: [String], default: [] })
  activities: string[];

  @Prop({ type: [String], default: [] })
  highlights: string[];

  @Prop({ required: true })
  budgetRange: string;
}

export const DestinationSchema = SchemaFactory.createForClass(Destination);
