import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Package } from '../../packages/schemas/package.schema';

export type WishlistDocument = Wishlist & Document;

@Schema({ timestamps: true })
export class Wishlist {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Package', required: true })
  package: Package;
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);

// Compound index to prevent duplicate wishlisting
WishlistSchema.index({ user: 1, package: 1 }, { unique: true });
