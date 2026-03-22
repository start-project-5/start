import {
  BadRequestException, ConflictException,
  Injectable, InternalServerErrorException, Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { join } from 'path';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { MenuCatalogRepository } from './repositories/menu-catalog.repository';
import { CreateMenuCatalogDto } from './dto/create-menu-catalog.dto';
import { UpdateMenuCatalogDto } from './dto/update-menu-catalog.dto';
import { FilterMenuCatalogDto } from './dto/query.dto';
import { User } from '../auth/user/user.entity';
import {
  MenuCatalogAlreadyExistsException,
  MenuCatalogNotFoundException,
  InvalidImageException,
} from './exceptions/menu-catalog.exceptions';
import { MenuCatalog } from './entities/menu-catalog.entity';

@Injectable()
export class MenuCatalogService {
  private readonly logger = new Logger(MenuCatalogService.name);

  constructor(private readonly menuCatalogRepo: MenuCatalogRepository) {}

  // ─── ADD ────────────────────────────────

  async addMenuCatalog(
    dto: CreateMenuCatalogDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<MenuCatalog> {
    try {
      this.validateImage(file);
    } catch (error) {
      await this.deleteUploadedFile('menu-catalog', file?.filename);
      throw error;
    }

    // const existing = await this.menuCatalogRepo.findByName(dto.name);
    // if (existing) {
    //   await this.deleteUploadedFile('menu-catalog', file?.filename);
    //   throw new MenuCatalogAlreadyExistsException(dto.name);
    // }

    try {
      const { file: _file, ...createData } = dto as any;

      const item = this.menuCatalogRepo.create({
        ...createData,
        image: file?.filename ?? null,
        user: { id: userId } as User,
      });

      return await this.menuCatalogRepo.save(item);
    } catch (error) {
      await this.deleteUploadedFile('menu-catalog', file?.filename);

      if (error instanceof QueryFailedError) {
        const pg = error as any;
        if (pg.code === '23505') {
          throw new MenuCatalogAlreadyExistsException(dto.name);
        }
      }
      this.logger.error('addMenuCatalog: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── GET ALL ────────────────────────────────

  async getAll(filter: FilterMenuCatalogDto) {
    try {
      return await this.menuCatalogRepo.findWithFilters(filter);
    } catch (error) {
      this.logger.error('getAll: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── FIND ONE ────────────────────────────────

  async findById(id: string): Promise<MenuCatalog> {
    const item = await this.menuCatalogRepo.findById(id);
    if (!item) throw new MenuCatalogNotFoundException(id);
    return item;
  }

  // ─── UPDATE ────────────────────────────────

  async updateMenuCatalog(
    id: string,
    dto: UpdateMenuCatalogDto,
    file: Express.Multer.File,
  ): Promise<MenuCatalog | null> {
    const existing = await this.menuCatalogRepo.findById(id);
    if (!existing) {
      await this.deleteUploadedFile('menu-catalog', file?.filename);
      throw new MenuCatalogNotFoundException(id);
    }

    const oldImage = existing.image ?? null;

    try {
      const { file: _file, ...updateData } = dto as any;

      const updated = await this.menuCatalogRepo.update(id, {
        ...updateData,
        ...(file && { image: file.filename }),
      });

      if (file && oldImage) {
        await this.deleteUploadedFile('menu-catalog', oldImage);
      }

      return updated;
    } catch (error) {
      await this.deleteUploadedFile('menu-catalog', file?.filename);

      if (error instanceof QueryFailedError) {
        const pg = error as any;
        if (pg.code === '23505') {
          throw new MenuCatalogAlreadyExistsException(dto.name ?? "Noma'lum");
        }
      }
      this.logger.error('updateMenuCatalog: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── UPDATE IMAGE ────────────────────────────────

  async updateImage(id: string, file: Express.Multer.File): Promise<MenuCatalog | null> {
    if (!file) throw new BadRequestException('Rasm yuklanmadi');

    const existing = await this.menuCatalogRepo.findById(id);
    if (!existing) {
      await this.deleteUploadedFile('menu-catalog', file.filename);
      throw new MenuCatalogNotFoundException(id);
    }

    const oldImage = existing.image ?? null;

    try {
      const updated = await this.menuCatalogRepo.update(id, { image: file.filename });
      if (oldImage) await this.deleteUploadedFile('menu-catalog', oldImage);
      return updated;
    } catch (error) {
      await this.deleteUploadedFile('menu-catalog', file.filename);
      this.logger.error('updateImage: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── DELETE IMAGE ────────────────────────────────

  async deleteImage(id: string): Promise<MenuCatalog | null> {
    const item = await this.menuCatalogRepo.findById(id);
    if (!item) throw new MenuCatalogNotFoundException(id);
    await this.deleteUploadedFile('menu-catalog', item.image);
    return this.menuCatalogRepo.update(id, { image: "" });
  }

  // ─── SOFT DELETE ────────────────────────────────

  async softDelete(id: string): Promise<{ message: string }> {
    const existing = await this.menuCatalogRepo.findById(id);
    if (!existing) throw new MenuCatalogNotFoundException(id);

    try {
      await this.menuCatalogRepo.softDeleteById(id);
      return { message: 'Taom arxivlandi' };
    } catch (error) {
      this.logger.error('softDelete: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  async restore(id: string): Promise<{ message: string }> {
    const existing = await this.menuCatalogRepo.findByIdWithDeleted(id);
    if (!existing) throw new MenuCatalogNotFoundException(id);

    try {
      await this.menuCatalogRepo.restoreById(id);
      return { message: 'Taom tiklandi' };
    } catch (error) {
      this.logger.error('restore: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  async getDeleted(): Promise<MenuCatalog[]> {
    try {
      return await this.menuCatalogRepo.findDeletedAll();
    } catch (error) {
      this.logger.error('getDeleted: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── DELETE ────────────────────────────────

  async deleteMenuCatalog(id: string): Promise<{ message: string }> {
    const existing = await this.menuCatalogRepo.findById(id);
    if (!existing) throw new MenuCatalogNotFoundException(id);

    if (existing.image) {
      await this.deleteUploadedFile('menu-catalog', existing.image);
    }

    try {
      await this.menuCatalogRepo.deleteById(id);
      return { message: "Taom muvaffaqiyatli o'chirildi" };
    } catch (error) {
      this.logger.error('deleteMenuCatalog: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── DELETE ALL ────────────────────────────────

  async deleteAll(): Promise<{ message: string }> {
    try {
      const images = await this.menuCatalogRepo.findAllImages();
      await Promise.all(
        images.map((filename) => this.deleteUploadedFile('menu-catalog', filename)),
      );
      await this.menuCatalogRepo.deleteAll();
      this.logger.log(`${images.length} ta taom o'chirildi`);
      return { message: `${images.length} ta taom o'chirildi` };
    } catch (error) {
      this.logger.error('deleteAll: xato', error?.stack);
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