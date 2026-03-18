import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Guide } from './entity/guide.entity';
import { GuideController } from './guide.controller';
import { GuideService } from './guide.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guide]),
    MulterModule.register({ dest: './uploads/guides' }),
  ],
  controllers: [GuideController],
  providers: [GuideService],
  exports: [GuideService], // BookingModule & ReviewModule need this
})
export class GuideModule {}