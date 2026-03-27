import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { paginate, PaginatedResult, SortOrder } from 'src/utils/pagination';
import { FilterMuseumDto } from '../dto/query.dto';
import { Museum } from '../entity/museum.entity';

@Injectable()
export class MuseumRepository {
  constructor(
    @InjectRepository(Museum)
    private readonly repo: Repository<Museum>,
  ) {}

  // ─── FIND WITH FILTERS ───────────────────────────────────────

  async findWithFilters(
    filters: FilterMuseumDto,
  ): Promise<PaginatedResult<Museum>> {
    const {
      page = 1,
      limit = 10,
      order = SortOrder.DESC,
      search,
      city,
      category,
      rating,
      maxPrice,
      isActive,
    } = filters;

    const qb = this.repo
      .createQueryBuilder('museum')
      .select([
        'museum.id',
        'museum.name',
        'museum.description',
        'museum.address',
        'museum.city',
        'museum.category',
        'museum.image',
        'museum.ticketPrice',
        'museum.workingHours',
        'museum.averageRating',
        'museum.reviewCount',
        'museum.isActive',
        'museum.createdAt',
      ])
      .leftJoin('museum.user', 'user')
      .addSelect(['user.id', 'user.name']);

    this.applyFilters(qb, { search, city, category, rating, maxPrice, isActive });

    qb.orderBy('museum.createdAt', order)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, page, limit);
  }

  private applyFilters(
    qb: SelectQueryBuilder<Museum>,
    filters: Partial<FilterMuseumDto>,
  ) {
    const { search, city, category, rating, maxPrice, isActive } = filters;

    if (search) {
      qb.andWhere(
        '(museum.name ILIKE :s OR museum.description ILIKE :s)',
        { s: `%${search}%` },
      );
    }
    if (city) {
      qb.andWhere('museum.city ILIKE :city', { city: `%${city}%` });
    }
    if (category) {
      qb.andWhere('museum.category ILIKE :category', {
        category: `%${category}%`,
      });
    }
    if (rating !== undefined) {
      qb.andWhere('museum.averageRating >= :rating', { rating });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('museum.ticketPrice <= :maxPrice', { maxPrice });
    }
    if (isActive !== undefined) {
      qb.andWhere('museum.isActive = :isActive', { isActive });
    }
  }

  // ─── FINDERS ─────────────────────────────────────────────────

  async findByName(name: string): Promise<Museum | null> {
    return this.repo.findOne({ where: { name } });
  }

  async findById(id: string): Promise<Museum | null> {
    return this.repo.findOne({
      where: { id: id as any },
      relations: ['user', 'exhibits', 'galleries', 'reviews', 'reviews.user'],
    });
  }

  async findByIdWithDeleted(id: string): Promise<Museum | null> {
    return this.repo.findOne({
      where: { id: id as any },
      withDeleted: true,
    });
  }

  async findAllImages(): Promise<string[]> {
    const museums = await this.repo.find({ select: ['image'] });
    return museums.map((m) => m.image).filter(Boolean);
  }

  async findDeletedAll(): Promise<Museum[]> {
    return this.repo.find({
      withDeleted: true,
      where: { deletedAt: Not(IsNull()) },
    });
  }

  // ─── MUTATORS ────────────────────────────────────────────────

  async update(id: string, data: Partial<Museum>): Promise<Museum | null> {
    const clean = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    );
    await this.repo.update(id, clean);
    return this.findById(id);
  }

  async updateRating(
    museumId: string,
    averageRating: number,
    reviewCount: number,
  ): Promise<void> {
    await this.repo.update(museumId, { averageRating, reviewCount });
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async deleteAll(): Promise<void> {
    await this.repo.clear();
  }

  async softDeleteById(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async restoreById(id: string): Promise<void> {
    await this.repo.restore(id);
  }
}

// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { IsNull, Not, Repository, SelectQueryBuilder } from 'typeorm';
// import { paginate, PaginatedResult, SortOrder } from 'src/utils/pagination';
// import { FilterMuseumDto } from '../dto/query.dto';
// import { Museum } from '../entity/museum.entity';

// @Injectable()
// export class MuseumRepository {
//   constructor(
//     @InjectRepository(Museum)
//     private readonly repo: Repository<Museum>,
//   ) {}

//   async findWithFilters(filters: FilterMuseumDto): Promise<PaginatedResult<Museum>> {
//     const {
//       page = 1, limit = 10, order = SortOrder.DESC,
//       search, city, category, rating, maxPrice, isActive,
//     } = filters;

//     const qb = this.repo
//       .createQueryBuilder('museum')
//       .select([
//         'museum.id', 'museum.name', 'museum.description',
//         'museum.address', 'museum.city', 'museum.category',
//         'museum.image', 'museum.ticketPrice', 'museum.workingHours',
//         'museum.averageRating', 'museum.reviewCount',
//         'museum.isActive', 'museum.createdAt',
//       ])
//       .leftJoin('museum.user', 'user')
//       .addSelect(['user.id', 'user.name']);

//     this.applyFilters(qb, { search, city, category, rating, maxPrice, isActive });

//     qb.orderBy('museum.createdAt', order)
//       .skip((page - 1) * limit)
//       .take(limit);

//     const [data, total] = await qb.getManyAndCount();
//     return paginate(data, total, page, limit);
//   }

//   private applyFilters(qb: SelectQueryBuilder<Museum>, filters: any) {
//     const { search, city, category, rating, maxPrice, isActive } = filters;

//     if (search) {
//       qb.andWhere('(museum.name ILIKE :s OR museum.description ILIKE :s)', { s: `%${search}%` });
//     }
//     if (city) {
//       qb.andWhere('museum.city ILIKE :city', { city: `%${city}%` });
//     }
//     if (category) {
//       qb.andWhere('museum.category ILIKE :category', { category: `%${category}%` });
//     }
//     if (rating !== undefined) {
//       qb.andWhere('museum.averageRating >= :rating', { rating });
//     }
//     if (maxPrice !== undefined) {
//       qb.andWhere('museum.ticketPrice <= :maxPrice', { maxPrice });
//     }
//     if (isActive !== undefined) {
//       qb.andWhere('museum.isActive = :isActive', { isActive });
//     }
//   }

//   async findByName(name: string): Promise<Museum | null> {
//     return this.repo.findOne({ where: { name } });
//   }

//   async findById(id: string): Promise<Museum | null> {
//     return this.repo.findOne({
//       where: { id: id as any },
//       relations: ['user', 'exhibits', 'galleries'],
//     });
//   }

//   async findByIdWithDeleted(id: string): Promise<Museum | null> {
//     return this.repo.findOne({ where: { id: id as any }, withDeleted: true });
//   }

//   async findAllImages(): Promise<string[]> {
//     const museums = await this.repo.find({ select: ['image'] });
//     return museums.map((m) => m.image).filter(Boolean);
//   }

//   async update(id: string, data: Partial<Museum>): Promise<Museum | null> {
//     const clean = Object.fromEntries(
//       Object.entries(data).filter(([_, v]) => v !== undefined),
//     );
//     await this.repo.update(id, clean);
//     return this.findById(id);
//   }

//   async deleteById(id: string): Promise<void> {
//     await this.repo.delete(id);
//   }

//   async deleteAll(): Promise<void> {
//     await this.repo.clear();
//   }

//   async softDeleteById(id: string): Promise<void> {
//     await this.repo.softDelete(id);
//   }

//   async restoreById(id: string): Promise<void> {
//     await this.repo.restore(id);
//   }

//   async findDeletedAll(): Promise<Museum[]> {
//     return this.repo.find({
//       withDeleted: true,
//       where: { deletedAt: Not(IsNull()) },
//     });
//   }
// }