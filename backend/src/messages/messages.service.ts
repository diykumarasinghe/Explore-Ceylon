import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import { Role } from '../common/enums/role.enum';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

  async create(userId: string, userRole: string, dto: CreateMessageDto): Promise<MessageDocument> {
    const booking = await this.bookingModel.findById(dto.bookingId).exec();
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${dto.bookingId}" not found`);
    }

    if (!booking.assignedGuide) {
      throw new BadRequestException('No guide is assigned to this booking yet.');
    }

    const customerId = booking.customer.toString();
    const guideId = booking.assignedGuide.toString();

    // Enforce role-based access to the booking's chat
    if (userRole === Role.CUSTOMER && customerId !== userId) {
      throw new ForbiddenException('You are not authorized to send messages for this booking');
    } else if (userRole === Role.TOUR_GUIDE && guideId !== userId) {
      throw new ForbiddenException('You are not authorized to send messages for this booking');
    } else if (userRole !== Role.CUSTOMER && userRole !== Role.TOUR_GUIDE) {
      throw new ForbiddenException('Only customers and assigned tour guides can send messages');
    }

    const message = new this.messageModel({
      bookingId: dto.bookingId,
      customerId,
      guideId,
      senderId: userId,
      senderRole: userRole,
      message: dto.message,
      isRead: false,
      isArchived: false,
    });

    return message.save();
  }

  async findForBooking(bookingId: string, userId: string, userRole: string): Promise<MessageDocument[]> {
    const booking = await this.bookingModel.findById(bookingId).exec();
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" not found`);
    }

    if (userRole !== Role.ADMIN) {
      const customerId = booking.customer.toString();
      const guideId = booking.assignedGuide ? booking.assignedGuide.toString() : null;

      if (userRole === Role.CUSTOMER && customerId !== userId) {
        throw new ForbiddenException('You are not authorized to view messages for this booking');
      } else if (userRole === Role.TOUR_GUIDE && guideId !== userId) {
        throw new ForbiddenException('You are not authorized to view messages for this booking');
      }
    }

    // When fetching conversation, automatically mark incoming messages as read
    await this.messageModel.updateMany(
      {
        bookingId,
        senderId: { $ne: userId },
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    ).exec();

    return this.messageModel.find({ bookingId, isArchived: false }).sort({ createdAt: 1 }).exec();
  }

  async getUnreadCount(userId: string, userRole: string): Promise<number> {
    const filter = { isRead: false, isArchived: false };
    if (userRole === Role.CUSTOMER) {
      filter['customerId'] = userId;
      filter['senderId'] = { $ne: userId };
    } else if (userRole === Role.TOUR_GUIDE) {
      filter['guideId'] = userId;
      filter['senderId'] = { $ne: userId };
    } else {
      return 0; // Admin or unauthenticated users don't have unread personal counts
    }

    return this.messageModel.countDocuments(filter).exec();
  }

  async markAsRead(id: string, userId: string, userRole: string): Promise<MessageDocument> {
    const message = await this.messageModel.findById(id).exec();
    if (!message) {
      throw new NotFoundException(`Message with ID "${id}" not found`);
    }

    if (message.senderId.toString() === userId) {
      return message; // No need to mark own messages as read
    }

    if (userRole === Role.CUSTOMER && message.customerId.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to mark this message as read');
    } else if (userRole === Role.TOUR_GUIDE && message.guideId.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to mark this message as read');
    }

    message.isRead = true;
    return message.save();
  }
}
