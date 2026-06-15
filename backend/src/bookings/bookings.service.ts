import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { Role } from '../common/enums/role.enum';
import { BookingStatus } from '../common/enums/booking-status.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { TourStatus } from '../common/enums/tour-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { TourGuidesService } from '../tour-guides/tour-guides.service';
import { UsersService } from '../users/users.service';
import { GuideDecision } from '../common/enums/guide-decision.enum';

function sanitizeBookingForUser(booking: any, userRole: Role): any {
  if (!booking) return booking;
  const b = booking.toObject ? booking.toObject() : booking;
  const isConfirmedOrCompleted =
    b.bookingStatus === BookingStatus.CONFIRMED ||
    b.bookingStatus === BookingStatus.COMPLETED;

  if (userRole === Role.CUSTOMER) {
    const isGuideApproved =
      b.guideApprovedByAdmin === true ||
      b.bookingStatus === BookingStatus.CONFIRMED ||
      b.bookingStatus === BookingStatus.COMPLETED;

    if (!isGuideApproved) {
      b.assignedGuide = undefined;
    } else if (!isConfirmedOrCompleted && b.assignedGuide && typeof b.assignedGuide === 'object') {
      b.assignedGuide.phoneNumber = '';
    }
  } else if (userRole === Role.TOUR_GUIDE) {
    if (!isConfirmedOrCompleted && b.customer && typeof b.customer === 'object') {
      b.customer.phoneNumber = '';
    }
  }
  return b;
}

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private readonly notificationsService: NotificationsService,
    private readonly tourGuidesService: TourGuidesService,
    private readonly usersService: UsersService,
  ) {}

  async create(customerId: string, createDto: CreateBookingDto): Promise<any> {
    const created = new this.bookingModel({
      ...createDto,
      customer: customerId,
      bookingStatus: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.NOT_PAID,
      tourStatus: TourStatus.UPCOMING,
    });
    const saved = await created.save();
    
    // Trigger notification
    await this.notificationsService.create(
      customerId,
      'Your travel booking request has been submitted. Waiting for Admin approval and Guide assignment.',
      'info'
    );

    return this.findOne(saved._id.toString(), customerId, Role.CUSTOMER);
  }

  async findAll(user: UserDocument): Promise<any[]> {
    let filter = {};
    if (user.role === Role.TOUR_GUIDE) {
      filter = { assignedGuide: user._id };
    } else if (user.role === Role.CUSTOMER) {
      filter = { customer: user._id };
    }

    const bookings = await this.bookingModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('customer', 'name email phoneNumber')
      .populate('assignedGuide', 'name email phoneNumber profileImage')
      .populate('approvedBy', 'name email')
      .populate({
        path: 'package',
        populate: { path: 'destination' },
      })
      .exec();

    return bookings.map(b => sanitizeBookingForUser(b, user.role));
  }

  async findOne(id: string, userId: string, role: Role): Promise<any> {
    const booking = await this.bookingModel
      .findById(id)
      .populate('customer', 'name email phoneNumber')
      .populate('assignedGuide', 'name email phoneNumber profileImage')
      .populate('approvedBy', 'name email')
      .populate({
        path: 'package',
        populate: { path: 'destination' },
      })
      .exec();

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }

    if (role === Role.CUSTOMER && (booking.customer as any)._id.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to view this booking');
    }

    if (role === Role.TOUR_GUIDE && (!booking.assignedGuide || (booking.assignedGuide as any)._id.toString() !== userId)) {
      throw new ForbiddenException('You are not authorized to view this booking');
    }

    return sanitizeBookingForUser(booking, role);
  }

  async updateStatus(
    id: string,
    statusDto: UpdateBookingStatusDto,
    userId: string,
    role: Role,
  ): Promise<BookingDocument> {
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }

    // Role safety logic
    if (role === Role.CUSTOMER) {
      if (booking.customer.toString() !== userId) {
        throw new ForbiddenException('You are not authorized to update this booking');
      }
      if (statusDto.status !== BookingStatus.CANCELLED) {
        throw new ForbiddenException('Customers are only authorized to cancel their bookings');
      }
      const isPaymentCancelable =
        booking.paymentStatus === PaymentStatus.NOT_PAID ||
        booking.paymentStatus === PaymentStatus.REJECTED;
      const isBookingCancelable = [
        BookingStatus.PENDING,
        BookingStatus.AWAITING_GUIDE_ASSIGNMENT,
        BookingStatus.GUIDE_ASSIGNED,
        BookingStatus.GUIDE_ACCEPTED,
        BookingStatus.GUIDE_REJECTED,
      ].includes(booking.bookingStatus);
      if (!isPaymentCancelable || !isBookingCancelable) {
        throw new BadRequestException('Customer cannot cancel after payment is completed or confirmed.');
      }
    } else if (role === Role.TOUR_GUIDE) {
      throw new ForbiddenException('Tour guides are not authorized to update booking status directly');
    }

    booking.bookingStatus = statusDto.status;
    await booking.save();

    // Trigger notification
    await this.notificationsService.create(
      booking.customer.toString(),
      `Your booking status has been updated to: ${statusDto.status}`,
      statusDto.status === BookingStatus.CANCELLED ? 'warning' : 'success'
    );

    if (statusDto.status === BookingStatus.CANCELLED) {
      let packageName = 'Ceylon Tour';
      try {
        const populated = await booking.populate('package');
        if (populated && populated.package) {
          packageName = (populated.package as any).title || (populated.package as any).name || 'Ceylon Tour';
        }
      } catch (err) {
        console.error('Error populating package for cancellation notification:', err);
      }

      // 1. Notify Admin users
      try {
        const admins = await this.usersService.findAdmins();
        for (const admin of admins) {
          await this.notificationsService.create(
            admin._id.toString(),
            `Booking request for "${packageName}" (ID: ${booking._id}) has been cancelled by the customer.`,
            'warning'
          );
        }
      } catch (err) {
        console.error('Failed to notify admins of cancellation:', err);
      }

      // 2. Notify assigned guide, if exists
      if (booking.assignedGuide) {
        try {
          await this.notificationsService.create(
            booking.assignedGuide.toString(),
            `The tour for booking "${packageName}" (ID: ${booking._id}) has been cancelled by the customer.`,
            'warning'
          );
          await this.tourGuidesService.cancelAssignment(booking._id.toString());
        } catch (err) {
          console.error('Failed to notify guide of cancellation:', err);
        }
      }
    }

    return this.findOne(id, userId, role);
  }

  async adminReview(
    id: string,
    action: 'approve' | 'reject',
    guideId: string | undefined,
    adminId: string,
  ): Promise<BookingDocument> {
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }

    if (booking.bookingStatus === BookingStatus.PENDING) {
      if (action === 'approve') {
        booking.approvedBy = adminId as any;
        booking.approvedAt = new Date();

        if (guideId) {
          booking.bookingStatus = BookingStatus.GUIDE_ASSIGNED;
          booking.guideApprovedByAdmin = false;
          await booking.save();
          await this.tourGuidesService.assignGuide(id, guideId);
        } else {
          booking.bookingStatus = BookingStatus.AWAITING_GUIDE_ASSIGNMENT;
          booking.guideApprovedByAdmin = false;
          await booking.save();
          await this.notificationsService.create(
            booking.customer.toString(),
            `Your booking request has been approved! We are currently assigning a guide for your tour.`,
            'success'
          );
        }
      } else {
        booking.bookingStatus = BookingStatus.CANCELLED;
        await booking.save();

        await this.notificationsService.create(
          booking.customer.toString(),
          `Your booking request has been rejected and cancelled by Admin.`,
          'warning'
        );
      }
    } else if (booking.bookingStatus === BookingStatus.GUIDE_ACCEPTED) {
      if (action === 'approve') {
        booking.guideApprovedByAdmin = true;
        await booking.save();

        await this.notificationsService.create(
          booking.customer.toString(),
          `Your guide assignment has been approved by Admin. You can now complete payment.`,
          'success'
        );
      } else {
        // Reject/Unassign the accepted guide
        booking.assignedGuide = undefined;
        booking.bookingStatus = BookingStatus.AWAITING_GUIDE_ASSIGNMENT;
        booking.guideApprovedByAdmin = false;
        await booking.save();
        await this.tourGuidesService.cancelAssignment(booking._id.toString());

        await this.notificationsService.create(
          booking.customer.toString(),
          `We are assigning a new guide for your tour.`,
          'warning'
        );
      }
    }

    return this.findOne(id, adminId, Role.ADMIN);
  }

  async submitPayment(
    id: string,
    paymentMethod: string,
    receiptPath: string,
    customerId: string,
  ): Promise<BookingDocument> {
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }

    if (booking.customer.toString() !== customerId) {
      throw new ForbiddenException('You are not authorized to submit payment for this booking');
    }

    if (booking.bookingStatus !== BookingStatus.GUIDE_ACCEPTED || !booking.assignedGuide || !booking.guideApprovedByAdmin) {
      throw new BadRequestException('Payment is only allowed after guide confirmation and admin approval.');
    }

    if (booking.paymentStatus !== PaymentStatus.NOT_PAID && booking.paymentStatus !== PaymentStatus.REJECTED) {
      throw new BadRequestException('Payment is only allowed for unpaid or rejected bookings.');
    }

    booking.paymentStatus = PaymentStatus.PENDING_VERIFICATION;
    booking.paymentMethod = paymentMethod;
    booking.paymentReceipt = receiptPath;
    booking.paymentDate = new Date();
    await booking.save();

    await this.notificationsService.create(
      booking.customer.toString(),
      `Payment proof submitted successfully! Waiting for Admin verification.`,
      'info'
    );

    return this.findOne(id, customerId, Role.CUSTOMER);
  }

  async verifyPayment(
    id: string,
    action: 'approve' | 'reject',
    adminId: string,
  ): Promise<BookingDocument> {
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }

    if (booking.paymentStatus !== PaymentStatus.PENDING_VERIFICATION) {
      throw new BadRequestException('Payment is not pending verification');
    }

    if (action === 'approve') {
      if (!booking.assignedGuide) {
        throw new BadRequestException('Payment is only allowed after admin approval and tour guide assignment.');
      }
      booking.bookingStatus = BookingStatus.CONFIRMED;
      booking.paymentStatus = PaymentStatus.PAID;
      await booking.save();

      await this.notificationsService.create(
        booking.customer.toString(),
        `Your payment was verified. Your booking is now CONFIRMED!`,
        'success'
      );
    } else {
      booking.paymentStatus = PaymentStatus.REJECTED;
      await booking.save();

      await this.notificationsService.create(
        booking.customer.toString(),
        `Your payment proof was rejected. Please re-upload your payment proof.`,
        'warning'
      );
    }

    return this.findOne(id, adminId, Role.ADMIN);
  }

  async updateTourStatus(
    id: string,
    tourStatus: TourStatus,
    tourProgress: string | undefined,
    guideId: string,
  ): Promise<BookingDocument> {
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }

    if (!booking.assignedGuide || booking.assignedGuide.toString() !== guideId) {
      throw new ForbiddenException('You are not the assigned guide for this tour');
    }

    booking.tourStatus = tourStatus;
    if (tourProgress !== undefined) {
      booking.tourProgress = tourProgress;
    }

    if (tourStatus === TourStatus.ONGOING) {
      booking.bookingStatus = BookingStatus.ONGOING;
    } else if (tourStatus === TourStatus.COMPLETED) {
      booking.bookingStatus = BookingStatus.COMPLETED;
    }
    await booking.save();

    // Trigger notification
    await this.notificationsService.create(
      booking.customer.toString(),
      `Your guide updated the tour status to: ${tourStatus}. Progress: ${tourProgress || 'N/A'}`,
      'info'
    );

    return this.findOne(id, guideId, Role.TOUR_GUIDE);
  }

  async guideDecision(
    id: string,
    action: 'accept' | 'reject',
    rejectionReason: string | undefined,
    guideId: string,
  ): Promise<BookingDocument> {
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }

    if (!booking.assignedGuide || booking.assignedGuide.toString() !== guideId) {
      throw new ForbiddenException('You are not authorized to decide on this tour request');
    }

    if (booking.bookingStatus !== BookingStatus.GUIDE_ASSIGNED) {
      throw new BadRequestException('This booking is not pending guide decision');
    }

    if (action === 'accept') {
      booking.bookingStatus = BookingStatus.GUIDE_ACCEPTED;
      (booking as any).guideDecision = GuideDecision.ACCEPTED;
      await booking.save();

      // Notify Admin
      try {
        const admins = await this.usersService.findAdmins();
        for (const admin of admins) {
          await this.notificationsService.create(
            admin._id.toString(),
            `Guide accepted the assigned tour.`,
            'success'
          );
        }
      } catch (err) {
        console.error('Failed to notify admins of guide acceptance:', err);
      }

      // Notify Customer
      if (booking.customer) {
        await this.notificationsService.create(
          booking.customer.toString(),
          `Your guide has accepted the tour. You can now complete payment.`,
          'success'
        );
      }
    } else {
      booking.bookingStatus = BookingStatus.GUIDE_REJECTED;
      (booking as any).guideDecision = GuideDecision.REJECTED;
      (booking as any).rejectionReason = rejectionReason;
      (booking as any).guideResponseAt = new Date();
      await booking.save();

      // Notify Admin
      try {
        const admins = await this.usersService.findAdmins();
        for (const admin of admins) {
          await this.notificationsService.create(
            admin._id.toString(),
            `Guide rejected the assigned tour. Please assign another guide.`,
            'warning'
          );
        }
      } catch (err) {
        console.error('Failed to notify admins of guide rejection:', err);
      }

      // Notify Customer
      if (booking.customer) {
        await this.notificationsService.create(
          booking.customer.toString(),
          `We are assigning a new guide for your tour.`,
          'warning'
        );
      }
    }

    return this.findOne(id, guideId, Role.TOUR_GUIDE);
  }
}
