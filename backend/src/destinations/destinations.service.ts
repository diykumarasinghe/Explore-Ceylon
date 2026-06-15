import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Destination, DestinationDocument } from './schemas/destination.schema';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';

@Injectable()
export class DestinationsService {
  constructor(
    @InjectModel(Destination.name) private destinationModel: Model<DestinationDocument>,
  ) {}

  async create(createDto: CreateDestinationDto): Promise<DestinationDocument> {
    const created = new this.destinationModel(createDto);
    return created.save();
  }

  async findAll(): Promise<DestinationDocument[]> {
    return this.destinationModel.find().exec();
  }

  async findOne(id: string): Promise<DestinationDocument> {
    const destination = await this.destinationModel.findById(id).exec();
    if (!destination) {
      throw new NotFoundException(`Destination with ID "${id}" not found`);
    }
    return destination;
  }

  async update(id: string, updateDto: UpdateDestinationDto): Promise<DestinationDocument> {
    const updated = await this.destinationModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Destination with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.destinationModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Destination with ID "${id}" not found`);
    }
  }
}
