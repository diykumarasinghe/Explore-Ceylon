import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Package, PackageDocument } from './schemas/package.schema';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackagesService {
  constructor(
    @InjectModel(Package.name) private packageModel: Model<PackageDocument>,
  ) {}

  private parseDurationDays(duration: string): number {
    if (!duration) return 0;
    const match = duration.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async create(createDto: CreatePackageDto): Promise<PackageDocument> {
    const durationDays = this.parseDurationDays(createDto.duration);
    if (durationDays !== (createDto.itinerary || []).length) {
      throw new BadRequestException(
        `Itinerary must contain exactly ${durationDays} days for a ${createDto.duration} package.`,
      );
    }

    // Check day sequentiality
    const itinerary = createDto.itinerary || [];
    for (let i = 0; i < itinerary.length; i++) {
      if (Number(itinerary[i].day) !== i + 1) {
        throw new BadRequestException(
          `Itinerary days must be sequential starting from 1. Day ${i + 1} is incorrect.`,
        );
      }
    }

    const created = new this.packageModel(createDto);
    const saved = await created.save();
    return this.findOne(saved._id.toString());
  }

  async findAll(): Promise<PackageDocument[]> {
    return this.packageModel.find().populate('destination').exec();
  }

  async findOne(id: string): Promise<PackageDocument> {
    const pkg = await this.packageModel.findById(id).populate('destination').exec();
    if (!pkg) {
      throw new NotFoundException(`Package with ID "${id}" not found`);
    }
    return pkg;
  }

  async update(id: string, updateDto: UpdatePackageDto): Promise<PackageDocument> {
    if (updateDto.duration !== undefined || updateDto.itinerary !== undefined) {
      const existing = await this.packageModel.findById(id).exec();
      if (!existing) {
        throw new NotFoundException(`Package with ID "${id}" not found`);
      }
      const finalDuration = updateDto.duration !== undefined ? updateDto.duration : existing.duration;
      const finalItinerary = updateDto.itinerary !== undefined ? updateDto.itinerary : existing.itinerary;
      
      const durationDays = this.parseDurationDays(finalDuration);
      if (durationDays !== (finalItinerary || []).length) {
        throw new BadRequestException(
          `Itinerary must contain exactly ${durationDays} days for a ${finalDuration} package.`,
        );
      }

      // Check day sequentiality
      const itinerary = finalItinerary || [];
      for (let i = 0; i < itinerary.length; i++) {
        if (Number(itinerary[i].day) !== i + 1) {
          throw new BadRequestException(
            `Itinerary days must be sequential starting from 1. Day ${i + 1} is incorrect.`,
          );
        }
      }
    }

    const updated = await this.packageModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Package with ID "${id}" not found`);
    }
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.packageModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Package with ID "${id}" not found`);
    }
  }
}
