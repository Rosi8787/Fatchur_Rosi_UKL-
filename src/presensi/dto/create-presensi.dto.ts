import { IsNumber, IsString, IsOptional, IsISO8601 } from 'class-validator';

export class CreatePresensiDto {
  @IsNumber()
  userId: number;

  @IsString()
  status: string; // HADIR | IZIN | SAKIT | ALFA

  @IsOptional()
  @IsISO8601()
  checkInAt?: string;

  @IsOptional()
  @IsISO8601()
  checkOutAt?: string;

  @IsOptional()
  @IsString()
  note?: string;
}