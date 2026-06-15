import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TourAssignment, TourAssignmentDocument } from './schemas/tour-assignment.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import { BookingStatus } from '../common/enums/booking-status.enum';
import { TourStatus } from '../common/enums/tour-status.enum';
import { Role } from '../common/enums/role.enum';
import { GuideDecision } from '../common/enums/guide-decision.enum';
import { NotificationsService } from '../notifications/notifications.service';

function sanitizeAssignmentForGuide(assignment: any): any {
  if (!assignment) return assignment;
  const a = assignment.toObject ? assignment.toObject() : assignment;
  if (a.booking) {
    const isConfirmedOrCompleted =
      a.booking.bookingStatus === BookingStatus.CONFIRMED ||
      a.booking.bookingStatus === BookingStatus.COMPLETED;
    if (!isConfirmedOrCompleted && a.booking.customer && typeof a.booking.customer === 'object') {
      a.booking.customer.phoneNumber = '';
    }
  }
  return a;
}

@Injectable()
export class TourGuidesService {
  constructor(
    @InjectModel(TourAssignment.name) private assignmentModel: Model<TourAssignmentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async assignGuide(bookingId: string, guideId: string): Promise<TourAssignmentDocument | null> {
    if (!guideId) {
      const booking = await this.bookingModel.findById(bookingId).exec();
      if (booking) {
        booking.assignedGuide = undefined;
        booking.bookingStatus = BookingStatus.AWAITING_GUIDE_ASSIGNMENT;
        await booking.save();
      }
      await this.assignmentModel.deleteOne({ booking: bookingId }).exec();
      return null;
    }

    const [booking, guide] = await Promise.all([
      this.bookingModel.findById(bookingId).populate('customer').exec(),
      this.userModel.findById(guideId).exec(),
    ]);

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" not found`);
    }

    if (!guide) {
      throw new NotFoundException(`Tour Guide with ID "${guideId}" not found`);
    }

    if (guide.role !== Role.TOUR_GUIDE) {
      throw new BadRequestException('Assigned user must be a Tour Guide');
    }

    // Check guide availability for the travel date
    const travelDate = new Date(booking.travelDate);
    const startOfDay = new Date(travelDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(travelDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const conflictingBooking = await this.bookingModel.findOne({
      _id: { $ne: bookingId },
      assignedGuide: guideId,
      travelDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      $or: [
        { bookingStatus: { $in: [BookingStatus.GUIDE_ASSIGNED, BookingStatus.GUIDE_ACCEPTED, BookingStatus.CONFIRMED, BookingStatus.ONGOING] } },
        { tourStatus: TourStatus.ONGOING }
      ]
    }).exec();

    if (conflictingBooking) {
      throw new BadRequestException('This guide already has another tour on this date.');
    }

    // Check if assignment already exists
    let assignment = await this.assignmentModel.findOne({ booking: bookingId }).exec();
    if (assignment) {
      assignment.guide = guideId as any;
      assignment.status = 'Assigned';
      await assignment.save();
    } else {
      assignment = new this.assignmentModel({
        booking: bookingId,
        guide: guideId,
        status: 'Assigned',
      });
      await assignment.save();
    }

    // Update booking with guide
    booking.assignedGuide = guideId as any;
    booking.bookingStatus = BookingStatus.GUIDE_ASSIGNED;
    (booking as any).guideApprovedByAdmin = false;
    (booking as any).guideDecision = GuideDecision.PENDING;
    (booking as any).rejectionReason = undefined;
    (booking as any).guideResponseAt = undefined;
    await booking.save();

    // Send notification to the Guide
    await this.notificationsService.create(
      guideId,
      `You have received a new tour assignment.`,
      'info'
    );

    // Send notification to the Customer
    if (booking.customer) {
      await this.notificationsService.create(
        (booking.customer as any)._id.toString(),
        `Waiting for guide confirmation before payment.`,
        'success'
      );
    }

    return assignment.populate(['guide', 'booking']);
  }

  async getAssignments(guideId: string): Promise<any[]> {
    const assignments = await this.assignmentModel
      .find({ guide: guideId })
      .populate('guide', '-password')
      .populate({
        path: 'booking',
        populate: [
          { path: 'customer', select: 'name email phoneNumber profileImage' },
          {
            path: 'package',
            populate: { path: 'destination' }
          }
        ]
      })
      .sort({ assignedAt: -1 })
      .exec();

    return assignments.map(a => sanitizeAssignmentForGuide(a));
  }

  async updateProgress(
    assignmentId: string,
    guideId: string,
    updateDto: { tourProgress?: string; notes?: string; status?: string }
  ): Promise<any> {
    const assignment = await this.assignmentModel.findById(assignmentId)
      .populate({ path: 'booking', populate: { path: 'customer' } })
      .exec();

    if (!assignment) {
      throw new NotFoundException(`Tour Assignment with ID "${assignmentId}" not found`);
    }

    if (assignment.guide.toString() !== guideId) {
      throw new ForbiddenException('You are not authorized to update progress for this assignment');
    }

    if (updateDto.tourProgress !== undefined) assignment.tourProgress = updateDto.tourProgress;
    if (updateDto.notes !== undefined) assignment.notes = updateDto.notes;
    if (updateDto.status !== undefined) assignment.status = updateDto.status;

    await assignment.save();

    const booking = await this.bookingModel.findById((assignment.booking as any)._id).exec();

    if (booking && updateDto.tourProgress !== undefined) {
      booking.tourProgress = updateDto.tourProgress;
    }

    if (updateDto.status === 'Completed' && booking) {
      booking.bookingStatus = BookingStatus.COMPLETED;
      booking.tourStatus = TourStatus.COMPLETED;
      await booking.save();

      // Notify customer
      if (booking.customer) {
        await this.notificationsService.create(
          booking.customer.toString(),
          `Your tour has been marked as Completed! We hope you had a wonderful trip in Sri Lanka.`,
          'success'
        );
      }
    } else if (updateDto.tourProgress && booking && booking.customer) {
      // Notify customer of live updates
      await this.notificationsService.create(
        booking.customer.toString(),
        `Your guide logged a trip milestone: "${updateDto.tourProgress}"`,
        'info'
      );
      await booking.save();
    } else if (booking && booking.isModified()) {
      await booking.save();
    }

    return sanitizeAssignmentForGuide(assignment);
  }

  async cancelAssignment(bookingId: string): Promise<void> {
    await this.assignmentModel.updateMany(
      { booking: bookingId },
      { status: 'Cancelled' }
    ).exec();
  }
}

