import { Module } from '@nestjs/common';
import { BcryptService } from './bcrypt.service';
import { BcryptController } from './bcrypt.controller';

@Module({
  providers: [BcryptService],
  exports: [BcryptService],
  controllers: [BcryptController],
})
export class BcryptModule {}
