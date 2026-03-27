import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { join } from 'path';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';

import { MuseumRepository } from './repositories/museum.repository';
import { UpdateMuseumDto } from './dto/update-museum.dto';
import { FilterMuseumDto } from './dto/query.dto';
import { CreateExhibitDto, UpdateExhibitDto } from './dto/exhibit.dto';
import { CreateGalleryDto, UpdateGalleryDto } from './dto/gallery.dto';
import { CreateReviewDto } from './dto/review.dto';

// import {
//   ExhibitNotFoundException,
//   GalleryNotFoundException,
//   InvalidImageException,
//   MuseumAlreadyExistsException,
//   MuseumNotFoundException,
//   ReviewAlreadyExistsException,
//   ReviewNotFoundException,
// } from './exceptions/museum.exceptions';

import { User } from 'src/modules/auth/user/user.entity';
import { PaginatedResult } from 'src/utils/pagination';
import { Exhibit } from './entity/exhibit.entity';
import { Gallery } from './entity/gallery.entity';
import { Favorite } from './entity/favorite.entity';
import { CreateMuseumDto } from './dto/create-museum.dto';
import { Museum } from './entity/museum.entity';
import { Reviews } from './entity/review.entity';
import {
  ExhibitNotFoundException,
  GalleryNotFoundException,
  InvalidImageException,
  MuseumAlreadyExistsException,
  MuseumNotFoundException,
  ReviewAlreadyExistsException,
  ReviewNotFoundException,
} from './exceptions/museum.exceptions ';

@Injectable()
export class MuseumService {
  private readonly logger = new Logger(MuseumService.name);

  constructor(
    private readonly museumRepo: MuseumRepository,
    private readonly dataSource: DataSource,

    @InjectRepository(Exhibit)
    private readonly exhibitRepo: Repository<Exhibit>,

    @InjectRepository(Gallery)
    private readonly galleryRepo: Repository<Gallery>,

    @InjectRepository(Reviews)
    private readonly reviewRepo: Repository<Reviews>,

    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
  ) {}

  // ═══════════════════════════════════════════════════════════
  // MUSEUM CRUD
  // ═══════════════════════════════════════════════════════════

  async addMuseum(
    dto: CreateMuseumDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<Museum> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      this.validateImage(file);

      const existing = await this.museumRepo.findByName(dto.name);
      if (existing) throw new MuseumAlreadyExistsException(dto.name);

      const { file: _file, ...createData } = dto as any;

      const museum = qr.manager.create(Museum, {
        ...createData,
        image: file?.filename ?? null,
        user: { id: userId } as User,
      });

      const saved = await qr.manager.save(museum);
      await qr.commitTransaction();
      return saved;
    } catch (error) {
      await qr.rollbackTransaction();
      await this.deleteFile('museum', file?.filename);

      if (
        error instanceof ConflictException ||
        error instanceof InvalidImageException
      )
        throw error;

      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        throw new MuseumAlreadyExistsException(dto.name);
      }

