import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import { BookingStatus } from '../common/enums/booking-status.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import Stripe = require('stripe');
import * as PDFDocument from 'pdfkit';
import { Writable } from 'stream';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class PaymentsService {
  private stripe: any;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private readonly notificationsService: NotificationsService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_if_not_configured', {
      apiVersion: '2023-10-16' as any,
    });
  }

  async createPayment(userId: string, bookingId: string, paymentMethod: string): Promise<any> {
    const booking = await this.bookingModel.findById(bookingId).populate('package').exec();
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" not found`);
    }

    if (booking.customer.toString() !== userId) {
      throw new BadRequestException('You are not authorized to pay for this booking');
    }

    if (booking.bookingStatus !== BookingStatus.GUIDE_ACCEPTED || !booking.assignedGuide || !booking.guideApprovedByAdmin) {
      throw new BadRequestException('Payment is only allowed after guide confirmation and admin approval.');
    }

    if (booking.paymentStatus !== PaymentStatus.NOT_PAID && booking.paymentStatus !== PaymentStatus.REJECTED) {
      throw new BadRequestException('Payment is only allowed for unpaid or rejected bookings.');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    let transactionId = 'TXN-' + Math.random().toString(36).substring(2, 11).toUpperCase();
    let redirectUrl = '';

    if (paymentMethod === 'Stripe') {
      try {
        const packageName = (booking.package as any)?.title || (booking.package as any)?.name || 'Ceylon Journey';
        const session = await this.stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Explore Ceylon - ${packageName}`,
                description: `Booking ID: ${bookingId} - ${booking.guestsCount} Guest(s)`,
              },
              unit_amount: booking.totalAmount * 100, // in cents
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: `${frontendUrl}/payment-success?payment=success&bookingId=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${frontendUrl}/payment-cancel?payment=cancel&bookingId=${bookingId}`,
        });
        transactionId = session.id;
        redirectUrl = session.url || '';
      } catch (err) {
        console.error('Stripe Checkout Session creation failed:', err);
        const dummyKeys = ['sk_test_dummy_key_if_not_configured', 'sk_test_xxxxxxxxx'];
        if (process.env.STRIPE_SECRET_KEY && !dummyKeys.includes(process.env.STRIPE_SECRET_KEY)) {
          throw new BadRequestException('Stripe Checkout session creation failed: ' + err.message);
        }
      }
    }

    // Create a new pending payment transaction
    const newPayment = new this.paymentModel({
      booking: bookingId,
      user: userId,
      amount: booking.totalAmount,
      paymentMethod,
      transactionId,
      status: 'Pending',
    });

    await newPayment.save();

    return {
      payment: newPayment,
      redirectUrl,
      transactionId,
    };
  }

  async confirmPayment(userId: string, bookingId: string, transactionId: string): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findOne({ booking: bookingId, transactionId }).exec();
    if (!payment) {
      throw new NotFoundException(`Payment transaction not found for booking ID "${bookingId}"`);
    }

    if (payment.user.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to confirm this payment');
    }

    if (payment.status === 'Completed') {
      return payment;
    }

    const booking = await this.bookingModel.findById(bookingId).exec();
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" not found`);
    }

    if (booking.bookingStatus !== BookingStatus.GUIDE_ACCEPTED || !booking.assignedGuide || !booking.guideApprovedByAdmin) {
      throw new BadRequestException('Payment is only allowed after guide confirmation and admin approval.');
    }

    if (booking.paymentStatus !== PaymentStatus.NOT_PAID && booking.paymentStatus !== PaymentStatus.REJECTED) {
      throw new BadRequestException('Payment is only allowed for unpaid or rejected bookings.');
    }

    // Verify Stripe payment status if it is a Stripe Checkout session ID
    if (transactionId.startsWith('cs_')) {
      try {
        const session = await this.stripe.checkout.sessions.retrieve(transactionId);
        if (session.payment_status !== 'paid') {
          throw new BadRequestException('Stripe Checkout Session has not been completed/paid');
        }
      } catch (err) {
        console.error('Stripe verification failed:', err);
        const dummyKeys = ['sk_test_dummy_key_if_not_configured', 'sk_test_xxxxxxxxx'];
        if (process.env.STRIPE_SECRET_KEY && !dummyKeys.includes(process.env.STRIPE_SECRET_KEY)) {
          throw new BadRequestException('Failed to verify Stripe payment: ' + err.message);
        }
      }
    }

    // Update payment status to Completed
    payment.status = 'Completed';
    await payment.save();

    // Update the booking status
    if (!booking.assignedGuide) {
      throw new BadRequestException('Payment is only allowed after admin approval and tour guide assignment.');
    }
    booking.paymentStatus = PaymentStatus.PAID;
    booking.bookingStatus = BookingStatus.CONFIRMED;
    booking.paymentMethod = payment.paymentMethod || 'Stripe';
    await booking.save();

    // Trigger notification
    await this.notificationsService.create(
      userId,
      `Payment successful of $${booking.totalAmount}. Your booking status has been updated to Confirmed.`,
      'success'
    );

    return payment;
  }

  async generateReceiptPdf(bookingId: string, userId: string, userRole: string, writeStream: Writable): Promise<void> {
    const booking = await this.bookingModel.findById(bookingId)
      .populate('customer', 'name email phoneNumber')
      .populate('assignedGuide', 'name email phoneNumber')
      .populate({
        path: 'package',
        populate: { path: 'destination' }
      })
      .exec();

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" not found`);
    }

    if (userRole !== Role.ADMIN && (booking.customer as any)._id.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to view this receipt');
    }

    if (booking.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException('Receipt is only available for paid bookings');
    }

    // Retrieve the matching completed payment log
    const payment = await this.paymentModel.findOne({ booking: bookingId, status: 'Completed' }).exec();
    const txnId = payment ? payment.transactionId : (booking.stripeSessionId || 'N/A');
    const payMethod = payment ? payment.paymentMethod : 'Stripe Checkout';
    const payDate = payment ? new Date(payment.updatedAt).toLocaleDateString() : new Date().toLocaleDateString();

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(writeStream);

    // Header Background
    doc.fillColor('#0F172A').rect(0, 0, 612, 100).fill();

    // Company Header
    doc.fillColor('#FFFFFF').fontSize(24).font('Helvetica-Bold').text('Explore Ceylon', 50, 35);
    doc.fontSize(10).font('Helvetica').text('Discover the Beauty of Sri Lanka', 50, 65);

    // PAID badge
    doc.fillColor('#16A34A').rect(450, 35, 112, 30).fill();
    doc.fillColor('#FFFFFF').fontSize(12).font('Helvetica-Bold').text('STATUS: PAID', 463, 44);

    // Title Section
    let y = 130;
    doc.fillColor('#0F172A').fontSize(18).font('Helvetica-Bold').text('Payment Receipt', 50, y);
    doc.fontSize(10).font('Helvetica-Oblique').text(`Receipt No: REC-${bookingId.substring(18).toUpperCase()}`, 50, y + 22);

    y += 50;

    // Receipt details rows
    const drawRow = (label: string, val: string, currentY: number) => {
      doc.fillColor('#475569').font('Helvetica-Bold').fontSize(10).text(label, 50, currentY);
      doc.fillColor('#0F172A').font('Helvetica').fontSize(10).text(val, 200, currentY);
      doc.moveTo(50, currentY + 15).lineTo(550, currentY + 15).strokeColor('#F1F5F9').stroke();
    };

    drawRow('Receipt No', `REC-${bookingId.substring(18).toUpperCase()}`, y); y += 22;
    drawRow('Transaction ID', txnId, y); y += 22;
    drawRow('Booking ID', bookingId, y); y += 22;
    drawRow('Customer Name', (booking.customer as any)?.name || 'N/A', y); y += 22;
    drawRow('Guide Name', (booking.assignedGuide as any)?.name || 'No Guide Assigned', y); y += 22;
    drawRow('Package Name', (booking.package as any)?.title || (booking.package as any)?.name || 'N/A', y); y += 22;
    drawRow('Travel Date', booking.travelDate ? new Date(booking.travelDate).toLocaleDateString() : 'N/A', y); y += 22;
    drawRow('Participants', `${booking.guestsCount} Guest(s)`, y); y += 22;
    drawRow('Amount Paid', `$${booking.totalAmount.toLocaleString()}`, y); y += 22;
    drawRow('Payment Date', payDate, y); y += 22;
    drawRow('Payment Method', payMethod, y); y += 22;

    y += 20;

    // Total Paid Box
    doc.fillColor('#F8FAFC').rect(50, y, 500, 45).fill();
    doc.fillColor('#16A34A').fontSize(14).font('Helvetica-Bold').text(`Total Secured: $${booking.totalAmount.toLocaleString()}`, 70, y + 15);

    y += 80;
    doc.fillColor('#94A3B8').fontSize(9).font('Helvetica-Oblique').text('This is an electronically generated payment invoice by Explore Ceylon.', 50, y, { align: 'center' });
    doc.text('Thank you for booking with us! Have a wonderful trip.', 50, y + 15, { align: 'center' });

    doc.end();
  }
}
