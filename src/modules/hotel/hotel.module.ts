import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Hotel } from "./entity/hotel.entity";
import { HotelService } from "./hotel.service";
import { HotelController } from "./hotel.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([Hotel]),
    ],
    controllers: [HotelController],
    providers: [HotelService],
    exports: [HotelService, TypeOrmModule]
})

export class HotelModule {}