import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attraction } from './entity/attraction.entity';
import slugify from 'slugify';
import { CreateAttractionDto } from './dto/create-attraction.dto';
import { AttractionFilterDto } from './dto/attraction-filter.dto';
import { paginate, PaginatedResult, SortOrder } from 'src/utils/pagination';
import { UpdateAttractionDto } from './dto/update-attraction.dto';

@Injectable()
export class AttractionService {
  constructor(
    @InjectRepository(Attraction)
    private readonly attractionRepo: Repository<Attraction>,
  ) {}

  // ── Create ──────────────────────────────────────────────────────────────────

  async create(dto: CreateAttractionDto): Promise<Attraction> {
    const slug = await this.generateUniqueSlug(dto.name);
    const attraction = this.attractionRepo.create({
      ...dto,
      slug,
      isPublic: dto.isPublic ?? true,
    });
    return this.attractionRepo.save(attraction);
  }

  // ── Read ────────────────────────────────────────────────────────────────────

  async findAll(
    filter: AttractionFilterDto,
    adminView = false,
  ): Promise<PaginatedResult<Attraction>> {
    const {
      search,
      isPublic,
      page = 1,
      limit = 10,
      order = SortOrder.DESC,
    } = filter;

    const qb = this.attractionRepo.createQueryBuilder('attraction');

    if (search) {
      qb.andWhere(
        '(attraction.name ILIKE :s OR attraction.description ILIKE :s OR attraction.address ILIKE :s)',
        { s: `%${search}%` },
      );
    }

    // Non-admins always see only public attractions
    if (!adminView) {
      qb.andWhere('attraction.isPublic = true');
    } else if (isPublic !== undefined) {
      qb.andWhere('attraction.isPublic = :isPublic', { isPublic });
    }

    qb.orderBy('attraction.viewsCount', order).addOrderBy('attraction.name', 'ASC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, page, limit);
  }

  async findOne(id: string): Promise<Attraction> {
    const attraction = await this.attractionRepo.findOne({ where: { id } });
    if (!attraction) throw new NotFoundException(`Attraction "${id}" not found`);

    // Increment view counter atomically
    await this.attractionRepo.increment({ id }, 'viewsCount', 1);
    attraction.viewsCount += 1;

    return attraction;
  }

  async findBySlug(slug: string): Promise<Attraction> {
    const attraction = await this.attractionRepo.findOne({ where: { slug } });
    if (!attraction) throw new NotFoundException(`Attraction "${slug}" not found`);

    await this.attractionRepo.increment({ id: attraction.id }, 'viewsCount', 1);
    attraction.viewsCount += 1;

    return attraction;
  }

  // ── Update ──────────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateAttractionDto): Promise<Attraction> {
    const attraction = await this.findOne(id);

    if (dto.name && dto.name !== attraction.name) {
      (dto as any).slug = await this.generateUniqueSlug(dto.name);
    }

    Object.assign(attraction, dto);
    return this.attractionRepo.save(attraction);
  }

  async updatePhoto(id: string, imagePath: string): Promise<Attraction> {
    const attraction = await this.findOne(id);
    attraction.image = imagePath;
    return this.attractionRepo.save(attraction);
  }

  async toggleVisibility(id: string): Promise<Attraction> {
    const attraction = await this.findOne(id);
    attraction.isPublic = !attraction.isPublic;
    return this.attractionRepo.save(attraction);
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.attractionRepo.softDelete(id);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name, { lower: true, strict: true });
    let slug = base;
    let counter = 1;

    while (await this.attractionRepo.findOne({ where: { slug } })) {
      slug = `${base}-${counter++}`;
    }

    return slug;
  }
}