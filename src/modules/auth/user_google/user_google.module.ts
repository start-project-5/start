import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/user.entity";
import { UserGoogleService } from "./user_google.service";

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UserGoogleService],
    exports: [UserGoogleService]
})

export class UserGoogleModule {}