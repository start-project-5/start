import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Attraction } from 'src/modules/attraction/entity/attraction.entity';

// ── Entities ──────────────────────────────────────────────────────────────
// Every entity must be listed here so TypeORM knows which tables to manage.

import { User } from 'src/modules/auth/entity/auth.entity';
import { Booking } from 'src/modules/booking/entity/booking.entity';
import { Event } from 'src/modules/event/entity/event.entity';
import { Guide } from 'src/modules/guide/entity/guide.entity';
import { Hotel } from 'src/modules/hotel/entity/hotel.entity';
import { Museum } from 'src/modules/museum/entity/museum.entity';
import { Profile } from 'src/modules/profile/entities/profile.entity';
import { Restaurant } from 'src/modules/restaurant/entity/restaurant.entity';
import { Review } from 'src/modules/review/entity/review.entity';
import { Transport } from 'src/modules/transport/entity/transport.entity';
// import { User }       from '../modules/users/entities/user.entity';
// import { Guide }      from '../modules/guides/entities/guide.entity';
// import { Review }     from '../modules/reviews/entities/review.entity';
// import { Booking }    from '../modules/bookings/entities/booking.entity';
// import { Restaurant } from '../modules/restaurants/entities/restaurant.entity';
// import { Hotel }      from '../modules/hotels/entities/hotel.entity';
// import { Attraction } from '../modules/attractions/entities/attraction.entity';
// import { Museum }     from '../modules/museums/entities/museum.entity';
// import { Event }      from '../modules/events/entities/event.entity';
// import { Transport }  from '../modules/transport/entities/transport.entity';

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
        Profile
      ],

      // ⚠️  synchronize:true is fine during development.
      // Set it to false in production and use TypeORM migrations instead.
      synchronize: this.config.get<boolean>('DB_SYNCHRONIZE', true),

      // Prints every SQL query to the console — useful for debugging.
      logging: this.config.get<boolean>('DB_LOGGING', true),
    };
  }
}