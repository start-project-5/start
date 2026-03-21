import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import { join } from 'path';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { Hotel } from './entity/hotel.entity';
import { HotelRepository } from './repositories/hotel.repository';
import { CreateHotelDto } from './dto/hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { FilterHotelDto } from './dto/query.dto';
import { User } from '../auth/user/user.entity';
import {
  HotelAlreadyExistsException,
  HotelNotFoundException,
  InvalidImageException,
} from './exceptions/hotel.exceptions';

@Injectable()
export class HotelService {
  private readonly logger = new Logger(HotelService.name);

  constructor(
    private readonly hotelRepo: HotelRepository,
    private readonly dataSource: DataSource,
  ) {}

  // ─── ADD HOTEL ────────────────────────────────

  async addHotel(
    dto: CreateHotelDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<Hotel> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.validateImage(file);

      const existing = await this.hotelRepo.findByName(dto.name);
      if (existing) {
        throw new HotelAlreadyExistsException(dto.name);
      }

      const { file: _file, ...createData } = dto as any;

      const hotel = queryRunner.manager.create(Hotel, {
        ...createData,
        image: file?.filename ?? null,
        user: { id: userId } as User,
      });

      const saved = await queryRunner.manager.save(hotel);
      await queryRunner.commitTransaction();
      return saved;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await this.deleteUploadedFile('hotel', file?.filename);

      if (
        error instanceof ConflictException ||
        error instanceof InvalidImageException
      ) {
        throw error;
      }

      if (error instanceof QueryFailedError) {
        const pg = error as any;
        if (pg.code === '23505') {
          throw new HotelAlreadyExistsException(dto.name);
        }
      }

      this.logger.error('addHotel: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    } finally {
      await queryRunner.release();
    }
  }

  // ─── GET ALL ────────────────────────────────

