import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Restaurant } from "./entity/restaurant.entity";
import { RestaurantService } from "./restaurant.service";
import { RestaurantController } from "./restaurant.controller";
import { RestaurantRepository } from "./repositories/restaurant.repository";
import { RestaurantOwnerGuard } from "./guards/owner-guard";

@Module({
    imports: [
        TypeOrmModule.forFeature([Restaurant]),
    ],
    controllers: [RestaurantController],
    providers: [RestaurantService, RestaurantRepository, RestaurantOwnerGuard],
    exports: [RestaurantService, TypeOrmModule]
})

export class RestaurantModule {}