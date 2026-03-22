import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/db-config';
import { LoggerModule } from './modules/logger/logger.module';

import { RestaurantModule } from './modules/restaurant/restaurant.module';
import { AuthModule } from './modules/auth/auth.module';
import { GuideModule } from './modules/guide/guide.module';
import { EventModule } from './modules/event/event.module';
import { HotelModule } from './modules/hotel/hotel.module';
import { AttractionModule } from './modules/attraction/attraction.module';
import { MenuCatalogModule } from './modules/menu-catalog/menu-catalog.module';
import { RestaurantMenuModule } from './modules/menu-item/menu-item.module';


/**
 * AppModule — the root module of the application.
 *
 * It does three things:
 *   1. Loads environment variables from .env (ConfigModule)
 *   2. Connects to PostgreSQL (TypeOrmModule)
 *   3. Registers all feature modules
 */
@Module({
  imports: [
    // 1. Make .env values available everywhere via ConfigService
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true, // no need to import ConfigModule again in other modules
    }),

    // 2. Connect to the database using our DatabaseConfig class
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),

    // 3. Feature modules
    // UsersModule,
    LoggerModule,
    RestaurantModule,
    AuthModule,
    GuideModule,
    EventModule,
    HotelModule,
    AttractionModule,
    MenuCatalogModule,
    RestaurantMenuModule,
  ],
})


export class AppModule {}
