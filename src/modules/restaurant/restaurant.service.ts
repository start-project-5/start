import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from './entity/restaurant.entity';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dto/restaurant.dto';
import { FilterRestaurantDto } from './dto/query.dto';
import { RestaurantRepository } from './repositories/restaurant.repository';

@Injectable()
export class RestaurantService {
  constructor(
    private restaurantRepo: RestaurantRepository
  ) {}

  async addHotel(
    createRestaurantDto: CreateRestaurantDto,
    file: Express.Multer.File,
    // UserId: string,
  ): Promise<Restaurant> {
    try {

      const restaurant = await this.restaurantRepo.create({
        ...createRestaurantDto,
        image: file?.filename ?? null,
        // user: { id: UserId },
      });

      return await this.restaurantRepo.save(restaurant);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllRestaurant(filter: FilterRestaurantDto) {
    try {
        return await this.restaurantRepo.findWithFilters(filter)
    } catch (error) {
        throw new InternalServerErrorException(error.message)
    }
  }

  async deleteAllResturant(): Promise<{message: string}> {
    try {
      await this.restaurantRepo.deleteAll()
      return {message: "Deleted All"}
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }
}
