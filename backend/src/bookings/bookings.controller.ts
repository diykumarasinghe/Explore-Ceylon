import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TourStatus } from '../common/enums/tour-status.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(
    @CurrentUser() user: UserDocument,
    @Body() createDto: CreateBookingDto,
  ) {
    return this.bookingsService.create(user._id.toString(), createDto);
  }

  @Get()
  async findAll(@CurrentUser() user: UserDocument) {
    return this.bookingsService.findAll(user);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.bookingsService.findOne(id, user._id.toString(), user.role);
  }

  @Patch(':id')
  async updateStatus(
    @Param('id') id: string,
    @Body() statusDto: UpdateBookingStatusDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.bookingsService.updateStatus(
      id,
      statusDto,
      user._id.toString(),
      user.role,
    );
  }

  @Roles(Role.ADMIN)
  @Patch(':id/admin-review')
  async adminReview(
    @Param('id') id: string,
    @Body('action') action: 'approve' | 'reject',
    @Body('guideId') guideId: string | undefined,
    @CurrentUser() user: UserDocument,
  ) {
    if (!action || !['approve', 'reject'].includes(action)) {
      throw new BadRequestException('Action must be either approve or reject');
    }
    return this.bookingsService.adminReview(id, action, guideId, user._id.toString());
  }

  @Roles(Role.CUSTOMER)
  @Patch(':id/submit-payment')
  @UseInterceptors(
    FileInterceptor('receipt', {
      storage: diskStorage({
        destination: './uploads/receipts',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async submitPayment(
    @Param('id') id: string,
    @Body('paymentMethod') paymentMethod: string,
    @UploadedFile() file: any,
    @CurrentUser() user: UserDocument,
  ) {
    if (!file) {
      throw new BadRequestException('Payment receipt file is required');
    }
    if (!paymentMethod) {
      throw new BadRequestException('Payment method is required');
    }
    const receiptPath = `/uploads/receipts/${file.filename}`;
    return this.bookingsService.submitPayment(id, paymentMethod, receiptPath, user._id.toString());
  }

  @Roles(Role.ADMIN)
  @Patch(':id/verify-payment')
  async verifyPayment(
    @Param('id') id: string,
    @Body('action') action: 'approve' | 'reject',
    @CurrentUser() user: UserDocument,
  ) {
    if (!action || !['approve', 'reject'].includes(action)) {
      throw new BadRequestException('Action must be either approve or reject');
    }
    return this.bookingsService.verifyPayment(id, action, user._id.toString());
  }

  @Roles(Role.TOUR_GUIDE)
  @Patch(':id/tour-status')
  async updateTourStatus(
    @Param('id') id: string,
    @Body('tourStatus') tourStatus: TourStatus,
    @Body('tourProgress') tourProgress: string | undefined,
    @CurrentUser() user: UserDocument,
  ) {
    if (!tourStatus || !Object.values(TourStatus).includes(tourStatus)) {
      throw new BadRequestException('A valid tour status is required');
    }
    return this.bookingsService.updateTourStatus(id, tourStatus, tourProgress, user._id.toString());
  }

  @Roles(Role.TOUR_GUIDE)
  @Patch(':id/guide-decision')
  async guideDecision(
    @Param('id') id: string,
    @Body('action') action: 'accept' | 'reject',
    @Body('rejectionReason') rejectionReason: string | undefined,
    @CurrentUser() user: UserDocument,
  ) {
    if (!action || !['accept', 'reject'].includes(action)) {
      throw new BadRequestException('Action must be either accept or reject');
    }
    if (action === 'reject' && (!rejectionReason || !rejectionReason.trim())) {
      throw new BadRequestException('Rejection reason is required when rejecting a tour request');
    }
    return this.bookingsService.guideDecision(
      id,
      action,
      rejectionReason,
      user._id.toString(),
    );
  }
}
