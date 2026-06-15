import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@CurrentUser() user: UserDocument) {
    return this.notificationsService.findAll(user._id.toString());
  }

  @Patch(':id/read')
  async read(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.notificationsService.markAsRead(id, user._id.toString());
  }
}
