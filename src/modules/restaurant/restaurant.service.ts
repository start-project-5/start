import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Restaurant } from './entity/restaurant.entity';
import { CreateRestaurantDto } from './dto/restaurant.dto';
import { FilterRestaurantDto } from './dto/query.dto';
import { RestaurantRepository } from './repositories/restaurant.repository';
import { User } from '../auth/user/user.entity';
import {
  RestaurantAlreadyExistsException,
  RestaurantNotFoundException,
  InvalidImageException,
} from './exceptions/restaurant.exceptions';
import { join } from 'path';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { removeFile } from 'src/utils/remove-image';

@Injectable()
export class RestaurantService {
  private readonly logger = new Logger(RestaurantService.name);

  constructor(private readonly restaurantRepo: RestaurantRepository) {}

  // ─── ADD RESTAURANT ────────────────────────────────

  async addRestaurant(
    dto: CreateRestaurantDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<Restaurant> {
    try {
      this.validateImage(file);
    } catch (error) {
      await this.deleteUploadedFile('restaurant', file?.filename);
      throw error;
    }

    const existing = await this.restaurantRepo.findByName(dto.name);
    if (existing) {
      await this.deleteUploadedFile('restaurant', file?.filename);
      throw new RestaurantAlreadyExistsException(dto.name);
    }

    try {
      // ← file ni dto dan ajratib olamiz
      const { file: _file, ...createData } = dto as any;

      const restaurant = this.restaurantRepo.create({
        ...createData, // ← file siz
        image: file?.filename ?? null,
        user: { id: userId } as User,
      });

      return await this.restaurantRepo.save(restaurant);
    } catch (error) {
      await this.deleteUploadedFile('restaurant', file?.filename);

      if (error instanceof QueryFailedError) {
        const pg = error as any;
        if (pg.code === '23505') {
          throw new RestaurantAlreadyExistsException(dto.name);
        }
      }
      this.logger.error('addRestaurant: DB xatosi', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── GET ALL ────────────────────────────────

  async getAllRestaurant(filter: FilterRestaurantDto) {
    try {
      return await this.restaurantRepo.findWithFilters(filter);
    } catch (error) {
      this.logger.error('getAllRestaurant: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── FIND ONE ────────────────────────────────

  async findById(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepo.findById(id);

    // Topilmasa — custom exception
    if (!restaurant) {
      throw new RestaurantNotFoundException(id);
    }

    return restaurant;
  }

  // ─── UPDATE ────────────────────────────────
  async updateRestaurant(
    id: string,
    dto: UpdateRestaurantDto,
    file: Express.Multer.File,
  ): Promise<Restaurant | null> {
    // 1. Restoran mavjudligini tekshiramiz
    const existing = await this.restaurantRepo.findById(id);
    if (!existing) {
      await this.deleteUploadedFile('restaurant', file?.filename);
      throw new RestaurantNotFoundException(id);
    }

    // 2. Eski rasm nomini saqlab olamiz
    const oldImage = existing.image ?? null;

    // 3. Yangilash
    try {
      const { file: _file, ...updateData } = dto; // ← file ni ajratib olamiz

      const updated = await this.restaurantRepo.update(id, {
        ...updateData, // ← file siz spread
        ...(file && { image: file.filename }),
      });

      // 4. Update muvaffaqiyatli — eski rasmni o'chiramiz
      if (file && oldImage) {
        await this.deleteUploadedFile('restaurant', oldImage);
      }

      return updated;
    } catch (error) {
      // ❌ Update xato berdi — yangi yuklangan rasmni o'chiramiz
      await this.deleteUploadedFile('restaurant', file?.filename);

      if (error instanceof QueryFailedError) {
        const pg = error as any;
        if (pg.code === '23505') {
          throw new RestaurantAlreadyExistsException(dto.name ?? "Noma'lum");
        }
      }
      this.logger.error('updateRestaurant: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── UPDATE IMAGE ────────────────────────────────

  async updateImage(
    id: string,
    file: Express.Multer.File,
  ): Promise<Restaurant | null> {
    // 1. Fayl kelganini tekshiramiz
    if (!file) {
      throw new BadRequestException('Rasm yuklanmadi');
    }

    // 2. Restoran mavjudligini tekshiramiz
    const existing = await this.restaurantRepo.findById(id);
    if (!existing) {
      await this.deleteUploadedFile('restaurant', file.filename);
      throw new RestaurantNotFoundException(id);
    }

    // 3. Eski rasmni saqlab olamiz
    const oldImage = existing.image ?? null;

    // 4. Yangi rasmni DB ga saqlaymiz
    try {
      const updated = await this.restaurantRepo.update(id, {
        image: file.filename,
      });

      // 5. Muvaffaqiyatli — eski rasmni o'chiramiz
      if (oldImage) {
        await this.deleteUploadedFile('restaurant', oldImage);
      }

      return updated;
    } catch (error) {
      // ❌ Xato — yangi rasmni o'chiramiz
      await this.deleteUploadedFile('restaurant', file.filename);
      this.logger.error('updateImage: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  //   // ─── SOFT DELETE ────────────────────────────────

  async softDeleteRestaurant(id: string): Promise<{ message: string }> {
    const existing = await this.restaurantRepo.findByIdForSoft(id);
    if (!existing) {
      throw new RestaurantNotFoundException(id);
    }

    try {
      await this.restaurantRepo.softDeleteById(id);
      return { message: 'Restoran arxivlandi' };
    } catch (error) {
      this.logger.error('softDeleteRestaurant: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  async restoreRestaurant(id: string): Promise<{ message: string }> {
    // ← findByIdWithDeleted — soft delete qilinganlarni ham topadi
    const existing = await this.restaurantRepo.findByIdWithDeleted(id);
    if (!existing) {
      throw new RestaurantNotFoundException(id);
    }

    try {
      await this.restaurantRepo.restoreById(id);
      return { message: 'Restoran tiklandi' };
    } catch (error) {
      this.logger.error('restoreRestaurant: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  async getDeletedRestaurants(): Promise<Restaurant[]> {
    try {
      return await this.restaurantRepo.findDeletedAll();
    } catch (error) {
      this.logger.error('getDeletedRestaurants: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── DELETE ────────────────────────────────

  async deleteImage(id: string): Promise<Restaurant | null> {
    const restaurant = await this.restaurantRepo.findById(id);

    // Topilmasa — custom exception
    if (!restaurant) {
      throw new RestaurantNotFoundException(id);
    }

    await this.deleteUploadedFile('restaurant', restaurant.image);

    const updated = await this.restaurantRepo.update(id, {
      image: '',
    });

    return updated;
  }

  // ─── DELETE IMAGE ────────────────────────────────

  async deleteRestaurant(id: string): Promise<{ message: string }> {
    // 1. Mavjudligini tekshiramiz
    const existing = await this.restaurantRepo.findById(id);
    if (!existing) {
      throw new RestaurantNotFoundException(id);
    }

    // 2. Rasmi bo'lsa diskdan o'chiramiz
    if (existing.image) {
      const filePath = join(
        process.cwd(),
        'uploads',
        'restaurant',
        existing.image,
      );
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    }

    // 3. DB dan o'chiramiz
    try {
      await this.restaurantRepo.deleteById(id);
      return { message: "Restoran muvaffaqiyatli o'chirildi" };
    } catch (error) {
      this.logger.error('deleteRestaurant: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── DELETE ALL ────────────────────────────────

  async deleteAllResturant(): Promise<{ message: string }> {
    try {
      const images = await this.restaurantRepo.findAllImages();

      // 2. Har bir rasmni diskdan o'chiramiz
      await Promise.all(
        images.map(async (filename) => {
          const filePath = join(
            process.cwd(),
            'uploads',
            'restaurant',
            filename,
          );
          if (existsSync(filePath)) {
            await unlink(filePath);
          }
        }),
      );

      await this.restaurantRepo.deleteAll();

      this.logger.log(`${images.length} ta restoran va rasmlari o'chirildi`);
      return {
        message: `${images.length} ta restoran muvaffaqiyatli o'chirildi`,
      };
    } catch (error) {
      this.logger.error('deleteAllRestaurant: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── Private ─────────────────────────────────────────────────
  private validateImage(file: Express.Multer.File): void {
    if (!file) return;

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_BYTES = 5 * 1024 * 1024;

    if (!ALLOWED.includes(file.mimetype) || file.size > MAX_BYTES) {
      throw new InvalidImageException(); // ← custom exception ishlatildi
    }
  }

  private async deleteUploadedFile(
    folder: string,
    filename?: string,
  ): Promise<void> {
    if (!filename) return;
    const filePath = join(process.cwd(), 'uploads', folder, filename);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  }
}
