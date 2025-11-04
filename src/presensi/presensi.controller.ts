import { Body, Controller, Get, Param, Post, Query, UseGuards, Req } from '@nestjs/common';
import { PresensiService } from './presensi.service';
import { CreatePresensiDto } from './dto/create-presensi.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@Controller('attendance')
export class PresensiController {
  constructor(private readonly presensiService: PresensiService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: CreatePresensiDto) {
    const p = await this.presensiService.create(
      body.userId,
      body.status,
      body.checkInAt,
      body.checkOutAt,
      body.note,
    );
    return { status: 'success', data: p };
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async history(
    @Req() req: Request,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    const user = (req as any).user as any;
    const userId = Number(user?.sub);
    if (!userId) throw new Error('User ID tidak ditemukan di token JWT');

    const f = from ? new Date(from) : undefined;
    const t = to ? new Date(to) : undefined;
    const res = await this.presensiService.history(userId, f, t, Number(page), Number(limit));

    return { status: 'success', meta: res.meta, data: res.data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  async summary(
    @Req() req: Request,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    console.log('User dari JWT:', (req as any).user);
    const user = (req as any).user ;
    const userId = Number(user?.sub);
    if (!userId) throw new Error('User ID tidak ditemukan di token JWT');

    const y = year ? Number(year) : new Date().getUTCFullYear();
    const m = month ? Number(month) : new Date().getUTCMonth() + 1;
    const res = await this.presensiService.summaryMonthly(userId, y, m);

    return { status: 'success', data: res };
  }

  @UseGuards(JwtAuthGuard)
  @Post('analysis')
  async analysis(
    @Body()
    body: {
      date_from: string;
      date_to: string;
      group_by?: string;
      filters?: any;
      compare?: boolean;
    },
  ) {
    if (!body.date_from || !body.date_to) {
      throw new Error('Parameter date_from dan date_to wajib diisi');
    }

    const dateFrom = new Date(body.date_from);
    const dateTo = new Date(body.date_to);

    if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) {
      throw new Error('Format tanggal tidak valid. Gunakan format YYYY-MM-DD');
    }

    const res = await this.presensiService.analysis(
      dateFrom,
      dateTo,
      body.group_by ?? 'role',
      body.filters,
      body.compare,
    );

    return { status: 'success', data: res };
  }
}