  async getAll(filter: FilterHotelDto) {
    try {
      return await this.hotelRepo.findWithFilters(filter);
    } catch (error) {
      this.logger.error('getAll: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── FIND ONE ────────────────────────────────

  async findById(id: string): Promise<Hotel> {
    const hotel = await this.hotelRepo.findById(id);
    if (!hotel) throw new HotelNotFoundException(id);
    return hotel;
  }

  // ─── UPDATE ────────────────────────────────

  async updateHotel(
    id: string,
    dto: UpdateHotelDto,
    file: Express.Multer.File,
  ): Promise<Hotel | null> {
    const existing = await this.hotelRepo.findById(id);
    if (!existing) {
      await this.deleteUploadedFile('hotel', file?.filename);
      throw new HotelNotFoundException(id);
    }

    const oldImage = existing.image ?? null;

    try {
      const { file: _file, ...updateData } = dto as any;

      const updated = await this.hotelRepo.update(id, {
        ...updateData,
        ...(file && { image: file.filename }),
      });

      if (file && oldImage) {
        await this.deleteUploadedFile('hotel', oldImage);
      }

      return updated;
    } catch (error) {
      await this.deleteUploadedFile('hotel', file?.filename);

      if (error instanceof QueryFailedError) {
        const pg = error as any;
        if (pg.code === '23505') {
          throw new HotelAlreadyExistsException(dto.name ?? "Noma'lum");
        }
      }
      this.logger.error('updateHotel: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── UPDATE IMAGE ────────────────────────────────

  async updateImage(id: string, file: Express.Multer.File): Promise<Hotel | null> {
    if (!file) throw new BadRequestException('Rasm yuklanmadi');

    const existing = await this.hotelRepo.findById(id);
    if (!existing) {
      await this.deleteUploadedFile('hotel', file.filename);
      throw new HotelNotFoundException(id);
    }

    const oldImage = existing.image ?? null;

    try {
      const updated = await this.hotelRepo.update(id, { image: file.filename });
      if (oldImage) await this.deleteUploadedFile('hotel', oldImage);
      return updated;
    } catch (error) {
      await this.deleteUploadedFile('hotel', file.filename);
      this.logger.error('updateImage: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── DELETE IMAGE ────────────────────────────────

  async deleteImage(id: string): Promise<Hotel | null> {
    const hotel = await this.hotelRepo.findById(id);
    if (!hotel) throw new HotelNotFoundException(id);

    await this.deleteUploadedFile('hotel', hotel.image);
    return this.hotelRepo.update(id, { image: "" });
  }

  // ─── SOFT DELETE ────────────────────────────────

  async softDeleteHotel(id: string): Promise<{ message: string }> {
    const existing = await this.hotelRepo.findById(id);
    if (!existing) throw new HotelNotFoundException(id);

    try {
      await this.hotelRepo.softDeleteById(id);
      return { message: 'Mehmonxona arxivlandi' };
    } catch (error) {
      this.logger.error('softDeleteHotel: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  async restoreHotel(id: string): Promise<{ message: string }> {
    const existing = await this.hotelRepo.findByIdWithDeleted(id);
    if (!existing) throw new HotelNotFoundException(id);

    try {
      await this.hotelRepo.restoreById(id);
      return { message: 'Mehmonxona tiklandi' };
    } catch (error) {
      this.logger.error('restoreHotel: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  async getDeletedHotels(): Promise<Hotel[]> {
    try {
      return await this.hotelRepo.findDeletedAll();
    } catch (error) {
      this.logger.error('getDeletedHotels: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── DELETE ────────────────────────────────

  async deleteHotel(id: string): Promise<{ message: string }> {
    const existing = await this.hotelRepo.findById(id);
    if (!existing) throw new HotelNotFoundException(id);

    if (existing.image) {
      await this.deleteUploadedFile('hotel', existing.image);
    }

    try {
      await this.hotelRepo.deleteById(id);
      return { message: "Mehmonxona muvaffaqiyatli o'chirildi" };
    } catch (error) {
      this.logger.error('deleteHotel: xato', error?.stack);
      throw new InternalServerErrorException('Server xatosi yuz berdi');
    }
  }

  // ─── DELETE ALL ────────────────────────────────

  async deleteAllHotels(): Promise<{ message: string }> {
    try {
      const images = await this.hotelRepo.findAllImages();

      await Promise.all(
        images.map((filename) => this.deleteUploadedFile('hotel', filename)),
      );

      await this.hotelRepo.deleteAll();
      this.logger.log(`${images.length} ta mehmonxona o'chirildi`);
      return { message: `${images.length} ta mehmonxona o'chirildi` };
    } catch (error) {
      this.logger.error('deleteAllHotels: xato', error?.stack);
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

// import {
//   Injectable,
//   InternalServerErrorException,
//   Logger,
//   ConflictException,
//   NotFoundException,
// } from '@nestjs/common';
// import { DataSource } from 'typeorm';
// import { HotelRepository } from './repositories/hotel.repository';
// import { Hotel } from './entity/hotel.entity';
// import { join } from 'path';
// import { existsSync, unlinkSync } from 'fs';
// import { CreateHotelDto } from './dto/hotel.dto';
// import { unlink } from 'fs/promises';
// import { HotelAlreadyExistsException, InvalidImageException } from './exceptions/hotel.exceptions';

// @Injectable()
// export class HotelService {
//   private readonly logger = new Logger(HotelService.name);

//   constructor(
//     private readonly hotelRepo: HotelRepository,
//     private readonly dataSource: DataSource,
//   ) {}

//   // ─── ADD HOTEL ────────────────────────────────

//   async addHotel(
//     dto: CreateHotelDto,
//     file: Express.Multer.File,
//     userId: string,
//   ): Promise<Hotel> {
//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       // 1. Rasm validatsiyasi — DB ga borishdan oldin
//       this.validateImage(file);

//       // 2. Duplicate tekshiruv
//       const existing = await this.hotelRepo.findByName(dto.name);
//       if (existing) {
//         throw new HotelAlreadyExistsException(dto.name);
//       }

//       // 3. file ni dto dan ajratamiz
//       const { file: _file, ...createData } = dto as any;

//       // 4. Yaratish va saqlash
//       const hotel = queryRunner.manager.create(Hotel, {
//         ...createData,
//         image: file?.filename ?? null,
//         user: { id: userId },
//       });

//       const saved = await queryRunner.manager.save(hotel);
//       await queryRunner.commitTransaction();
//       return saved;
//     } catch (error) {
//       // ❌ Xato — transaction rollback + rasmni o'chirish
//       await queryRunner.rollbackTransaction();
//       await this.deleteUploadedFile('hotel', file?.filename);

//       // Agar o'zimiz throw qilgan exception bo'lsa — qayta throw
//       if (
//         error instanceof ConflictException ||
//         error instanceof InvalidImageException
//       ) {
//         throw error;
//       }

//       this.logger.error('addHotel: xato', error?.stack);
//       throw new InternalServerErrorException('Server xatosi yuz berdi');
//     } finally {
//       // ← har doim release — xato bo'lsa ham bo'lmasa ham
//       await queryRunner.release();
//     }
//   }
//   // async addHotel(
//   //   dto: CreateHotelDto,
//   //   file: Express.Multer.File,
//   //   userId: string,
//   // ): Promise<Hotel> {
//   //   const queryRunner = this.dataSource.createQueryRunner();
//   //   await queryRunner.connect();
//   //   await queryRunner.startTransaction();

//   //   try {
//   //     const existing = await this.hotelRepo.findByName(dto.name);
//   //     if (existing) {
//   //     await this.deleteUploadedFile('hotel', file?.filename);
//   //       throw new ConflictException('Bu nomli mehmonxona allaqachon mavjud');
//   //     }
//   //     const hotel = queryRunner.manager.create(Hotel, {
//   //       ...dto,
//   //       image: file?.filename ?? null,
//   //       user: { id: userId },
//   //     });

//   //     const saved = await queryRunner.manager.save(hotel);
//   //     await queryRunner.commitTransaction();
//   //     return saved;
//   //   } catch (error) {
//   //     await queryRunner.rollbackTransaction();
//   //     if (file) this.deleteFile(file.filename); // Xato bo'lsa rasmni o'chirish
//   //     throw error;
//   //   } finally {
//   //     await queryRunner.release();
//   //   }
//   // }

//   async getAll(filters: any) {
//     return this.hotelRepo.findWithFilters(filters);
//   }

//   private deleteFile(filename: string) {
//     const path = join(process.cwd(), 'uploads/hotel', filename);
//     if (existsSync(path)) unlinkSync(path);
//   }

//   // ─── Private ─────────────────────────────────────────────────
//   private validateImage(file: Express.Multer.File): void {
//     if (!file) return;

//     const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
//     const MAX_BYTES = 5 * 1024 * 1024;

//     if (!ALLOWED.includes(file.mimetype) || file.size > MAX_BYTES) {
//       throw new InvalidImageException(); // ← custom exception ishlatildi
//     }
//   }

//   private async deleteUploadedFile(
//     folder: string,
//     filename?: string,
//   ): Promise<void> {
//     if (!filename) return;
//     const filePath = join(process.cwd(), 'uploads', folder, filename);
//     if (existsSync(filePath)) {
//       await unlink(filePath);
//     }
//   }
// }
