import { Injectable, ConflictException, UnauthorizedException, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordResetDto } from './dto/forgot-password-reset.dto';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../users/schemas/user.schema';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<UserDocument> {
    const email = registerDto.email.toLowerCase().trim();
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    if (registerDto.role === 'Admin') {
      const adminCount = await this.usersService.countAdmins();
      if (adminCount >= 1) {
        throw new ConflictException('Admin already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    try {
      const user = await this.usersService.create({
        ...registerDto,
        email,
        password: hashedPassword,
      });
      
      // Return user object without password
      const userObj = user.toObject();
      delete userObj.password;
      return userObj as UserDocument;
    } catch (error) {
      if (error.code === 11000 || error.message?.includes('duplicate key')) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: any }> {
    const email = loginDto.email.toLowerCase().trim();
    console.log('[AuthService] Normalized login email:', email);
    
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      console.log('[AuthService] User lookup result: not found for email:', email);
      throw new UnauthorizedException('Invalid email or password');
    }
    console.log('[AuthService] User lookup result: found for email:', email);

    if (user.isActive === false) {
      console.log('[AuthService] User account is disabled:', email);
      throw new UnauthorizedException('Your account has been disabled. Please contact administration.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    console.log('[AuthService] Password match result:', isPasswordValid);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      email: user.email,
      sub: user._id.toString(),
      role: user.role,
    };

    const userObj = user.toObject();
    delete userObj.password;

    return {
      accessToken: this.jwtService.sign(payload),
      user: userObj,
    };
  }

  async forgotPassword(email: string): Promise<{ message: string; resetUrl?: string }> {
    const normalizedEmail = email?.toLowerCase().trim();
    const user = await this.usersService.findByEmail(normalizedEmail);
    
    // Do not reveal whether the email exists.
    if (!user) {
      return {
        message: 'If an account exists with this email, password reset instructions will be sent.',
      };
    }

    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token expires in 15 minutes
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    // Save token and expires to database
    await this.usersService.update(user._id.toString(), {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expires,
    } as any);

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    console.log(`[ForgotPassword] Generated token for ${normalizedEmail}: ${resetToken}`);
    console.log(`[ForgotPassword] Reset URL: ${resetUrl}`);

    // Return the reset URL in the response or log it in console
    return {
      message: 'If an account exists with this email, password reset instructions will be sent.',
      resetUrl,
    };
  }

  async resetPassword(token: string, passwordDto: any): Promise<{ message: string }> {
    const crypto = await import('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.usersService.findByResetToken(hashedToken);
    if (!user) {
      throw new BadRequestException('Password reset token is invalid or has expired.');
    }

    const hashedPassword = await bcrypt.hash(passwordDto.password, 10);
    await this.usersService.updatePasswordAndClearReset(user._id.toString(), hashedPassword);

    return {
      message: 'Password has been reset successfully.',
    };
  }

  async forgotPasswordReset(forgotPasswordResetDto: ForgotPasswordResetDto): Promise<{ message: string }> {
    const email = forgotPasswordResetDto.email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const hashedPassword = await bcrypt.hash(forgotPasswordResetDto.newPassword, 10);
      await this.usersService.updatePasswordAndClearReset(user._id.toString(), hashedPassword);
    }

    return {
      message: 'If an account exists with this email, the password has been updated.',
    };
  }

  async updateProfile(userId: string, updateDto: any): Promise<UserDocument> {
    if (updateDto.password) {
      updateDto.password = await bcrypt.hash(updateDto.password, 10);
    }
    try {
      const updated = await this.usersService.update(userId, updateDto);
      if (!updated) {
        throw new NotFoundException('User not found');
      }
      return updated;
    } catch (error) {
      if (error.code === 11000 || error.message?.includes('duplicate key')) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findByIdWithPassword(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect.');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(userId, { password: hashedPassword } as any);
    return { message: 'Password changed successfully.' };
  }
}
