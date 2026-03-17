// import {
//   Injectable,
//   Logger,
//   BadRequestException,
//   InternalServerErrorException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { CreateRestaurantDto } from 'src/modules/restaurant/dto/restaurant.dto';
// import { Restaurant } from 'src/modules/restaurant/entity/restaurant.entity';
// import {
//   InvalidImageException,
//   RestaurantAlreadyExistsException,
//   RestaurantNotFoundException,
// } from 'src/modules/restaurant/exceptions/restaurant.exceptions';
// import { Repository, QueryFailedError } from 'typeorm';

// @Injectable()
// export class RestaurantService {
//   private readonly logger = new Logger(RestaurantService.name);

//   constructor(
//     @InjectRepository(Restaurant)
//     private restaurantRepo: Repository<Restaurant>,
//   ) {}

//   async addRestaurant(
//     dto: CreateRestaurantDto,
//     file: Express.Multer.File,
//   ): Promise<Restaurant> {
//     this.validateImage(file); // ← 400 chiqarishi mumkin
//     await this.checkDuplicate(dto.name); // ← 409 chiqarishi mumkin

//     const restaurant = this.restaurantRepo.create({
//       ...dto,
//       image: file?.filename ?? null,
//     });

//     return await this.saveToDb(restaurant); // ← DB xatolarini ushlaydi
//   }

//   async findById(id: string): Promise<Restaurant> {
//     const found = await this.restaurantRepo.findOne({ where: { id } });
//     if (!found) throw new RestaurantNotFoundException(id);
//     return found;
//   }

//   // ─── Private metodlar ─────────────────────────────

//   private validateImage(file: Express.Multer.File): void {
//     if (!file) return;
//     const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
//     const MAX_MB = 5;
//     if (!ALLOWED.includes(file.mimetype) || file.size > MAX_MB * 1024 * 1024) {
//       throw new InvalidImageException();
//     }
//   }

//   private async checkDuplicate(name: string): Promise<void> {
//     const exists = await this.restaurantRepo.findOne({ where: { name } });
//     if (exists) throw new RestaurantAlreadyExistsException(name);
//   }

//   private async saveToDb(r: Restaurant): Promise<Restaurant> {
//     try {
//       return await this.restaurantRepo.save(r);
//     } catch (error) {
//       if (error instanceof QueryFailedError) {
//         const pg = error as any;
//         if (pg.code === '23505')
//           // unique violation
//           throw new RestaurantAlreadyExistsException(r.name);
//         if (pg.code === '23503')
//           // foreign key
//           throw new BadRequestException("Bog'liq ma'lumot topilmadi");
//       }
//       this.logger.error('Saqlashda xato', error?.stack);
//       throw new InternalServerErrorException('Server xatosi');
//     }
//   }
// }
