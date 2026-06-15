import { Controller, Post, Body, Get, UseGuards, Patch, UseInterceptors, UploadedFile, BadRequestException, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordResetDto } from './dto/forgot-password-reset.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password/:token')
  async resetPassword(@Param('token') token: string, @Body() resetDto: any) {
    return this.authService.resetPassword(token, resetDto);
  }

  @Post('forgot-password-reset')
  async forgotPasswordReset(@Body() forgotPasswordResetDto: ForgotPasswordResetDto) {
    return this.authService.forgotPasswordReset(forgotPasswordResetDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: UserDocument) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@CurrentUser() user: UserDocument, @Body() updateDto: any) {
    return this.authService.updateProfile(user._id.toString(), updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@CurrentUser() user: UserDocument, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.authService.changePassword(user._id.toString(), body.currentPassword, body.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return { url: `/uploads/${file.filename}` };
  }
}
