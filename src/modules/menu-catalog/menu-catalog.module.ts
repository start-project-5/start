import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuCatalogService } from './menu-catalog.service';
import { MenuCatalogController } from './menu-catalog.controller';
import { MenuCatalogRepository } from './repositories/menu-catalog.repository';
import { MenuCatalogOwnerGuard } from './guards/menu-catalog-owner.guard';
import { MenuCatalog } from './entities/menu-catalog.entity';
import { RestaurantMenuModule } from '../menu-item/menu-item.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuCatalog]),
    forwardRef(() => RestaurantMenuModule),
  ],
  controllers: [MenuCatalogController],
  providers: [MenuCatalogService, MenuCatalogRepository, MenuCatalogOwnerGuard],
  exports: [MenuCatalogService, TypeOrmModule],
})
export class MenuCatalogModule {}