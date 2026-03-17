import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from './entity/restaurant.entity';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dto/restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepo: Repository<Restaurant>,
  ) {}

  async addHotel(
    createRestaurantDto: CreateRestaurantDto,
    file: Express.Multer.File,
    // UserId: string,
  ): Promise<Restaurant> {
    try {
      const {
        name,
        description,
        priceRange,
        address,
        latitude,
        longitude,
        rating,
        workingHours,
        isBookingAvailable,
      } = createRestaurantDto;

      const restaurant = await this.restaurantRepo.create({
        name,
        description,
        priceRange,
        address,
        latitude,
        longitude,
        rating,
        workingHours,
        isBookingAvailable,
        image: file?.filename ?? null,
        // user: { id: UserId },
      });

    //   if (file) {
    //     restaurant.image = `${file.filename}`;
    //   }

      return await this.restaurantRepo.save(restaurant);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllRestaurant() {
    try {
        const reataurnt = await this.restaurantRepo.find()

        return reataurnt
    } catch (error) {
        throw new InternalServerErrorException(error.message)
    }
  }
}
