import {
  BadRequestException, Injectable,
  InternalServerErrorException, Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { join } from 'path';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { FilterRestaurantMenuDto } from './dto/query.dto';
import { Restaurant } from '../restaurant/entity/restaurant.entity';
// import {
//   RestaurantMenuItemAlreadyExistsException,
//   RestaurantMenuItemNotFoundException,
//   InvalidImageException,
// } from './exceptions/restaurant-menu.exceptions';
import { RestaurantMenuItem } from './entities/menu-item.entity';
import { RestaurantMenuRepository } from './repositories/menu-item.repository';
import { CreateRestaurantMenuDto } from './dto/create-menu-item.dto';
import { UpdateRestaurantMenuDto } from './dto/update-menu-item.dto';
import { MenuCatalog } from '../menu-catalog/entities/menu-catalog.entity';
import { InvalidImageException, RestaurantMenuItemAlreadyExistsException, RestaurantMenuItemNotFoundException } from './exceptions/menu-item.exceptions';

@Injectable()
export class RestaurantMenuService {
  private readonly logger = new Logger(RestaurantMenuService.name);

  constructor(
    private readonly restaurantMenuRepo: RestaurantMenuRepository,
  ) {}

  // ─── ADD ────────────────────────────────

  async addToMenu(
    dto: CreateRestaurantMenuDto,
    file: Express.Multer.File,
  ): Promise<RestaurantMenuItem> {
    try {
      this.validateImage(file);
    } catch (error) {
      await this.deleteUploadedFile('restaurant-menu', file?.filename);
      throw error;
    }

    // Duplicate tekshiruv — bir restoranda bir taom bir marta
    const existing = await this.restaurantMenuRepo.findByCatalogAndRestaurant(
      dto.catalogId,
      dto.restaurantId,
    );
    if (existing) {
      await this.deleteUploadedFile('restaurant-menu', file?.filename);
      throw new RestaurantMenuItemAlreadyExistsException();
    }

    try {
      const { file: _file, catalogId, restaurantId, ...createData } = dto as any;

      const item = this.restaurantMenuRepo.create({
        ...createData,
        customImage: file?.filename ?? null,
        catalog: { id: catalogId } as MenuCatalog,
        restaurant: { id: restaurantId } as Restaurant,
      });

      return await this.restaurantMenuRepo.save(item);
    } catch (error) {
      await this.deleteUploadedFile('restaurant-menu', file?.filename);

      if (error instanceof QueryFailedError) {
        const pg = error as any;
        if (pg.code === '23505') throw new RestaurantMenuItemAlreadyExistsException();
      }
      this.logger.error('addToMenu: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── GET ALL ────────────────────────────────

  async getAll(filter: FilterRestaurantMenuDto) {
    try {
      return await this.restaurantMenuRepo.findWithFilters(filter);
    } catch (error) {
      this.logger.error('getAll: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── FIND ONE ────────────────────────────────

  async findById(id: string): Promise<RestaurantMenuItem> {
    const item = await this.restaurantMenuRepo.findById(id);
    if (!item) throw new RestaurantMenuItemNotFoundException(id);
    return item;
  }

  // ─── UPDATE ────────────────────────────────

  async updateMenuItem(
    id: string,
    dto: UpdateRestaurantMenuDto,
    file: Express.Multer.File,
  ): Promise<RestaurantMenuItem | null> {
    const existing = await this.restaurantMenuRepo.findById(id);
    if (!existing) {
      await this.deleteUploadedFile('restaurant-menu', file?.filename);
      throw new RestaurantMenuItemNotFoundException(id);
    }

    const oldImage = existing.customImage ?? null;

    try {
      const { file: _file, catalogId, restaurantId, ...updateData } = dto as any;

      const updated = await this.restaurantMenuRepo.update(id, {
        ...updateData,
        ...(file && { customImage: file.filename }),
      });

      if (file && oldImage) {
        await this.deleteUploadedFile('restaurant-menu', oldImage);
      }

      return updated;
    } catch (error) {
      await this.deleteUploadedFile('restaurant-menu', file?.filename);
      this.logger.error('updateMenuItem: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── UPDATE IMAGE ────────────────────────────────

  async updateImage(
    id: string,
    file: Express.Multer.File,
  ): Promise<RestaurantMenuItem | null> {
    if (!file) throw new BadRequestException('Rasm yuklanmadi');

    const existing = await this.restaurantMenuRepo.findById(id);
    if (!existing) {
      await this.deleteUploadedFile('restaurant-menu', file.filename);
      throw new RestaurantMenuItemNotFoundException(id);
    }

    const oldImage = existing.customImage ?? null;

    try {
      const updated = await this.restaurantMenuRepo.update(id, {
        customImage: file.filename,
      });
      if (oldImage) await this.deleteUploadedFile('restaurant-menu', oldImage);
      return updated;
    } catch (error) {
      await this.deleteUploadedFile('restaurant-menu', file.filename);
      this.logger.error('updateImage: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── DELETE IMAGE ────────────────────────────────

  async deleteImage(id: string): Promise<RestaurantMenuItem | null> {
    const item = await this.restaurantMenuRepo.findById(id);
    if (!item) throw new RestaurantMenuItemNotFoundException(id);
    await this.deleteUploadedFile('restaurant-menu', item.customImage);
    return this.restaurantMenuRepo.update(id, { customImage: null as any });
  }

  // ─── DELETE ────────────────────────────────

  async removeFromMenu(id: string): Promise<{ message: string }> {
    const existing = await this.restaurantMenuRepo.findById(id);
    if (!existing) throw new RestaurantMenuItemNotFoundException(id);

    if (existing.customImage) {
      await this.deleteUploadedFile('restaurant-menu', existing.customImage);
    }

    try {
      await this.restaurantMenuRepo.deleteById(id);
      return { message: "Taom restoran menyusidan o'chirildi" };
    } catch (error) {
      this.logger.error('removeFromMenu: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── DELETE ALL ────────────────────────────────

  async clearMenu(): Promise<{ message: string }> {
    try {
      const images = await this.restaurantMenuRepo.findAllImages();
      await Promise.all(
        images.map((filename) => this.deleteUploadedFile('restaurant-menu', filename)),
      );
      await this.restaurantMenuRepo.deleteAll();
      return { message: "Barcha menyu elementlari o'chirildi" };
    } catch (error) {
      this.logger.error('clearMenu: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── Private ─────────────────────────────────────────────────

  private validateImage(file: Express.Multer.File): void {
    if (!file) return;
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_BYTES = 5 * 1024 * 1024;
    if (!ALLOWED.includes(file.mimetype) || file.size > MAX_BYTES) {
      throw new InvalidImageException();
    }
  }

  private async deleteUploadedFile(folder: string, filename?: string): Promise<void> {
    if (!filename) return;
    const filePath = join(process.cwd(), 'uploads', folder, filename);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  }
}