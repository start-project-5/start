import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { FilterRestaurantMenuDto } from '../dto/query.dto';
import { paginate, PaginatedResult, SortOrder } from 'src/utils/pagination';
import { RestaurantMenuItem } from '../entities/menu-item.entity';

@Injectable()
export class RestaurantMenuRepository {
  constructor(
    @InjectRepository(RestaurantMenuItem)
    private readonly repo: Repository<RestaurantMenuItem>,
  ) {}

  async findWithFilters(
    filters: FilterRestaurantMenuDto,
  ): Promise<PaginatedResult<RestaurantMenuItem>> {
    const {
      page = 1, limit = 10, order = SortOrder.DESC,
      restaurantId, category, status, isAvailable,
    } = filters;

    const qb = this.repo
      .createQueryBuilder('rm')
      .select([
        'rm.id', 'rm.customName', 'rm.customPrice',
        'rm.customImage', 'rm.isAvailable', 'rm.status', 'rm.createdAt',
      ])
      .leftJoin('rm.catalog', 'catalog')
      .addSelect([
        'catalog.id', 'catalog.name', 'catalog.description',
        'catalog.image', 'catalog.price', 'catalog.category',
        'catalog.calories', 'catalog.isVegetarian', 'catalog.isSpicy',
      ])
      .leftJoin('rm.restaurant', 'restaurant')
      .addSelect(['restaurant.id', 'restaurant.name']);

    this.applyFilters(qb, { restaurantId, category, status, isAvailable });

    qb.orderBy('rm.createdAt', order)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, page, limit);
  }

  private applyFilters(qb: SelectQueryBuilder<RestaurantMenuItem>, filters: any) {
    const { restaurantId, category, status, isAvailable } = filters;

    if (restaurantId) {
      qb.andWhere('rm.restaurant_id = :restaurantId', { restaurantId });
    }
    if (category) {
      qb.andWhere('catalog.category = :category', { category });
    }
    if (status) {
      qb.andWhere('rm.status = :status', { status });
    }
    if (isAvailable !== undefined) {
      qb.andWhere('rm.isAvailable = :isAvailable', { isAvailable });
    }
  }

  async findById(id: string): Promise<RestaurantMenuItem | null> {
    return this.repo.findOne({
      where: { id: id as any },
      relations: ['catalog', 'restaurant', 'restaurant.user'],
    });
  }

  async findByCatalogAndRestaurant(
    catalogId: string,
    restaurantId: string,
  ): Promise<RestaurantMenuItem | null> {
    return this.repo.findOne({
      where: {
        catalog: { id: catalogId } as any,
        restaurant: { id: restaurantId } as any,
      },
    });
  }

  async findAllImages(): Promise<string[]> {
    const items = await this.repo.find({ select: ['customImage'] });
    return items.map((i) => i.customImage).filter(Boolean);
  }

  create(data: Partial<RestaurantMenuItem>): RestaurantMenuItem {
    return this.repo.create(data);
  }

  async save(data: Partial<RestaurantMenuItem>): Promise<RestaurantMenuItem> {
    return this.repo.save(data as RestaurantMenuItem);
  }

  async update(
    id: string,
    data: Partial<RestaurantMenuItem>,
  ): Promise<RestaurantMenuItem | null> {
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
}