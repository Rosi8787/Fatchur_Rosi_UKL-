import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.users.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return user;
  }

  async create(data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.users.create({
      data: { ...data, password: hashedPassword },
    });
  }

  async update(id: number, data: UpdateUserDto) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    return this.prisma.users.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    return this.prisma.users.delete({ where: { id } });
  }
}