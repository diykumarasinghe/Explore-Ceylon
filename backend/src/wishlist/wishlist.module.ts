import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Wishlist, WishlistSchema } from './schemas/wishlist.schema';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { PackagesModule } from '../packages/packages.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Wishlist.name, schema: WishlistSchema }]),
    PackagesModule,
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}

