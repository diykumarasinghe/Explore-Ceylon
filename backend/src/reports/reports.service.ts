import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import { Destination, DestinationDocument } from '../destinations/schemas/destination.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { BookingStatus } from '../common/enums/booking-status.enum';
import * as PDFDocument from 'pdfkit';
import { Writable } from 'stream';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Destination.name) private destinationModel: Model<DestinationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getBookingsReport() {
    const [total, byStatus, rawBookings] = await Promise.all([
      this.bookingModel.countDocuments().exec(),
      this.bookingModel.aggregate([
        { $group: { _id: '$bookingStatus', count: { $sum: 1 } } }
      ]).exec(),
      this.bookingModel.find().exec()
    ]);

    const statuses = {
      [BookingStatus.PENDING]: 0,
      [BookingStatus.AWAITING_GUIDE_ASSIGNMENT]: 0,
      [BookingStatus.GUIDE_ASSIGNED]: 0,
      [BookingStatus.GUIDE_ACCEPTED]: 0,
      [BookingStatus.GUIDE_REJECTED]: 0,
      [BookingStatus.CONFIRMED]: 0,
      [BookingStatus.ONGOING]: 0,
      [BookingStatus.CANCELLED]: 0,
      [BookingStatus.COMPLETED]: 0,
    };

    byStatus.forEach(item => {
      if (item._id in statuses) {
        statuses[item._id] = item.count;
      }
    });

    // Compute monthly trend (last 6 months)
    const monthlyTrend = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthlyTrend[label] = 0;
    }

    rawBookings.forEach(b => {
      const date = new Date(b.bookingDate);
      const label = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (label in monthlyTrend) {
        monthlyTrend[label]++;
      }
    });

    return {
      total,
      byStatus: statuses,
      monthlyTrend
    };
  }

  async getRevenueReport() {
    const bookings = await this.bookingModel.find()
      .populate({
        path: 'package',
        populate: { path: 'destination' }
      })
      .exec();

    let settledFunds = 0; // Completed
    let receivablesFunds = 0; // Confirmed
    let escrowFunds = 0; // Pending or Approved (before confirmation)
    let cancelledFunds = 0; // Cancelled

    const categoryRevenue = {};

    bookings.forEach(b => {
      const amount = b.totalAmount || 0;
      if (b.bookingStatus === BookingStatus.COMPLETED) {
        settledFunds += amount;
      } else if (b.bookingStatus === BookingStatus.CONFIRMED || b.bookingStatus === BookingStatus.ONGOING) {
        receivablesFunds += amount;
      } else if (
        b.bookingStatus === BookingStatus.PENDING ||
        b.bookingStatus === BookingStatus.AWAITING_GUIDE_ASSIGNMENT ||
        b.bookingStatus === BookingStatus.GUIDE_ASSIGNED ||
        b.bookingStatus === BookingStatus.GUIDE_ACCEPTED ||
        b.bookingStatus === BookingStatus.GUIDE_REJECTED
      ) {
        escrowFunds += amount;
      } else if (b.bookingStatus === BookingStatus.CANCELLED) {
        cancelledFunds += amount;
      }

      if (b.bookingStatus !== BookingStatus.CANCELLED && b.package) {
        const cat = (b.package as any).category || 'Other';
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + amount;
      }
    });

    const activeTotalRevenue = settledFunds + receivablesFunds;

    return {
      overview: {
        settledFunds,
        receivablesFunds,
        escrowFunds,
        cancelledFunds,
        activeTotalRevenue
      },
      categoryRevenue
    };
  }

  async getDestinationsReport() {
    const [destinations, bookings] = await Promise.all([
      this.destinationModel.find().exec(),
      this.bookingModel.find().populate('package').exec()
    ]);

    const stats = destinations.map(dest => {
      // Find bookings for this destination
      const destBookings = bookings.filter(b => {
        if (!b.package) return false;
        const destId = (b.package as any).destination || (b.package as any).destinationId;
        return destId && destId.toString() === dest._id.toString();
      });

      const totalBookings = destBookings.length;
      const totalRevenue = destBookings
        .filter(b => b.bookingStatus === BookingStatus.CONFIRMED || b.bookingStatus === BookingStatus.ONGOING || b.bookingStatus === BookingStatus.COMPLETED)
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      return {
        id: dest._id,
        name: (dest as any).name || (dest as any).title,
        location: dest.location,
        category: dest.category,
        rating: dest.rating,
        totalBookings,
        totalRevenue
      };
    });

    return stats;
  }

  async generatePdfReport(writeStream: Writable): Promise<void> {
    const doc = new PDFDocument({ margin: 50 });

    doc.pipe(writeStream);

    // Header Title
    doc.fontSize(24).font('Helvetica-Bold').text('Explore Ceylon Travel Platform', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Official Executive Audit & Performance Report', { align: 'center' });
    doc.fontSize(10).font('Helvetica-Oblique').text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} • Currency: USD ($)`, { align: 'center' });
    doc.moveDown(2);

    // Get Data
    const bookingsData = await this.getBookingsReport();
    const revenueData = await this.getRevenueReport();
    const destData = await this.getDestinationsReport();

    // Section 1: Financial Analytics
    doc.fontSize(16).font('Helvetica-Bold').text('1. Accounting Balance Sheet', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    
    doc.text(`Settled Funds (Completed tours): $${revenueData.overview.settledFunds.toLocaleString()}`);
    doc.text(`Receivables Funds (Confirmed tours): $${revenueData.overview.receivablesFunds.toLocaleString()}`);
    doc.text(`Escrow Funds (Pending/Approved bookings): $${revenueData.overview.escrowFunds.toLocaleString()}`);
    doc.text(`Cancelled Funds: $${revenueData.overview.cancelledFunds.toLocaleString()}`);
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#10B981').text(`Active Total Revenue (Settled + Receivables): $${revenueData.overview.activeTotalRevenue.toLocaleString()}`);
    doc.fillColor('black');
    doc.moveDown(1.5);

    // Section 2: Bookings Statistics
    doc.fontSize(16).font('Helvetica-Bold').text('2. Bookings Distribution', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total Bookings Count: ${bookingsData.total}`);
    doc.text(`  - Pending: ${bookingsData.byStatus[BookingStatus.PENDING]}`);
    doc.text(`  - Awaiting Guide: ${bookingsData.byStatus[BookingStatus.AWAITING_GUIDE_ASSIGNMENT]}`);
    doc.text(`  - Guide Assigned: ${bookingsData.byStatus[BookingStatus.GUIDE_ASSIGNED]}`);
    doc.text(`  - Guide Accepted: ${bookingsData.byStatus[BookingStatus.GUIDE_ACCEPTED]}`);
    doc.text(`  - Guide Rejected: ${bookingsData.byStatus[BookingStatus.GUIDE_REJECTED]}`);
    doc.text(`  - Confirmed: ${bookingsData.byStatus[BookingStatus.CONFIRMED]}`);
    doc.text(`  - Ongoing: ${bookingsData.byStatus[BookingStatus.ONGOING]}`);
    doc.text(`  - Completed: ${bookingsData.byStatus[BookingStatus.COMPLETED]}`);
    doc.text(`  - Cancelled: ${bookingsData.byStatus[BookingStatus.CANCELLED]}`);
    doc.moveDown(1.5);

    // Section 3: Destination Performance Table
    doc.fontSize(16).font('Helvetica-Bold').text('3. Destination Performance Overview', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);

    // Draw Table Headers
    const tableTop = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Destination', 50, tableTop);
    doc.text('Category', 200, tableTop);
    doc.text('Rating', 300, tableTop);
    doc.text('Bookings', 380, tableTop);
    doc.text('Revenue', 460, tableTop);
    
    doc.font('Helvetica');
    let currentY = tableTop + 20;
    doc.moveTo(50, currentY - 5).lineTo(550, currentY - 5).stroke();

    destData.forEach(dest => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
      doc.text(dest.name.substring(0, 25), 50, currentY);
      doc.text(dest.category, 200, currentY);
      doc.text(dest.rating.toFixed(1), 300, currentY);
      doc.text(dest.totalBookings.toString(), 380, currentY);
      doc.text(`$${dest.totalRevenue.toLocaleString()}`, 460, currentY);
      currentY += 20;
    });

    doc.end();
  }
}
