import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist, WishlistDocument } from './schemas/wishlist.schema';
import { AddWishlistDto } from './dto/add-wishlist.dto';
import { PackagesService } from '../packages/packages.service';

@Injectable()
export class WishlistService implements OnModuleInit {
  constructor(
    @InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>,
    private readonly packagesService: PackagesService,
  ) { }

  async onModuleInit() {
    try {
      const indexes = await this.wishlistModel.collection.indexes();

      // List of known bad/legacy unique indexes that must be dropped
      const badIndexNames = ['user_1', 'user_1_destination_1'];

      for (const badName of badIndexNames) {
        const badIndex = indexes.find((idx) => idx.name === badName && idx.unique === true);
        if (badIndex) {
          console.log(`[WishlistService] Dropping incorrect unique index "${badName}" from wishlists collection...`);
          await this.wishlistModel.collection.dropIndex(badName);
          console.log(`[WishlistService] Successfully dropped index "${badName}".`);
        }
      }
    } catch (err) {
      console.error('[WishlistService] Error checking/dropping wishlist indexes:', err);
    }
  }

  private getUserId(user: any): string {
    const id = user?.sub || user?.userId || user?._id || user?.id;
    if (!id) {
      throw new BadRequestException('User ID could not be identified from the request');
    }
    return id.toString();
  }

  async create(user: any, dto: AddWishlistDto): Promise<WishlistDocument> {
    try {
      const userId = this.getUserId(user);
      const packageId = dto.packageId || dto.package;

      if (!packageId || !Types.ObjectId.isValid(packageId)) {
        throw new BadRequestException('Invalid package ID');
      }

      // Check package exists
      await this.packagesService.findOne(packageId);

      const existing = await this.wishlistModel
        .findOne({ user: userId, package: packageId })
        .exec();
      if (existing) {
        throw new ConflictException('Package is already in your wishlist');
      }

      const created = new this.wishlistModel({
        user: userId,
        package: packageId,
      });
      const saved = await created.save();
      return await saved.populate({
        path: 'package',
        populate: { path: 'destination' }
      });
    } catch (error: any) {
      console.error('WISHLIST ERROR:', error);
      if (error.code === 11000) {
        throw new ConflictException('Package is already in your wishlist');
      }
      throw error;
    }
  }

  async findAll(user: any): Promise<WishlistDocument[]> {
    try {
      const userId = this.getUserId(user);
      return await this.wishlistModel
        .find({ user: userId })
        .populate({
          path: 'package',
          populate: { path: 'destination' }
        })
        .exec();
    } catch (error) {
      console.error('WISHLIST ERROR:', error);
      throw error;
    }
  }

  async remove(packageId: string, user: any): Promise<void> {
    try {
      const userId = this.getUserId(user);
      if (!packageId || !Types.ObjectId.isValid(packageId)) {
        throw new BadRequestException('Invalid package ID');
      }

      const item = await this.wishlistModel.findOne({ user: userId, package: packageId }).exec();
      if (!item) {
        throw new NotFoundException(`Wishlist item not found`);
      }

      await this.wishlistModel.findByIdAndDelete(item._id).exec();
    } catch (error) {
      console.error('WISHLIST ERROR:', error);
      throw error;
    }
  }
}

