import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MuseumService } from './museum.service';
import { MuseumController } from './museum.controller';
import { MuseumRepository } from './repositories/museum.repository';
import { MuseumOwnerGuard } from './guards/owner.guard';
import { Museum } from './entity/museum.entity';
import { Exhibit } from './entity/exhibit.entity';
import { Gallery } from './entity/gallery.entity';
import { Reviews } from './entity/review.entity';
import { Favorite } from './entity/favorite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Museum, Exhibit, Gallery, Reviews, Favorite]),
  ],
  controllers: [MuseumController],
  providers: [MuseumService, MuseumRepository, MuseumOwnerGuard],
  exports: [MuseumService, TypeOrmModule],
})
export class MuseumModule {}

// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { MuseumService } from './museum.service';
// import { MuseumController } from './museum.controller';
// import { MuseumRepository } from './repositories/museum.repository';
// import { MuseumOwnerGuard } from './guards/owner.guard';
// import { Museum } from './entity/museum.entity';
// import { Exhibit } from './entity/exhibit.entity';
// import { Gallery } from './entity/gallery.entity';
// import { Review } from '../review/entity/review.entity';
// import { Favorite } from './entity/favorite.entity';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([Museum, Exhibit, Gallery, Review, Favorite]),
//   ],
//   controllers: [MuseumController],
//   providers: [MuseumService, MuseumRepository, MuseumOwnerGuard],
//   exports: [MuseumService, TypeOrmModule],
// })
// export class MuseumModule {}