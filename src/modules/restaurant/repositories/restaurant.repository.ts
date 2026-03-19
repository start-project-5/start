import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { Restaurant } from '../entity/restaurant.entity';
import { FilterRestaurantDto } from '../dto/query.dto';
import { paginate, PaginatedResult, SortOrder } from 'src/utils/pagination';

@Injectable()
export class RestaurantRepository {
  constructor(
    @InjectRepository(Restaurant)
    private readonly repo: Repository<Restaurant>,
  ) {}

  async findWithFilters(
    filters: FilterRestaurantDto,
  ): Promise<PaginatedResult<Restaurant>> {
    const {
      page = 1,
      limit = 10,
      order = SortOrder.DESC,
      search,
      address,
      priceRange,
      minRating,
      isBookingAvailable,
    } = filters;

    const skip = (page - 1) * limit;

    // 1. QueryBuilder yaratamiz va faqat kerakli ustunlarni tanlaymiz (Optimization)
    const qb = this.repo
      .createQueryBuilder('res')
      .select([
        'res.id',
        'res.name',
        'res.address',
        'res.rating',
        'res.priceRange',
        'res.image',
        'res.isBookingAvailable',
        'res.createdAt',
      ])
      // 2. Relationni optimallashtirilgan holda ulaymiz (N+1 oldini olish)
      .leftJoin('res.user', 'user')
      .addSelect(['user.id', 'user.name']); // Egasi haqida faqat kerakli ma'lumot

    // 3. Shartlarni qo'shish (Clean Code approach)
    this.applyFilters(qb, {
      search,
      address,
      priceRange,
      minRating,
      isBookingAvailable,
    });

    // 4. Pagination va Sorting
    // createdAt ustunini ham select ro'yxatiga qo'shish yoki orderBy-ni to'g'ri ko'rsatish kerak
    qb.orderBy('res.createdAt', order) // Bu yerda 'res.createdAt' ekanligiga e'tibor bering
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, page, limit);
  }

  // Yordamchi metod - Shartlarni chiroyli boshqarish uchun
  private applyFilters(qb: SelectQueryBuilder<Restaurant>, filters: any) {
    const { search, address, priceRange, minRating, isBookingAvailable } =
      filters;

    if (search) {
      qb.andWhere('(res.name ILIKE :s OR res.description ILIKE :s)', {
        s: `%${search}%`,
      });
    }

    if (address) {
      qb.andWhere('res.address ILIKE :address', { address: `%${address}%` });
    }

    if (priceRange) {
      qb.andWhere('res.priceRange = :priceRange', { priceRange });
    }

    if (minRating) {
      qb.andWhere('res.rating >= :minRating', { minRating });
    }

    if (isBookingAvailable !== undefined) {
      qb.andWhere('res.isBookingAvailable = :isBookingAvailable', {
        isBookingAvailable,
      });
    }
  }

  // Standart metodlarni ham qo'shib qo'yamiz

  async findByName(name: string): Promise<Restaurant | null> {
    return this.repo.findOne({ where: { name: name as any } });
  }

  async find(): Promise<Restaurant[]> {
    return this.repo.find();
  }

  async save(data: Partial<Restaurant>): Promise<Restaurant> {
    return this.repo.save(data as Restaurant);
  }

  create(data: Partial<Restaurant>): Restaurant {
    return this.repo.create(data);
  }

  async deleteAll(): Promise<void> {
    await this.repo.clear(); // ← delete loop o'rniga bitta query
  }

  async findAllImages(): Promise<string[]> {
    const restaurants = await this.repo.find({ select: ['image'] });
    return restaurants.map((r) => r.image).filter(Boolean); // null/undefined larni olib tashlaymiz
  }

  async findById(id: string): Promise<Restaurant | null> {
    return this.repo.findOne({
      where: { id: id as any },
      relations: ['user'], // ← user ma'lumotini ham qaytaradi
    });
  }

  async update(
    id: string,
    data: Partial<Restaurant>,
  ): Promise<Restaurant | null> {
    // undefined qiymatlarni olib tashlaymiz — DB da eskisi qoladi
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined),
    );

    await this.repo.update(id, cleanData);
    return this.findById(id);
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  // soft delete funksiyalari
  
  async findByIdForSoft(id: string): Promise<Restaurant | null> {
    return this.repo.findOne({
      where: { id: id as any },
      relations: ['user'], // ← user ma'lumotini ham qaytaradi
    });
  }