      this.logger.error('addMuseum:', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    } finally {
      await qr.release();
    }
  }

  async getAll(filter: FilterMuseumDto): Promise<PaginatedResult<Museum>> {
    try {
      return await this.museumRepo.findWithFilters(filter);
    } catch (error) {
      this.logger.error('getAll:', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  async findById(id: string): Promise<Museum> {
    const museum = await this.museumRepo.findById(id);
    if (!museum) throw new MuseumNotFoundException(id);
    return museum;
  }

  async updateMuseum(
    id: string,
    dto: UpdateMuseumDto,
    file: Express.Multer.File,
  ): Promise<Museum | null> {
    const existing = await this.museumRepo.findById(id);
    if (!existing) {
      await this.deleteFile('museum', file?.filename);
      throw new MuseumNotFoundException(id);
    }

    try {
      const { file: _file, ...updateData } = dto as any;

      const updated = await this.museumRepo.update(id, {
        ...updateData,
        ...(file && { image: file.filename }),
      });

      if (file && existing.image)
        await this.deleteFile('museum', existing.image);
      return updated;
    } catch (error) {
      await this.deleteFile('museum', file?.filename);

      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        throw new MuseumAlreadyExistsException(dto.name ?? "Noma'lum");
      }

      this.logger.error('updateMuseum:', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  async updateImage(
    id: string,
    file: Express.Multer.File,
  ): Promise<Museum | null> {
    if (!file) throw new BadRequestException('Rasm yuklanmadi');

    const existing = await this.museumRepo.findById(id);
    if (!existing) {
      await this.deleteFile('museum', file.filename);
      throw new MuseumNotFoundException(id);
    }

    try {
      const updated = await this.museumRepo.update(id, {
        image: file.filename,
      });
      if (existing.image) await this.deleteFile('museum', existing.image);
      return updated;
    } catch (error) {
      await this.deleteFile('museum', file.filename);
      this.logger.error('updateImage:', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  async deleteImage(id: string): Promise<Museum | null> {
    const museum = await this.museumRepo.findById(id);
    if (!museum) throw new MuseumNotFoundException(id);

    await this.deleteFile('museum', museum.image);
    return this.museumRepo.update(id, { image: '' });
  }

  async softDeleteMuseum(id: string): Promise<{ message: string }> {
    const existing = await this.museumRepo.findById(id);
    if (!existing) throw new MuseumNotFoundException(id);

    try {
      await this.museumRepo.softDeleteById(id);
      return { message: 'Muzey arxivlandi' };
    } catch (error) {
      this.logger.error('softDelete:', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  async restoreMuseum(id: string): Promise<{ message: string }> {
    const existing = await this.museumRepo.findByIdWithDeleted(id);
    if (!existing) throw new MuseumNotFoundException(id);

    try {
      await this.museumRepo.restoreById(id);
      return { message: 'Muzey tiklandi' };
    } catch (error) {
      this.logger.error('restore:', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  async getDeletedMuseums(): Promise<Museum[]> {
    try {
      return await this.museumRepo.findDeletedAll();
    } catch (error) {
      this.logger.error('getDeleted:', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  async deleteMuseum(id: string): Promise<{ message: string }> {
    const existing = await this.museumRepo.findById(id);
    if (!existing) throw new MuseumNotFoundException(id);

    if (existing.image) await this.deleteFile('museum', existing.image);

    try {
      await this.museumRepo.deleteById(id);
      return { message: "Muzey muvaffaqiyatli o'chirildi" };
    } catch (error) {
      this.logger.error('delete:', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  async deleteAllMuseums(): Promise<{ message: string }> {
    try {
      const images = await this.museumRepo.findAllImages();
      await Promise.all(images.map((f) => this.deleteFile('museum', f)));
      await this.museumRepo.deleteAll();
      return { message: `${images.length} ta muzey o'chirildi` };
    } catch (error) {
      this.logger.error('deleteAll:', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ═══════════════════════════════════════════════════════════
  // EXHIBITS
  // ═══════════════════════════════════════════════════════════

  async addExhibit(
    dto: CreateExhibitDto,
    file: Express.Multer.File,
  ): Promise<Exhibit[]> {
    const museum = await this.museumRepo.findById(dto.museumId);
    if (!museum) throw new MuseumNotFoundException(dto.museumId);

    try {
      this.validateImage(file);
      const { file: _f, ...data } = dto as any;

      const exhibit = this.exhibitRepo.create({
        ...data,
        image: file?.filename ?? null,
        museum: { id: dto.museumId },
      });

      return await this.exhibitRepo.save(exhibit);
    } catch (error) {
      await this.deleteFile('exhibit', file?.filename);
      if (error instanceof InvalidImageException) throw error;
      this.logger.error('addExhibit:', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  async getExhibitsByMuseum(museumId: string): Promise<Exhibit[]> {
    const museum = await this.museumRepo.findById(museumId);
    if (!museum) throw new MuseumNotFoundException(museumId);

    return this.exhibitRepo.find({
      where: { museum: { id: museumId }, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async updateExhibit(
    id: string,
    dto: UpdateExhibitDto,
    file: Express.Multer.File,
  ): Promise<Exhibit> {
    const exhibit = await this.exhibitRepo.findOne({
      where: { id: id as any },
    });
    if (!exhibit) throw new ExhibitNotFoundException(id);

    try {
      const { file: _f, ...updateData } = dto as any;
      const oldImage = exhibit.image;

      Object.assign(exhibit, {
        ...updateData,
        ...(file && { image: file.filename }),
      });

      const saved = await this.exhibitRepo.save(exhibit);
      if (file && oldImage) await this.deleteFile('exhibit', oldImage);
      return saved;
    } catch (error) {
      await this.deleteFile('exhibit', file?.filename);
      this.logger.error('updateExhibit:', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  async deleteExhibit(id: string): Promise<{ message: string }> {
    const exhibit = await this.exhibitRepo.findOne({
      where: { id: id as any },
    });
    if (!exhibit) throw new ExhibitNotFoundException(id);

    if (exhibit.image) await this.deleteFile('exhibit', exhibit.image);

    await this.exhibitRepo.softDelete(id);
    return { message: "Eksponat o'chirildi" };
  }

  // ═══════════════════════════════════════════════════════════
  // GALLERY
  // ═══════════════════════════════════════════════════════════

  async addGalleryImage(
    dto: CreateGalleryDto,
    file: Express.Multer.File,
  ): Promise<Gallery[]> {
    if (!file) throw new BadRequestException('Rasm fayli majburiy');

    const museum = await this.museumRepo.findById(dto.museumId);
    if (!museum) throw new MuseumNotFoundException(dto.museumId);

    try {
      this.validateImage(file);
      const { file: _f, ...data } = dto as any;

      const gallery = this.galleryRepo.create({
        ...data,
        imageUrl: file.filename,
        museum: { id: dto.museumId },
      });

      return await this.galleryRepo.save(gallery);
    } catch (error) {
      await this.deleteFile('gallery', file?.filename);
      if (error instanceof InvalidImageException) throw error;
      this.logger.error('addGalleryImage:', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  async getGalleryByMuseum(museumId: string): Promise<Gallery[]> {
    const museum = await this.museumRepo.findById(museumId);
    if (!museum) throw new MuseumNotFoundException(museumId);

    return this.galleryRepo.find({
      where: { museum: { id: museumId } },
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async updateGalleryItem(
    id: string,
    dto: UpdateGalleryDto,
    file: Express.Multer.File,
  ): Promise<Gallery> {
    const item = await this.galleryRepo.findOne({ where: { id: id as any } });
    if (!item) throw new GalleryNotFoundException(id);

    try {
      const { file: _f, ...updateData } = dto as any;
      const oldImage = item.imageUrl;

      Object.assign(item, {
        ...updateData,
        ...(file && { imageUrl: file.filename }),
      });

      const saved = await this.galleryRepo.save(item);
      if (file && oldImage) await this.deleteFile('gallery', oldImage);
      return saved;
    } catch (error) {
      await this.deleteFile('gallery', file?.filename);
      this.logger.error('updateGalleryItem:', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

    async deleteGalleryItem(id: string): Promise<{ message: string }> {
      const item = await this.galleryRepo.findOne({ where: { id: id as any } });
      if (!item) throw new GalleryNotFoundException(id);

      await this.deleteFile('gallery', item.imageUrl);
      await this.galleryRepo.delete(id);
      return { message: "Galereya rasmi o'chirildi" };
    }

    // ═══════════════════════════════════════════════════════════
    // REVIEWS
    // ═══════════════════════════════════════════════════════════

    async addReview(dto: CreateReviewDto, userId: string): Promise<Reviews> {
      const museum = await this.museumRepo.findById(dto.museumId);
      if (!museum) throw new MuseumNotFoundException(dto.museumId);

      // Bir user bir muzeyga faqat bir review yoza oladi
      const existingReview = await this.reviewRepo.findOne({
        where: {
          museum: { id: dto.museumId },
          user: { id: userId },
        },
      });
      if (existingReview) throw new ReviewAlreadyExistsException();

      try {
        const review = this.reviewRepo.create({
          rating: dto.rating,
          comment: dto.comment,
          museum: { id: dto.museumId },
          user: { id: userId },
        });

        const saved = await this.reviewRepo.save(review);

        // averageRating va reviewCount ni yangilash
        await this.recalculateRating(dto.museumId);

        return saved;
      } catch (error) {
        if (error instanceof ConflictException) throw error;
        this.logger.error('addReview:', error?.stack);
        throw new InternalServerErrorException('Server xatosi yuz berdi');
      }
    }

    async getReviewsByMuseum(museumId: string): Promise<Reviews[]> {
      const museum = await this.museumRepo.findById(museumId);
      if (!museum) throw new MuseumNotFoundException(museumId);

      return this.reviewRepo.find({
        where: { museum: { id: museumId } },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    }

    async deleteReview(
      id: string,
      userId: string,
      userRole: string,
    ): Promise<{ message: string }> {
      const review = await this.reviewRepo.findOne({
        where: { id: id as any },
        relations: ['user', 'museum'],
      });
      if (!review) throw new ReviewNotFoundException(id);

      // Faqat o'z reviewini o'chira oladi yoki superadmin
      if (review.user.id !== userId && userRole !== 'superadmin') {
        throw new BadRequestException("Siz bu reviewni o'chira olmaysiz");
      }

      const museumId = review.museum.id;
      await this.reviewRepo.delete(id);

      // Reytingni qayta hisoblash
      await this.recalculateRating(museumId);

      return { message: "Review o'chirildi" };
    }

    // ═══════════════════════════════════════════════════════════
    // FAVORITES
    // ═══════════════════════════════════════════════════════════

    async toggleFavorite(
      museumId: string,
      userId: string,
    ): Promise<{ message: string; isFavorite: boolean }> {
      const museum = await this.museumRepo.findById(museumId);
      if (!museum) throw new MuseumNotFoundException(museumId);

      const existing = await this.favoriteRepo.findOne({
        where: {
          museum: { id: museumId },
          user: { id: userId },
        },
      });

      if (existing) {
        await this.favoriteRepo.delete(existing.id);
        return { message: "Sevimlilardan olib tashlandi", isFavorite: false };
      }

      const favorite = this.favoriteRepo.create({
        museum: { id: museumId },
        user: { id: userId },
      });
      await this.favoriteRepo.save(favorite);
      return { message: "Sevimlilarga qo'shildi", isFavorite: true };
    }

    async getFavoritesByUser(userId: string): Promise<Favorite[]> {
      return this.favoriteRepo.find({
        where: { user: { id: userId } },
        relations: ['museum'],
        order: { createdAt: 'DESC' },
      });
    }

  // ═══════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════

  private async recalculateRating(museumId: string): Promise<void> {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.museum_id = :museumId', { museumId })
      .getRawOne();

    const averageRating = parseFloat(result?.avg ?? '0');
    const reviewCount = parseInt(result?.count ?? '0', 10);

    await this.museumRepo.updateRating(museumId, averageRating, reviewCount);
  }

  private validateImage(file: Express.Multer.File): void {
    if (!file) return;
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX = 5 * 1024 * 1024; // 5MB
    if (!ALLOWED.includes(file.mimetype) || file.size > MAX) {
      throw new InvalidImageException();
    }
  }

  private async deleteFile(folder: string, filename?: string): Promise<void> {
    if (!filename) return;
    const filePath = join(process.cwd(), 'uploads', folder, filename);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  }
}

// import {
//   BadRequestException,
//   ConflictException,
//   Injectable,
//   InternalServerErrorException,
//   Logger,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { DataSource, QueryFailedError, Repository } from 'typeorm';
// import { join } from 'path';
// import { existsSync } from 'fs';
// import { unlink } from 'fs/promises';

// import { MuseumRepository } from './repositories/museum.repository';
// import { UpdateMuseumDto } from './dto/update-museum.dto';
// import { FilterMuseumDto } from './dto/query.dto';
// import { CreateExhibitDto, UpdateExhibitDto } from './dto/exhibit.dto';
// import { CreateGalleryDto, UpdateGalleryDto } from './dto/gallery.dto';
// import { CreateReviewDto } from './dto/review.dto';

// import { User } from 'src/modules/auth/user/user.entity';
// import { PaginatedResult } from 'src/utils/pagination';
// import { Exhibit } from './entity/exhibit.entity';
// import { Gallery } from './entity/gallery.entity';
// import { Review } from '../review/entity/review.entity';
// import { Favorite } from './entity/favorite.entity';
// import { CreateMuseumDto } from './dto/create-museum.dto';
// import { Museum } from './entity/museum.entity';
// import {
//   InvalidImageException,
//   MuseumAlreadyExistsException,
//   MuseumNotFoundException,
// } from './dto/museum.exceptions';

// @Injectable()
// export class MuseumService {
//   private readonly logger = new Logger(MuseumService.name);

//   constructor(
//     private readonly museumRepo: MuseumRepository,
//     private readonly dataSource: DataSource,

//     @InjectRepository(Exhibit)
//     private readonly exhibitRepo: Repository<Exhibit>,

//     @InjectRepository(Gallery)
//     private readonly galleryRepo: Repository<Gallery>,

//     @InjectRepository(Review)
//     private readonly reviewRepo: Repository<Review>,

//     @InjectRepository(Favorite)
//     private readonly favoriteRepo: Repository<Favorite>,
//   ) {}

//   // ═══════════════════════════════════════════════════════════
//   // MUSEUM CRUD
//   // ═══════════════════════════════════════════════════════════

//   async addMuseum(
//     dto: CreateMuseumDto,
//     file: Express.Multer.File,
//     userId: string,
//   ): Promise<Museum> {
//     const qr = this.dataSource.createQueryRunner();
//     await qr.connect();
//     await qr.startTransaction();

//     try {
//       this.validateImage(file);

//       const existing = await this.museumRepo.findByName(dto.name);
//       if (existing) throw new MuseumAlreadyExistsException(dto.name);

//       const { file: _file, ...createData } = dto as any;

//       const museum = qr.manager.create(Museum, {
//         ...createData,
//         image: file?.filename ?? null,
//         user: { id: userId } as User,
//       });

//       const saved = await qr.manager.save(museum);
//       await qr.commitTransaction();
//       return saved;
//     } catch (error) {
//       await qr.rollbackTransaction();
//       await this.deleteFile('museum', file?.filename);

//       if (
//         error instanceof ConflictException ||
//         error instanceof InvalidImageException
//       )
//         throw error;

//       if (
//         error instanceof QueryFailedError &&
//         (error as any).code === '23505'
//       ) {
//         throw new MuseumAlreadyExistsException(dto.name);
//       }

//       this.logger.error('addMuseum:', error?.stack);
//       throw new InternalServerErrorException('Server xatosi yuz berdi');
//     } finally {
//       await qr.release();
//     }
//   }

//   async getAll(filter: FilterMuseumDto): Promise<PaginatedResult<Museum>> {
//     try {
//       return await this.museumRepo.findWithFilters(filter);
//     } catch (error) {
//       this.logger.error('getAll:', error?.stack);
//       throw new InternalServerErrorException('Server xatosi yuz berdi');
//     }
//   }

//   async findById(id: string): Promise<Museum> {
//     const museum = await this.museumRepo.findById(id);
//     if (!museum) throw new MuseumNotFoundException(id);
//     return museum;
//   }

//   async updateMuseum(
//     id: string,
//     dto: UpdateMuseumDto,
//     file: Express.Multer.File,
//   ): Promise<Museum> {
//     const existing = await this.museumRepo.findById(id);
//     if (!existing) {
//       await this.deleteFile('museum', file?.filename);
//       throw new MuseumNotFoundException(id);
//     }

//     try {
//       const { file: _file, ...updateData } = dto as any;

//       const updated = await this.museumRepo.update(id, {
//         ...updateData,
//         ...(file && { image: file.filename }),
//       });

//       if (file && existing.image)
//         await this.deleteFile('museum', existing.image);
//       return updated;
//     } catch (error) {
//       await this.deleteFile('museum', file?.filename);

//       if (
//         error instanceof QueryFailedError &&
//         (error as any).code === '23505'
//       ) {
//         throw new MuseumAlreadyExistsException(dto.name ?? "Noma'lum");
//       }

//       this.logger.error('updateMuseum:', error?.stack);
//       throw new InternalServerErrorException('Server xatosi yuz berdi');
//     }
//   }

//   async updateImage(id: string, file: Express.Multer.File): Promise<Museum> {
//     if (!file) throw new BadRequestException('Rasm yuklanmadi');

//     const existing = await this.museumRepo.findById(id);
//     if (!existing) {
//       await this.deleteFile('museum', file.filename);
//       throw new MuseumNotFoundException(id);
//     }

//     try {
//       const updated = await this.museumRepo.update(id, {
//         image: file.filename,
//       });
//       if (existing.image) await this.deleteFile('museum', existing.image);
//       return updated;
//     } catch (error) {
//       await this.deleteFile('museum', file.filename);
//       this.logger.error('updateImage:', error?.stack);
//       throw new InternalServerErrorException('Server xatosi yuz berdi');
//     }
//   }

//   async deleteImage(id: string): Promise<Museum> {
//     const museum = await this.museumRepo.findById(id);
//     if (!museum) throw new MuseumNotFoundException(id);

//     await this.deleteFile('museum', museum.image);
//     return this.museumRepo.update(id, { image: null });
//   }

//   async softDeleteMuseum(id: string): Promise<{ message: string }> {
//     const existing = await this.museumRepo.findById(id);
//     if (!existing) throw new MuseumNotFoundException(id);

//     try {
//       await this.museumRepo.softDeleteById(id);
//       return { message: 'Muzey arxivlandi' };
//     } catch (error) {
//       this.logger.error('softDelete:', error?.stack);
//       throw new InternalServerErrorException('Server xatosi yuz berdi');
//     }
//   }

//   async restoreMuseum(id: string): Promise<{ message: string }> {
//     const existing = await this.museumRepo.findByIdWithDeleted(id);
//     if (!existing) throw new MuseumNotFoundException(id);

//     try {
//       await this.museumRepo.restoreById(id);
//       return { message: 'Muzey tiklandi' };
//     } catch (error) {
//       this.logger.error('restore:', error?.stack);
//       throw new InternalServerErrorException('Server xatosi yuz berdi');
//     }
//   }

//   async getDeletedMuseums(): Promise<Museum[]> {
//     try {
//       return await this.museumRepo.findDeletedAll();
//     } catch (error) {
//       this.logger.error('getDeleted:', error?.stack);
//       throw new InternalServerErrorException('Server xatosi yuz berdi');
//     }
//   }

//   async deleteMuseum(id: string): Promise<{ message: string }> {
//     const existing = await this.museumRepo.findById(id);
//     if (!existing) throw new MuseumNotFoundException(id);

//     if (existing.image) await this.deleteFile('museum', existing.image);

//     try {
//       await this.museumRepo.deleteById(id);
//       return { message: "Muzey muvaffaqiyatli o'chirildi" };
//     } catch (error) {
//       this.logger.error('delete:', error?.stack);
//       throw new InternalServerErrorException('Server xatosi yuz berdi');
//     }
//   }

//   async deleteAllMuseums(): Promise<{ message: string }> {
//     try {
//       const images = await this.museumRepo.findAllImages();
//       await Promise.all(images.map((f) => this.deleteFile('museum', f)));
//       await this.museumRepo.deleteAll();
//       return { message: `${images.length} ta muzey o'chirildi` };
//     } catch (error) {
//       this.logger.error('deleteAll:', error?.stack);
//       throw new InternalServerErrorException('Server xatosi yuz berdi');
//     }
//   }

//   // ═══════════════════════════════════════════════════════════
//   // EXHIBITS
//   // ═══════════════════════════════════════════════════════════

//   async addExhibit(
//     dto: CreateExhibitDto,
//     file: Express.Multer.File,
//   ): Promise<Exhibit> {
//     const museum = await this.museumRepo.findById(dto.museumId);
//     if (!museum) throw new MuseumNotFoundException(dto.museumId);

//     try {
//       this.validateImage(file);
//       const { file: _f, ...data } = dto as any;

//       const exhibit = this.exhibitRepo.create({
//         ...data,
//         image: file?.filename ?? null,
//         museum: { id: dto.museumId },
//       });

//       return await this.exhibitRepo.save(exhibit);
//     } catch (error) {
//       await this.deleteFile('exhibit', file?.filename);
//       if (error instanceof InvalidImageException) throw error;
//       this.logger.error('addExhibit:', error?.stack);
//       throw new InternalServerErrorException('Server xatosi yuz berdi');
//     }
//   }

//   async getExhibitsByMuseum(museumId: string): Promise<Exhibit[]> {
//     const museum = await this.museumRepo.findById(museumId);
//     if (!museum) throw new MuseumNotFoundException(museumId);

//     return this.exhibitRepo.find({
//       where: { museum: { id: museumId }, isActive: true },
//       order: { createdAt: 'DESC' },
//     });
//   }

//   async updateExhibit(
//     id: string,
//     dto: UpdateExhibitDto,
//     file: Express.Multer.File,
//   ): Promise<Exhibit> {
//     const exhibit = await this.exhibitRepo.findOne({
//       where: { id: id as any },
//     });
//     if (!exhibit) throw new ExhibitNotFoundException(id);

//     try {
//       const { file: _f, ...updateData } = dto as any;
//       const oldImage = exhibit.image;

//       Object.assign(exhibit, {
//         ...updateData,
//         ...(file && { image: file.filename }),
//       });

//       const saved = await this.exhibitRepo.save(exhibit);
//       if (file && oldImage) await this.deleteFile('exhibit', oldImage);
//       return saved;
//     } catch (error) {
//       await this.deleteFile('exhibit', file?.filename);
//       this.logger.error('updateExhibit:', error?.stack);
//       throw new InternalServerErrorException('Server xatosi yuz berdi');
//     }
//   }

//   async deleteExhibit(id: string): Promise<{ message: string }> {
//     const exhibit = await this.exhibitRepo.findOne({
//       where: { id: id as any },
//     });
//     if (!exhibit) throw new ExhibitNotFoundException(id);

//     if (exhibit.image) await this.deleteFile('exhibit', exhibit.image);

//     await this.exhibitRepo.softDelete(id);
//     return { message: "Eksponat o'chirildi" };
//   }

//   // ═══════════════════════════════════════════════════════════
//   // GALLERY
//   // ═══════════════════════════════════════════════════════════

//   async addGalleryImage(
//     dto: CreateGalleryDto,
//     file: Express.Multer.File,
//   ): Promise<Gallery> {
//     if (!file) throw new BadRequestException('Rasm fayli majburiy');

//     const museum = await this.museumRepo.findById(dto.museumId);
//     if (!museum) throw new MuseumNotFoundException(dto.museumId);

//     try {
//       this.validateImage(file);
//       const { file: _f, ...data } = dto as any;

//       const gallery = this.galleryRepo.create({
//         ...data,
//         imageUrl: file.filename,
//         museum: { id: dto.museumId },
//       });

//       return await this.galleryRepo.save(gallery);
//     } catch (error) {
//       await this.deleteFile('gallery', file?.filename);
//       if (error instanceof InvalidImageException) throw error;
//       this.logger.error('addGalleryImage:', error?.stack);
//       throw new InternalServerErrorException('Server xatosi yuz berdi');
//     }
//   }

//   async getGalleryByMuseum(museumId: string): Promise<Gallery[]> {
//     const museum = await this.museumRepo.findById(museumId);
//     if (!museum) throw new MuseumNotFoundException(museumId);

//     return this.galleryRepo.find({
//       where: { museum: { id: museumId } },
//       order: { order: 'ASC', createdAt: 'DESC' },
//     });
//   }

//   async updateGalleryItem(
//     id: string,
//     dto: UpdateGalleryDto,
//     file: Express.Multer.File,
//   ): Promise<Gallery> {
//     const item = await this.galleryRepo.findOne({ where: { id: id as any } });
//     if (!item) throw new GalleryNotFoundException(id);

//     try {
//       const { file: _f, ...updateData } = dto as any;
//       const oldImage = item.imageUrl;

//       Object.assign(item, {
//         ...updateData,
//         ...(file && { imageUrl: file.filename }),
//       });

//       const saved = await this.galleryRepo.save(item);
//       if (file && oldImage) await this.deleteFile('gallery', oldImage);
//       return saved;
//     } catch (error) {
//       await this.deleteFile('gallery', file?.filename);
//       this.logger.error('updateGalleryItem:', error?.stack);
//       throw new InternalServerErrorException('Server xatosi yuz berdi');
//     }
//   }

//   async deleteGalleryItem(id: string): Promise<{ message: string }> {
//     const item = await this.galleryRepo.findOne({ where: { id: id as any } });
//     if (!item) throw new GalleryNotFoundException(id);

//     await this.deleteFile('gallery', item.imageUrl);
//     await this.galleryRepo.delete(id);
//     return { message: "Galereya rasmi o'chirildi" };
//   }

//   // ═══════════════════════════════════════════════════════════
//   // REVIEWS
//   // ═══════════════════════════════════════════════════════════

//   async addReview(dto: CreateReviewDto, userId: string): Promise<Review> {
//     const museum = await this.museumRepo.findById(dto.museumId);
//     if (!museum) throw new MuseumNotFoundException(dto.museumId);

//     // Bir user bir muzeyga faqat bir review yoza oladi
//     const existingReview = await this.reviewRepo.findOne({
//       where: {
//         museum: { id: dto.museumId },
//         user: { id: userId },
//       },
//     });
//     if (existingReview) throw new ReviewAlreadyExistsException();

//     try {
//       const review = this.reviewRepo.create({
//         rating: dto.rating,
//         comment: dto.comment,
//         museum: { id: dto.museumId },
//         user: { id: userId },
//       });

//       const saved = await this.reviewRepo.save(review);

//       // averageRating va reviewCount ni yangilash
//       await this.recalculateRating(dto.museumId);

//       return saved;
//     } catch (error) {
//       if (error instanceof ConflictException) throw error;
//       this.logger.error('addReview:', error?.stack);
//       throw new InternalServerErrorException('Server xatosi yuz berdi');
//     }
//   }

//   async getReviewsByMuseum(museumId: string): Promise<Review[]> {
//     const museum = await this.museumRepo.findById(museumId);
//     if (!museum) throw new MuseumNotFoundException(museumId);

//     return this.reviewRepo.find({
//       where: { museum: { id: museumId } },
//       relations: ['user'],
//       order: { createdAt: 'DESC' },
//     });
//   }

//   async deleteReview(
//     id: string,
//     userId: string,
//     userRole: string,
//   ): Promise<{ message: string }> {
//     const review = await this.reviewRepo.findOne({
//       where: { id: id as any },
//       relations: ['user', 'museum'],
//     });
//     if (!review) throw new ReviewNotFoundException(id);

//     // Faqat o'z reviewini o'chira oladi yoki superadmin
//     if (review.user.id !== userId && userRole !== 'superadmin') {
//       throw new BadRequestException("Siz bu reviewni o'chira olmaysiz");
//     }

//     const museumId = review.museum.id;
//     await this.reviewRepo.delete(id);

//     // Reytingni qayta hisoblash
//     await this.recalculateRating(museumId);

//     return { message: "Review o'chirildi" };
//   }

//   // ═══════════════════════════════════════════════════════════
//   // FAVORITES
//   // ═══════════════════════════════════════════════════════════

//   async toggleFavorite(
//     museumId: string,
//     userId: string,
//   ): Promise<{ message: string; isFavorite: boolean }> {
//     const museum = await this.museumRepo.findById(museumId);
//     if (!museum) throw new MuseumNotFoundException(museumId);

//     const existing = await this.favoriteRepo.findOne({
//       where: {
//         museum: { id: museumId },
//         user: { id: userId },
//       },
//     });

//     if (existing) {
//       await this.favoriteRepo.delete(existing.id);
//       return { message: 'Sevimlilardan olib tashlandi', isFavorite: false };
//     }

//     const favorite = this.favoriteRepo.create({
//       museum: { id: museumId },
//       user: { id: userId },
//     });
//     await this.favoriteRepo.save(favorite);
//     return { message: "Sevimlilarga qo'shildi", isFavorite: true };
//   }

//   async getFavoritesByUser(userId: string): Promise<Favorite[]> {
//     return this.favoriteRepo.find({
//       where: { user: { id: userId } },
//       relations: ['museum'],
//       order: { createdAt: 'DESC' },
//     });
//   }

//   // ═══════════════════════════════════════════════════════════
//   // PRIVATE HELPERS
//   // ═══════════════════════════════════════════════════════════

//   private async recalculateRating(museumId: string): Promise<void> {
//     const result = await this.reviewRepo
//       .createQueryBuilder('review')
//       .select('AVG(review.rating)', 'avg')
//       .addSelect('COUNT(review.id)', 'count')
//       .where('review.museum_id = :museumId', { museumId })
//       .getRawOne();

//     const averageRating = parseFloat(result?.avg ?? '0');
//     const reviewCount = parseInt(result?.count ?? '0', 10);

//     await this.museumRepo.updateRating(museumId, averageRating, reviewCount);
//   }

//   private validateImage(file: Express.Multer.File): void {
//     if (!file) return;
//     const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
//     const MAX = 5 * 1024 * 1024; // 5MB
//     if (!ALLOWED.includes(file.mimetype) || file.size > MAX) {
//       throw new InvalidImageException();
//     }
//   }

//   private async deleteFile(folder: string, filename?: string): Promise<void> {
//     if (!filename) return;
//     const filePath = join(process.cwd(), 'uploads', folder, filename);
//     if (existsSync(filePath)) {
//       await unlink(filePath);
//     }
//   }
// }

// // import {
// //   BadRequestException, ConflictException,
// //   Injectable, InternalServerErrorException, Logger,
// // } from '@nestjs/common';
// // import { DataSource, QueryFailedError } from 'typeorm';
// // import { join } from 'path';
// // import { existsSync } from 'fs';
// // import { unlink } from 'fs/promises';
// // import { MuseumRepository } from './repositories/museum.repository';
// // import { UpdateMuseumDto } from './dto/update-museum.dto';
// // import { FilterMuseumDto } from './dto/query.dto';
// // import { User } from '../auth/user/user.entity';
// // import { CreateMuseumDto } from './dto/create-museum.dto';
// // import { InvalidImageException, MuseumAlreadyExistsException, MuseumNotFoundException } from './dto/museum.exceptions';
// // import { Museum } from './entity/museum.entity';
// // @Injectable()
// // export class MuseumService {
// //   private readonly logger = new Logger(MuseumService.name);

// //   constructor(
// //     private readonly museumRepo: MuseumRepository,
// //     private readonly dataSource: DataSource,
// //   ) {}

// //   // ─── CREATE ───────────────────────────────────────────────────

// //   async addMuseum(dto: CreateMuseumDto, file: Express.Multer.File, userId: string): Promise<Museum> {
// //     const qr = this.dataSource.createQueryRunner();
// //     await qr.connect();
// //     await qr.startTransaction();

// //     try {
// //       this.validateImage(file);

// //       const existing = await this.museumRepo.findByName(dto.name);
// //       if (existing) throw new MuseumAlreadyExistsException(dto.name);

// //       const { file: _file, ...createData } = dto as any;

// //       const museum = qr.manager.create(Museum, {
// //         ...createData,
// //         image: file?.filename ?? null,
// //         user: { id: userId } as User,
// //       });

// //       const saved = await qr.manager.save(museum);
// //       await qr.commitTransaction();
// //       return saved;

// //     } catch (error) {
// //       await qr.rollbackTransaction();
// //       await this.deleteUploadedFile(file?.filename);

// //       if (error instanceof ConflictException || error instanceof InvalidImageException) throw error;

// //       if (error instanceof QueryFailedError && (error as any).code === '23505') {
// //         throw new MuseumAlreadyExistsException(dto.name);
// //       }

// //       this.logger.error('addMuseum xato:', error?.stack);
// //       throw new InternalServerErrorException('Server xatosi yuz berdi');
// //     } finally {
// //       await qr.release();
// //     }
// //   }

// //   // ─── GET ALL ──────────────────────────────────────────────────

// //   async getAll(filter: FilterMuseumDto) {
// //     try {
// //       return await this.museumRepo.findWithFilters(filter);
// //     } catch (error) {
// //       this.logger.error('getAll xato:', error?.stack);
// //       throw new InternalServerErrorException('Server xatosi yuz berdi');
// //     }
// //   }

// //   // ─── FIND ONE ─────────────────────────────────────────────────

// //   async findById(id: string): Promise<Museum> {
// //     const museum = await this.museumRepo.findById(id);
// //     if (!museum) throw new MuseumNotFoundException(id);
// //     return museum;
// //   }

// //   // ─── UPDATE ───────────────────────────────────────────────────

// //   async updateMuseum(id: string, dto: UpdateMuseumDto, file: Express.Multer.File): Promise<Museum | null> {
// //     const existing = await this.museumRepo.findById(id);
// //     if (!existing) {
// //       await this.deleteUploadedFile(file?.filename);
// //       throw new MuseumNotFoundException(id);
// //     }

// //     const oldImage = existing.image ?? null;

// //     try {
// //       const { file: _file, ...updateData } = dto as any;

// //       const updated = await this.museumRepo.update(id, {
// //         ...updateData,
// //         ...(file && { image: file.filename }),
// //       });

// //       if (file && oldImage) await this.deleteUploadedFile(oldImage);
// //       return updated;

// //     } catch (error) {
// //       await this.deleteUploadedFile(file?.filename);

// //       if (error instanceof QueryFailedError && (error as any).code === '23505') {
// //         throw new MuseumAlreadyExistsException(dto.name ?? "Noma'lum");
// //       }

// //       this.logger.error('updateMuseum xato:', error?.stack);
// //       throw new InternalServerErrorException('Server xatosi yuz berdi');
// //     }
// //   }

// //   // ─── UPDATE IMAGE ─────────────────────────────────────────────

// //   async updateImage(id: string, file: Express.Multer.File): Promise<Museum | null> {
// //     if (!file) throw new BadRequestException('Rasm yuklanmadi');

// //     const existing = await this.museumRepo.findById(id);
// //     if (!existing) {
// //       await this.deleteUploadedFile(file.filename);
// //       throw new MuseumNotFoundException(id);
// //     }

// //     try {
// //       const updated = await this.museumRepo.update(id, { image: file.filename });
// //       if (existing.image) await this.deleteUploadedFile(existing.image);
// //       return updated;
// //     } catch (error) {
// //       await this.deleteUploadedFile(file.filename);
// //       this.logger.error('updateImage xato:', error?.stack);
// //       throw new InternalServerErrorException('Server xatosi yuz berdi');
// //     }
// //   }

// //   // ─── DELETE IMAGE ─────────────────────────────────────────────

// //   async deleteImage(id: string): Promise<Museum | null> {
// //     const museum = await this.museumRepo.findById(id);
// //     if (!museum) throw new MuseumNotFoundException(id);

// //     await this.deleteUploadedFile(museum.image);
// //     return this.museumRepo.update(id, { image: '' });
// //   }

// //   // ─── SOFT DELETE ──────────────────────────────────────────────

// //   async softDeleteMuseum(id: string): Promise<{ message: string }> {
// //     const existing = await this.museumRepo.findById(id);
// //     if (!existing) throw new MuseumNotFoundException(id);

// //     try {
// //       await this.museumRepo.softDeleteById(id);
// //       return { message: 'Muzey arxivlandi' };
// //     } catch (error) {
// //       this.logger.error('softDelete xato:', error?.stack);
// //       throw new InternalServerErrorException('Server xatosi yuz berdi');
// //     }
// //   }

// //   async restoreMuseum(id: string): Promise<{ message: string }> {
// //     const existing = await this.museumRepo.findByIdWithDeleted(id);
// //     if (!existing) throw new MuseumNotFoundException(id);

// //     try {
// //       await this.museumRepo.restoreById(id);
// //       return { message: 'Muzey tiklandi' };
// //     } catch (error) {
// //       this.logger.error('restore xato:', error?.stack);
// //       throw new InternalServerErrorException('Server xatosi yuz berdi');
// //     }
// //   }

// //   async getDeletedMuseums(): Promise<Museum[]> {
// //     try {
// //       return await this.museumRepo.findDeletedAll();
// //     } catch (error) {
// //       this.logger.error('getDeleted xato:', error?.stack);
// //       throw new InternalServerErrorException('Server xatosi yuz berdi');
// //     }
// //   }

// //   // ─── DELETE ───────────────────────────────────────────────────

// //   async deleteMuseum(id: string): Promise<{ message: string }> {
// //     const existing = await this.museumRepo.findById(id);
// //     if (!existing) throw new MuseumNotFoundException(id);

// //     if (existing.image) await this.deleteUploadedFile(existing.image);

// //     try {
// //       await this.museumRepo.deleteById(id);
// //       return { message: "Muzey muvaffaqiyatli o'chirildi" };
// //     } catch (error) {
// //       this.logger.error('delete xato:', error?.stack);
// //       throw new InternalServerErrorException('Server xatosi yuz berdi');
// //     }
// //   }

// //   async deleteAllMuseums(): Promise<{ message: string }> {
// //     try {
// //       const images = await this.museumRepo.findAllImages();
// //       await Promise.all(images.map((f) => this.deleteUploadedFile(f)));
// //       await this.museumRepo.deleteAll();
// //       return { message: `${images.length} ta muzey o'chirildi` };
// //     } catch (error) {
// //       this.logger.error('deleteAll xato:', error?.stack);
// //       throw new InternalServerErrorException('Server xatosi yuz berdi');
// //     }
// //   }

// //   // ─── PRIVATE ──────────────────────────────────────────────────

// //   private validateImage(file: Express.Multer.File): void {
// //     if (!file) return;
// //     const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
// //     const MAX = 5 * 1024 * 1024;
// //     if (!ALLOWED.includes(file.mimetype) || file.size > MAX) {
// //       throw new InvalidImageException();
// //     }
// //   }

// //   private async deleteUploadedFile(filename?: string): Promise<void> {
// //     if (!filename) return;
// //     const path = join(process.cwd(), 'uploads', 'museum', filename);
// //     if (existsSync(path)) await unlink(path);
// //   }
// // }
