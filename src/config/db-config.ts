import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Attraction } from 'src/modules/attraction/entity/attraction.entity';
import { User } from 'src/modules/auth/user/user.entity';

// ── Entities ──────────────────────────────────────────────────────────────
// Every entity must be listed here so TypeORM knows which tables to manage.

// import { User } from 'src/modules/auth/user/user/entity/auth.entity';

import { Booking } from 'src/modules/booking/entity/booking.entity';
import { Event } from 'src/modules/event/entity/event.entity';
import { Guide } from 'src/modules/guide/entity/guide.entity';
import { Hotel } from 'src/modules/hotel/entity/hotel.entity';
import { Log } from 'src/modules/logger/logger.entity';
import { MenuCatalog } from 'src/modules/menu-catalog/entities/menu-catalog.entity';
import { RestaurantMenuItem } from 'src/modules/menu-item/entities/menu-item.entity';
import { Museum } from 'src/modules/museum/entity/museum.entity';
import { Profile } from 'src/modules/profile/entities/profile.entity';
import { Restaurant } from 'src/modules/restaurant/entity/restaurant.entity';
import { Review } from 'src/modules/review/entity/review.entity';
import { Transport } from 'src/modules/transport/entity/transport.entity';

/**
 * DatabaseConfig reads connection settings from .env via ConfigService
 * and provides them to TypeOrmModule.
 *
 * We use a class (TypeOrmOptionsFactory) instead of a plain object
 * because ConfigService must be injected — and injection requires a class.
 */
@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',

      host: this.config.get<string>('DB_HOST'),
      port: this.config.get<number>('DB_PORT'),
      username: this.config.get<string>('DB_USERNAME'),
      password: this.config.get<string>('DB_PASSWORD'),
      database: this.config.get<string>('DB_NAME'),

      entities: [
        User,
        Guide,
        Review,
        Booking,
        Restaurant,
        Hotel,
        Attraction,
        Museum,
        Event,
        Transport,
        Profile,
        Log,
        RestaurantMenuItem,
        MenuCatalog,
        RestaurantMenuItem,
      ],

      // ⚠️  synchronize:true is fine during development.
      // Set it to false in production and use TypeORM migrations instead.
      synchronize: this.config.get<boolean>('DB_SYNCHRONIZE', true),

      // Prints every SQL query to the console — useful for debugging.
      logging: this.config.get<boolean>('DB_LOGGING', true),
    };
  }
}
