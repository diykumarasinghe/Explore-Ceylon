import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { TourGuidesService } from './tour-guides.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tour-guides')
export class TourGuidesController {
  constructor(private readonly tourGuidesService: TourGuidesService) {}

  @Roles(Role.ADMIN)
  @Post('assign')
  async assignGuide(
    @Body('bookingId') bookingId: string,
    @Body('guideId') guideId: string,
  ) {
    return this.tourGuidesService.assignGuide(bookingId, guideId);
  }

  @Roles(Role.TOUR_GUIDE)
  @Get('assignments')
  async getAssignments(@CurrentUser() user: UserDocument) {
    return this.tourGuidesService.getAssignments(user._id.toString());
  }

  @Roles(Role.TOUR_GUIDE)
  @Patch('assignments/:id/progress')
  async updateProgress(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Body() updateDto: { tourProgress?: string; notes?: string; status?: string },
  ) {
    return this.tourGuidesService.updateProgress(id, user._id.toString(), updateDto);
  }
}
