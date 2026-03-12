import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/database.config';
 
import { UsersModule }       from './modules/users/users.module';
import { GuidesModule }      from './modules/guides/guides.module';
import { ReviewsModule }     from './modules/reviews/reviews.module';
import { BookingsModule }    from './modules/bookings/bookings.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { HotelsModule }      from './modules/hotels/hotels.module';
import { AttractionsModule } from './modules/attractions/attractions.module';
import { MuseumsModule }     from './modules/museums/museums.module';
import { EventsModule }      from './modules/events/events.module';
import { TransportModule }   from './modules/transport/transport.module';
 
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
      isGlobal: true,   // no need to import ConfigModule again in other modules
      envFilePath: '.env',
    }),
 
    // 2. Connect to the database using our DatabaseConfig class
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
 
    // 3. Feature modules
    UsersModule,
    GuidesModule,
    ReviewsModule,
    BookingsModule,
    RestaurantsModule,
    HotelsModule,
    AttractionsModule,
    MuseumsModule,
    EventsModule,
    TransportModule,
  ],
})
