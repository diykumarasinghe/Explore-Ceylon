import { Controller, Post, Body, UseGuards, Get, Param, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment')
  async createPayment(
    @CurrentUser() user: UserDocument,
    @Body('bookingId') bookingId: string,
    @Body('paymentMethod') paymentMethod: string,
  ) {
    return this.paymentsService.createPayment(user._id.toString(), bookingId, paymentMethod);
  }

  @Post('confirm-payment')
  async confirmPayment(
    @CurrentUser() user: UserDocument,
    @Body('bookingId') bookingId: string,
    @Body('transactionId') transactionId: string,
  ) {
    return this.paymentsService.confirmPayment(user._id.toString(), bookingId, transactionId);
  }

  @Get('receipt/:bookingId/pdf')
  async downloadReceiptPdf(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: UserDocument,
    @Res() res: any,
  ) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=explore-ceylon-receipt-${bookingId}.pdf`);
    await this.paymentsService.generateReceiptPdf(bookingId, user._id.toString(), user.role, res);
  }
}
