import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    const qb = this.repo
      .createQueryBuilder('restaurant')
      // Agar relationlar bo'lsa, ularni ham qo'shish mumkin
      .leftJoinAndSelect('restaurant.user', 'user')
      .where('1=1'); // Dinamik shartlarni oson qo'shish uchun boshlang'ich nuqta

    // ── Nomi yoki tavsifi bo'yicha qidiruv ──
    if (search) {
      qb.andWhere(
        '(restaurant.name ILIKE :s OR restaurant.description ILIKE :s)',
        { s: `%${search}%` },
      );
    }

    // ── Narx toifasi (Price Range) ──
    if (priceRange) {
      qb.andWhere('restaurant.priceRange = :priceRange', { priceRange });
    }

    // ── Reyting bo'yicha ──
    if (minRating) {
      qb.andWhere('restaurant.rating >= :minRating', { minRating });
    }

    // ── Bron qilish imkoniyati ──
    if (isBookingAvailable !== undefined) {
      qb.andWhere('restaurant.isBookingAvailable = :isBookingAvailable', {
        isBookingAvailable,
      });
    }
   
    if (address) {
      qb.andWhere('restaurant.address ILIKE :address', {
        address: `%${address}%`,   // ← ILIKE + % aniqroq qidiradi
      });
    }

    // ── Sorting va Pagination ──
    qb.orderBy('restaurant.createdAt', order).skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, page, limit);
  }

  // Standart metodlarni ham qo'shib qo'yamiz
  async findById(id: string): Promise<Restaurant | null> {
    return this.repo.findOne({ where: { id: id as any } });
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
}
