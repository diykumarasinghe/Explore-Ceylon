import { Controller, Get, Patch, Body, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    const updated = await this.usersService.update(id, updateDto);
    if (!updated) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return updated;
  }
}
