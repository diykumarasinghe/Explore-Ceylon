import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('bookings')
  async getBookings() {
    return this.reportsService.getBookingsReport();
  }

  @Get('revenue')
  async getRevenue() {
    return this.reportsService.getRevenueReport();
  }

  @Get('destinations')
  async getDestinations() {
    return this.reportsService.getDestinationsReport();
  }

  @Get('export-pdf')
  async exportPdf(@Res() res: Response) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=explore-ceylon-audit-report.pdf');
    await this.reportsService.generatePdfReport(res);
  }
}
