import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(name: string, email: string, password: string, role = 'SISWA') {
    const exists = await this.prisma.users.findUnique({ where: { email }});
    if (exists) throw new BadRequestException('Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.prisma.users.create({
      data: { name, email, password: hashed, role }
    });
    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    return { user: this._sanitize(user), access_token: token };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.users.findUnique({ where: { email }});
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    return { user: this._sanitize(user), access_token: token };
  }

  private _sanitize(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}