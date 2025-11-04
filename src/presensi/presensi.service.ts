import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class PresensiService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, status: string, checkInAt?: string, checkOutAt?: string, note?: string | undefined) {
    // prevent duplicate check-in for same day
    const from = startOfDay(new Date());
    const to = endOfDay(new Date());
    const exists = await this.prisma.presensi.findFirst({
      where: {
        userId,
        tanggal: { gte: from, lte: to }
      }
    });
    if (exists) throw new BadRequestException('User already has attendance record today');

    const created = await this.prisma.presensi.create({
      data: {
        userId,
        status,
        tanggal: new Date(),
        checkInAt: checkInAt ? new Date(checkInAt) : undefined,
        checkOutAt: checkOutAt ? new Date(checkOutAt) : undefined
      }
    });
    return created;
  }

  async history(userId: number, from?: Date, to?: Date, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (from || to) {
      where.tanggal = {};
      if (from) where.tanggal.gte = from;
      if (to) where.tanggal.lte = to;
    }
    const [data, total] = await Promise.all([
      this.prisma.presensi.findMany({
        where,
        orderBy: { tanggal: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.presensi.count({ where })
    ]);
    return { meta: { page, limit, total }, data };
  }

  async summaryMonthly(userId: number, year: number, month: number) {
    const from = new Date(Date.UTC(year, month - 1, 1));
    const to = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    const records = await this.prisma.presensi.findMany({
      where: { userId, tanggal: { gte: from, lte: to } }
    });

    let totalWorkingDays = 0;
    for (let d = new Date(from); d <= to; d.setUTCDate(d.getUTCDate() + 1)) {
      const day = d.getUTCDay();
      if (day !== 0 && day !== 6) totalWorkingDays++;
    }
    const presentDays = records.filter(r => r.status === 'HADIR').length;
    const absenceDays = totalWorkingDays - presentDays;
    const percent = totalWorkingDays === 0 ? 0 : +(presentDays / totalWorkingDays * 100).toFixed(2);
    return {
      userId,
      year,
      month,
      total_working_days: totalWorkingDays,
      present_days: presentDays,
      absence_days: absenceDays,
      present_percentage: percent,
      details: records
    };
  }

   async analysis(
    dateFrom: Date,
    dateTo: Date,
    group_by: string,
    filters?: any,
    compare?: boolean,
  ) {
    if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) {
      throw new Error('Tanggal tidak valid di analysis()');
    }

    const users = await this.prisma.users.findMany({
      where: filters || {},
    });

    const results: {
      group: string;
      present: number;
      total: number;
      percentage: number;
    }[] = [];

    for (const user of users) {
      const total = await this.prisma.presensi.count({
        where: {
          userId: user.id,
          tanggal: { gte: dateFrom, lte: dateTo },
        },
      });

      const hadir = await this.prisma.presensi.count({
        where: {
          userId: user.id,
          tanggal: { gte: dateFrom, lte: dateTo },
          status: 'HADIR',
        },
      });

      const percentage = total > 0 ? (hadir / total) * 100 : 0;

      const groupValue = (user as any)[group_by] || 'UNKNOWN';
      const existing = results.find((r) => r.group === groupValue);

      if (existing) {
        existing.present += hadir;
        existing.total += total;
        existing.percentage = (existing.present / existing.total) * 100;
      } else {
        results.push({
          group: groupValue,
          present: hadir,
          total,
          percentage,
        });
      }
    }

    results.sort((a, b) => b.percentage - a.percentage);

    return results;
  }
}