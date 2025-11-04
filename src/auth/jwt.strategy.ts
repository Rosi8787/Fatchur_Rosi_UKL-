import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'default_jwt_secret',
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    // Pastikan payload punya sub (user ID)
    const user = await this.prisma.users.findUnique({ where: { id: payload.sub } });
    if (!user) return null;

    // Hapus password dari response
    const { password, ...rest } = user;

    // Gabungkan data dari token + database
    return {
      sub: user.id,          // ID user dari database
      email: user.email,     // email dari database
      role: user.role,       // role dari database
      name: user.name,       // opsional tambahan
    };
  }
}