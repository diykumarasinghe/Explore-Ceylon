import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createDto: Partial<User>): Promise<UserDocument> {
    if (createDto.email) {
      createDto.email = createDto.email.toLowerCase().trim();
    }
    const createdUser = new this.userModel(createDto);
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    if (!email) return null;
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async findByIdWithPassword(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findAdmins(): Promise<UserDocument[]> {
    return this.userModel.find({ role: Role.ADMIN }).exec();
  }

  async countAdmins(): Promise<number> {
    return this.userModel.countDocuments({ role: Role.ADMIN }).exec();
  }

  async update(id: string, updateDto: Partial<User>): Promise<UserDocument | null> {
    if (updateDto.email) {
      updateDto.email = updateDto.email.toLowerCase().trim();
    }
    return this.userModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .select('-password')
      .exec();
  }

  async findByResetToken(hashedToken: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
      })
      .exec();
  }

  async updatePasswordAndClearReset(id: string, passwordHash: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        id,
        {
          $set: { password: passwordHash },
          $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
        },
        { new: true }
      )
      .exec();
  }
}
