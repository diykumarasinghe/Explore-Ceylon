import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  async findAll(@Query('destination') destination?: string) {
    return this.reviewsService.findAll(destination);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(user._id.toString(), dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Body() updateDto: { rating?: number; comment?: string },
  ) {
    return this.reviewsService.update(id, user._id.toString(), updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.reviewsService.remove(id, user._id.toString());
  }
}
