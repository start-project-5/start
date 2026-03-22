import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { Hotel } from '../entity/hotel.entity';
import { paginate, PaginatedResult, SortOrder } from 'src/utils/pagination';
import { FilterHotelDto } from '../dto/query.dto';

@Injectable()
export class HotelRepository {
  constructor(
    @InjectRepository(Hotel)
    private readonly repo: Repository<Hotel>,
  ) {}

  async findWithFilters(
    filters: FilterHotelDto,
  ): Promise<PaginatedResult<Hotel>> {
    const {
      page = 1,
      limit = 10,
      order = SortOrder.DESC,
      search,
      stars,
      address,
      isAvailable,
      rating,
    } = filters;

    const qb = this.repo
      .createQueryBuilder('hotel')
      .select([
        'hotel.id',
        'hotel.name',
        'hotel.description',
        'hotel.address',
        'hotel.rating',
        'hotel.stars',
        'hotel.image',
        'hotel.retseptionTime',
        'hotel.isAvailable',
        'hotel.createdAt',
      ])
      .leftJoin('hotel.user', 'user')
      .addSelect(['user.id', 'user.name']);

    this.applyFilters(qb, { search, address, stars, isAvailable, rating });

    qb.orderBy('hotel.createdAt', order)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, page, limit);
  }

  private applyFilters(qb: SelectQueryBuilder<Hotel>, filters: any) {
    const { search, address, stars, isAvailable, rating } = filters;

    if (search) {
      qb.andWhere('(hotel.name ILIKE :s OR hotel.description ILIKE :s)', {
        s: `%${search}%`,
      });
    }
    if (address) {
      qb.andWhere('hotel.address ILIKE :address', { address: `%${address}%` });
    }
    if (stars) {
      qb.andWhere('hotel.stars = :stars', { stars });
    }
    if (rating !== undefined) {
      qb.andWhere('hotel.rating >= :rating', { rating });
    }
    if (isAvailable !== undefined) {
      qb.andWhere('hotel.isAvailable = :isAvailable', { isAvailable });
    }
  }

  async findByName(name: string): Promise<Hotel | null> {
    return this.repo.findOne({ where: { name } });
  }

  async findById(id: string): Promise<Hotel | null> {
    return this.repo.findOne({
      where: { id: id as any },
      relations: ['user'],
    });
  }

  async findByIdWithDeleted(id: string): Promise<Hotel | null> {
    return this.repo.findOne({
      where: { id: id as any },
      withDeleted: true,
    });
  }

  async findAllImages(): Promise<string[]> {
    const hotels = await this.repo.find({ select: ['image'] });
    return hotels.map((h) => h.image).filter(Boolean);
  }

  create(data: Partial<Hotel>): Hotel {
    return this.repo.create(data);
  }

  async save(data: Partial<Hotel>): Promise<Hotel> {
    return this.repo.save(data as Hotel);
  }

  async update(id: string, data: Partial<Hotel>): Promise<Hotel | null> {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined),
    );
    await this.repo.update(id, cleanData);
    return this.findById(id);
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

  async findDeletedAll(): Promise<Hotel[]> {
    return this.repo.find({
      withDeleted: true,
      where: { deletedAt: Not(IsNull()) },
    });
  }
}