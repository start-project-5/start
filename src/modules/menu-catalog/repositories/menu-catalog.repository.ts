import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { FilterMenuCatalogDto } from '../dto/query.dto';
import { paginate, PaginatedResult, SortOrder } from 'src/utils/pagination';
import { MenuCatalog } from '../entities/menu-catalog.entity';

@Injectable()
export class MenuCatalogRepository {
  constructor(
    @InjectRepository(MenuCatalog)
    private readonly repo: Repository<MenuCatalog>,
  ) {}

  async findWithFilters(
    filters: FilterMenuCatalogDto,
  ): Promise<PaginatedResult<MenuCatalog>> {
    const {
      page = 1,
      limit = 10,
      order = SortOrder.DESC,
      search,
      category,
      isVegetarian,
      isSpicy,
    } = filters;

    const qb = this.repo
      .createQueryBuilder('item')
      .select([
        'item.id',
        'item.name',
        'item.description',
        'item.image',
        'item.price',
        'item.discountPrice',
        'item.category',
        'item.preparationTime',
        'item.calories',
        'item.ingredients',
        'item.isVegetarian',
        'item.isSpicy',
        'item.createdAt',
      ])
      .leftJoin('item.user', 'user')
      .addSelect(['user.id', 'user.name']);

    this.applyFilters(qb, { search, category, isVegetarian, isSpicy });

    qb.orderBy('item.createdAt', order)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, page, limit);
  }

  private applyFilters(qb: SelectQueryBuilder<MenuCatalog>, filters: any) {
    const { search, category, isVegetarian, isSpicy } = filters;

    if (search) {
      qb.andWhere('(item.name ILIKE :s OR item.description ILIKE :s)', {
        s: `%${search}%`,
      });
    }
    if (category) {
      qb.andWhere('item.category = :category', { category });
    }
    if (isVegetarian !== undefined) {
      qb.andWhere('item.isVegetarian = :isVegetarian', { isVegetarian });
    }
    if (isSpicy !== undefined) {
      qb.andWhere('item.isSpicy = :isSpicy', { isSpicy });
    }
  }

  async findByName(name: string): Promise<MenuCatalog | null> {
    return this.repo.findOne({ where: { name } });
  }

  async findById(id: string): Promise<MenuCatalog | null> {
    return this.repo.findOne({
      where: { id: id as any },
      relations: ['user'],
    });
  }

  async findByIdWithDeleted(id: string): Promise<MenuCatalog | null> {
    return this.repo.findOne({
      where: { id: id as any },
      withDeleted: true,
    });
  }

  async findAllImages(): Promise<string[]> {
    const items = await this.repo.find({ select: ['image'] });
    return items.map((i) => i.image).filter(Boolean);
  }

  create(data: Partial<MenuCatalog>): MenuCatalog {
    return this.repo.create(data);
  }

  async save(data: Partial<MenuCatalog>): Promise<MenuCatalog> {
    return this.repo.save(data as MenuCatalog);
  }

  async update(
    id: string,
    data: Partial<MenuCatalog>,
  ): Promise<MenuCatalog | null> {
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
    // TRUNCATE o'rniga DELETE ishlatamiz — foreign key muammosi yo'q
    await this.repo
      .createQueryBuilder()
      .delete()
      .from('restaurant_menu_items')
      .execute();

    await this.repo
      .createQueryBuilder()
      .delete()
      .from('menu_catalog')
      .execute();
  }

  async softDeleteById(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async restoreById(id: string): Promise<void> {
    await this.repo.restore(id);
  }

  async findDeletedAll(): Promise<MenuCatalog[]> {
    return this.repo.find({
      withDeleted: true,
      where: { deletedAt: Not(IsNull()) },
    });
  }
}
