import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotel } from './entity/hotel.entity';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { HotelRepository } from './repositories/hotel.repository';
import { HotelOwnerGuard } from './guards/owner-guard';

@Module({
  imports: [TypeOrmModule.forFeature([Hotel])],
  controllers: [HotelController],
  providers: [HotelService, HotelRepository, HotelOwnerGuard],
  exports: [HotelService, TypeOrmModule],
})
export class HotelModule {}

// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Hotel } from './entity/hotel.entity';
// import { HotelService } from './hotel.service';
// import { HotelController } from './hotel.controller';
// import { HotelRepository } from './repositories/hotel.repository';

// @Module({
//   imports: [TypeOrmModule.forFeature([Hotel])],
//   controllers: [HotelController],
//   providers: [HotelService, HotelRepository],
//   exports: [HotelService],
// })
// export class HotelModule {}