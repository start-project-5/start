import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './booking/booking.module';
import { HotelModule } from './hotel/hotel.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { GuideModule } from './guide/guide.module';
import { EventModule } from './event/event.module';
import { TransportModule } from './transport/transport.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [AuthModule, BookingModule, HotelModule, RestaurantModule, GuideModule, EventModule, TransportModule, ReviewModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
