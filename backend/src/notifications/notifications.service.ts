import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async findAll(userId: string): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(id: string, userId: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new NotFoundException(`Notification with ID "${id}" not found`);
    }

    if (notification.user.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to access this notification');
    }

    notification.isRead = true;
    return notification.save();
  }

  async create(userId: string, message: string, type = 'info'): Promise<NotificationDocument> {
    const created = new this.notificationModel({
      user: userId,
      message,
      type,
    });
    return created.save();
  }
}
