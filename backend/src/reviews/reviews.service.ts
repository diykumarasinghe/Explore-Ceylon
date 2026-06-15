import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { DestinationsService } from '../destinations/destinations.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private destinationsService: DestinationsService,
  ) {}

  async create(userId: string, dto: CreateReviewDto): Promise<ReviewDocument> {
    // Check if destination exists
    await this.destinationsService.findOne(dto.destination);

    const created = new this.reviewModel({
      user: userId,
      destination: dto.destination,
      rating: dto.rating,
      comment: dto.comment,
    });
    const saved = await created.save();

    // Recalculate average rating for the destination
    await this.updateDestinationAverageRating(dto.destination);

    return saved.populate('user', 'name profileImage');
  }

  async findAll(destinationId?: string): Promise<ReviewDocument[]> {
    const filter = destinationId ? { destination: destinationId } : {};
    return this.reviewModel
      .find(filter)
      .populate('user', 'name profileImage')
      .populate('destination', 'name location')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, userId: string, updateDto: { rating?: number; comment?: string }): Promise<ReviewDocument> {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found`);
    }

    if (review.user.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to update this review');
    }

    if (updateDto.rating !== undefined) review.rating = updateDto.rating;
    if (updateDto.comment !== undefined) review.comment = updateDto.comment;

    await review.save();

    // Recalculate average rating for the destination
    await this.updateDestinationAverageRating(review.destination.toString());

    return review.populate('user', 'name profileImage');
  }

  async remove(id: string, userId: string): Promise<void> {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found`);
    }

    if (review.user.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to delete this review');
    }

    await this.reviewModel.findByIdAndDelete(id).exec();

    // Recalculate average rating for the destination
    await this.updateDestinationAverageRating(review.destination.toString());
  }

  private async updateDestinationAverageRating(destinationId: string): Promise<void> {
    const reviews = await this.reviewModel.find({ destination: destinationId }).exec();
    if (reviews.length === 0) {
      await this.destinationsService.update(destinationId, { rating: 0 });
      return;
    }

    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const average = parseFloat((sum / reviews.length).toFixed(1));

    await this.destinationsService.update(destinationId, { rating: average });
  }
}