async findByIdWithDeleted(id: string): Promise<Restaurant | null> {
  return this.repo.findOne({
    where: { id: id as any },
    withDeleted: true,
  });
}

async softDeleteById(id: string): Promise<void> {
  await this.repo.softDelete(id);
}

async restoreById(id: string): Promise<void> {
  await this.repo.restore(id);
}

async findDeletedAll(): Promise<Restaurant[]> {
  return this.repo.find({
    withDeleted: true,
    where: { deletedAt: Not(IsNull()) },
  });
}
}

// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Restaurant } from '../entity/restaurant.entity';
// import { FilterRestaurantDto } from '../dto/query.dto';
// import { paginate, PaginatedResult, SortOrder } from 'src/utils/pagination';

// @Injectable()
// export class RestaurantRepository {
//   constructor(
//     @InjectRepository(Restaurant)
//     private readonly repo: Repository<Restaurant>,
//   ) {}

//   async findWithFilters(
//     filters: FilterRestaurantDto,
//   ): Promise<PaginatedResult<Restaurant>> {
//     const {
//       page = 1,
//       limit = 10,
//       order = SortOrder.DESC,
//       search,
//       address,
//       priceRange,
//       minRating,
//       isBookingAvailable,
//     } = filters;
//     const skip = (page - 1) * limit;

//     const qb = this.repo
//       .createQueryBuilder('restaurant')
//       // Agar relationlar bo'lsa, ularni ham qo'shish mumkin
//       .leftJoinAndSelect('restaurant.user', 'user')
//       .where('1=1'); // Dinamik shartlarni oson qo'shish uchun boshlang'ich nuqta

//     // ── Nomi yoki tavsifi bo'yicha qidiruv ──
//     if (search) {
//       qb.andWhere(
//         '(restaurant.name ILIKE :s OR restaurant.description ILIKE :s)',
//         { s: `%${search}%` },
//       );
//     }

//     // ── Narx toifasi (Price Range) ──
//     if (priceRange) {
//       qb.andWhere('restaurant.priceRange = :priceRange', { priceRange });
//     }

//     // ── Reyting bo'yicha ──
//     if (minRating) {
//       qb.andWhere('restaurant.rating >= :minRating', { minRating });
//     }

//     // ── Bron qilish imkoniyati ──
//     if (isBookingAvailable !== undefined) {
//       qb.andWhere('restaurant.isBookingAvailable = :isBookingAvailable', {
//         isBookingAvailable,
//       });
//     }

//     if (address) {
//       qb.andWhere('restaurant.address ILIKE :address', {
//         address: `%${address}%`,   // ← ILIKE + % aniqroq qidiradi
//       });
//     }

//     // ── Sorting va Pagination ──
//     qb.orderBy('restaurant.createdAt', order).skip(skip).take(limit);

//     const [data, total] = await qb.getManyAndCount();
//     return paginate(data, total, page, limit);
//   }

//   // Standart metodlarni ham qo'shib qo'yamiz
//   async findById(id: string): Promise<Restaurant | null> {
//     return this.repo.findOne({ where: { id: id as any } });
//   }

//   // Standart metodlarni ham qo'shib qo'yamiz
//   async findByName(name: string): Promise<Restaurant | null> {
//     return this.repo.findOne({ where: { name: name as any } });
//   }

//   async find(): Promise<Restaurant[]> {
//     return this.repo.find();
//   }

//   async save(data: Partial<Restaurant>): Promise<Restaurant> {
//     return this.repo.save(data as Restaurant);
//   }

//   create(data: Partial<Restaurant>): Restaurant {
//     return this.repo.create(data);
//   }

//   async deleteAll(): Promise<void> {
//     await this.repo.clear(); // ← delete loop o'rniga bitta query
//   }
// }
