import { Body, Controller, Get, Param, Post, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: CreateUserDto) {
    const u = await this.userService.create(body);
    return { status: 'success', data: u };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const u = await this.userService.update(Number(id), body);
    return { status: 'success', data: u };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const u = await this.userService.findOne(Number(id));
    return { status: 'success', data: u };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    return { status: 'success', data: users };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const res = await this.userService.remove(Number(id));
    return { status: 'success', data: res };
  }
}