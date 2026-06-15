import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../common/enums/role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true, autoIndex: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: Role, default: Role.CUSTOMER })
  role: Role;

  @Prop({ default: '' })
  profileImage: string;

  @Prop({ default: '' })
  phoneNumber: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Ensure unique index on email
UserSchema.index({ email: 1 }, { unique: true });
