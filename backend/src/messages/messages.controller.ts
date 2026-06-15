import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagesService.create(user._id.toString(), user.role, dto);
  }

  @Get('unread/count')
  async getUnreadCount(@CurrentUser() user: UserDocument) {
    const count = await this.messagesService.getUnreadCount(user._id.toString(), user.role);
    return { count };
  }

  @Get('booking/:bookingId')
  async findForBooking(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.messagesService.findForBooking(bookingId, user._id.toString(), user.role);
  }

  @Patch('read/:id')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.messagesService.markAsRead(id, user._id.toString(), user.role);
  }
}
