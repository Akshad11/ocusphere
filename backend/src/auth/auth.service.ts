import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as argon2 from 'argon2';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated. Please contact an administrator.');
    }

    const isMatch = await argon2.verify(user.passwordHash, pass);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto, res?: Response) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // Update lastLogin timestamp
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Record audit log
    await this.prisma.auditLog.create({
      data: {
        actorName: user.fullName,
        actorRole: user.role,
        action: 'LOGIN',
        entity: 'Staff',
        entityId: user.id,
        summary: `Staff ${user.fullName} logged into administrative portal.`,
        userId: user.id,
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      employeeCode: user.employeeCode,
    };

    const accessToken = this.jwtService.sign(payload);

    if (res) {
      res.cookie('ocusphere_jwt', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    return {
      user,
      accessToken,
      tokenType: 'Bearer',
      expiresIn: '7d',
    };
  }

  async logout(res?: Response) {
    if (res) {
      res.clearCookie('ocusphere_jwt');
    }
    return { message: 'Logged out successfully.' };
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const isCurrentValid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!isCurrentValid) {
      throw new BadRequestException('Current password does not match.');
    }

    const newHash = await argon2.hash(dto.newPassword, { type: argon2.argon2id });
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    await this.prisma.auditLog.create({
      data: {
        actorName: user.fullName,
        actorRole: user.role,
        action: 'UPDATE',
        entity: 'Staff',
        entityId: user.id,
        summary: `Staff ${user.fullName} updated their account security credentials.`,
        userId: user.id,
      },
    });

    return { message: 'Password updated successfully.' };
  }
}
