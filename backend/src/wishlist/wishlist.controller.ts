import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddWishlistDto } from './dto/add-wishlist.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER, Role.ADMIN)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() dto: AddWishlistDto,
  ) {
    return this.wishlistService.create(user, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.wishlistService.findAll(user);
  }

  @Delete(':packageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('packageId') packageId: string,
    @CurrentUser() user: any,
  ) {
    return this.wishlistService.remove(packageId, user);
  }
}

