import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Destination } from '../../destinations/schemas/destination.schema';

export type PackageDocument = Package & Document;

@Schema({ timestamps: true })
export class Package {
  @Prop({ required: true })
  title: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Destination', required: true })
  destination: Destination;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  duration: string; // e.g. "5 Days, 4 Nights"

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  image: string;

  @Prop({ type: [String], default: [] })
  highlights: string[];

  @Prop({ type: [String], default: [] })
  includedServices: string[];

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  itinerary: any[];
}

export const PackageSchema = SchemaFactory.createForClass(Package);
