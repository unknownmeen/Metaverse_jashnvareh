import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(phone: string, password: string): Promise<{ accessToken: string; user: User }> {
    const user = await this.prisma.user.findUnique({ where: { phone } });

    if (!user) {
      throw new UnauthorizedException('شماره تلفن یا رمز عبور نادرست است');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('شماره تلفن یا رمز عبور نادرست است');
    }

    const payload = { sub: user.id, phone: user.phone };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, user };
  }
}
