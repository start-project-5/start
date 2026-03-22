import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuCatalogModule } from '../menu-catalog/menu-catalog.module';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { RestaurantMenuOwnerGuard } from './guards/menu-item-owner.guard';
import { RestaurantMenuItem } from './entities/menu-item.entity';
import { RestaurantMenuService } from './menu-item.service';
import { RestaurantMenuController } from './menu-item.controller';
import { RestaurantMenuRepository } from './repositories/menu-item.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([RestaurantMenuItem]),
    forwardRef(() => MenuCatalogModule),
    forwardRef(() => RestaurantModule),
  ],
  controllers: [RestaurantMenuController],
  providers: [RestaurantMenuService, RestaurantMenuRepository, RestaurantMenuOwnerGuard],
  exports: [RestaurantMenuService, TypeOrmModule],
})
export class RestaurantMenuModule {}