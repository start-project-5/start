import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Attraction } from './entity/attraction.entity';
import { AttractionService } from './attraction.service';
import { AttractionController } from './attraction.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attraction]),
    MulterModule.register({ dest: './uploads/attractions' }),
  ],
  controllers: [AttractionController],
  providers: [AttractionService],
  exports: [AttractionService],
})

export class AttractionModule {}
