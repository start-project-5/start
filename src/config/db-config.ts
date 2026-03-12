import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

// ── Entities ──────────────────────────────────────────────────────────────
// Every entity must be listed here so TypeORM knows which tables to manage.
import { User }       from '../modules/users/entities/user.entity';
import { Guide }      from '../modules/guides/entities/guide.entity';
import { Review }     from '../modules/reviews/entities/review.entity';
import { Booking }    from '../modules/bookings/entities/booking.entity';
import { Restaurant } from '../modules/restaurants/entities/restaurant.entity';
import { Hotel }      from '../modules/hotels/entities/hotel.entity';
import { Attraction } from '../modules/attractions/entities/attraction.entity';
import { Museum }     from '../modules/museums/entities/museum.entity';
import { Event }      from '../modules/events/entities/event.entity';
import { Transport }  from '../modules/transport/entities/transport.entity';

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

      host:     this.config.get<string>('DB_HOST',     'localhost'),
      port:     this.config.get<number>('DB_PORT',     5432),
      username: this.config.get<string>('DB_USERNAME', 'postgres'),
      password: this.config.get<string>('DB_PASSWORD', 'postgres'),
      database: this.config.get<string>('DB_NAME',     'city_tourism'),

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
      ],

      // ⚠️  synchronize:true is fine during development.
      // Set it to false in production and use TypeORM migrations instead.
      synchronize: this.config.get<boolean>('DB_SYNCHRONIZE', true),

      // Prints every SQL query to the console — useful for debugging.
      logging: this.config.get<boolean>('DB_LOGGING', true),
    };
  }
}