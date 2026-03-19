import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guide } from './entity/guide.entity';
import { CreateGuideDto } from './dto/create-guide.dto';
import { GuideFilterDto } from './dto/guide-filter.dto';
import { paginate, PaginatedResult, SortOrder } from 'src/utils/pagination';
import { UpdateGuideDto } from './dto/update-guide.dto';

@Injectable()
export class GuideService {
  constructor(
    @InjectRepository(Guide)
    private readonly guideRepo: Repository<Guide>,
  ) {}

  // ── Create ──────────────────────────────────────────────────────────────────

  async create(dto: CreateGuideDto): Promise<Guide> {
    this.validateAge(dto.birthDate);

    const guide = this.guideRepo.create({
      ...dto,
      isActive: dto.isActive ?? true,
    });

    return this.guideRepo.save(guide);
  }

  // ── Read ────────────────────────────────────────────────────────────────────

  async findAll(filter: GuideFilterDto): Promise<PaginatedResult<Guide>> {
    const {
      search,
      language,
      availableDay,
      minRate,
      maxRate,
      isActive,
      page = 1,
      limit = 10,
      order = SortOrder.DESC,
    } = filter;

    const qb = this.guideRepo.createQueryBuilder('guide');

    if (search) {
      qb.andWhere('(guide.name ILIKE :s OR guide.bio ILIKE :s)', {
        s: `%${search}%`,
      });
    }

    if (language) {
      // JSONB array contains
      qb.andWhere(':lang = ANY(guide.languages::text[])', { lang: language });
    }

    if (availableDay) {
      qb.andWhere(':day = ANY(guide.availableDays)', { day: availableDay });
    }

    if (minRate !== undefined)
      qb.andWhere('guide.dailyRate >= :minRate', { minRate });
    if (maxRate !== undefined)
      qb.andWhere('guide.dailyRate <= :maxRate', { maxRate });

    // Public consumers always see only active guides unless explicitly filtered
    const activeFilter = isActive !== undefined ? isActive : true;
    qb.andWhere('guide.isActive = :isActive', { isActive: activeFilter });

    qb.orderBy('guide.rating', order).addOrderBy('guide.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, page, limit);
  }

  async findOne(id: string): Promise<Guide> {
    const guide = await this.guideRepo.findOne({
      where: { id },
      relations: ['reviews', 'bookings'],
    });
    if (!guide) throw new NotFoundException(`Guide "${id}" not found`);
    return guide;
  }

  // ── Update ──────────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateGuideDto): Promise<Guide> {
    const guide = await this.findOne(id);

    if (dto.birthDate) this.validateAge(dto.birthDate);

    Object.assign(guide, dto);
    return this.guideRepo.save(guide);
  }

  async updatePhoto(id: string, photoPath: string): Promise<Guide> {
    const guide = await this.findOne(id);
    guide.photo = photoPath;
    return this.guideRepo.save(guide);
  }

  async toggleActive(id: string): Promise<Guide> {
    const guide = await this.findOne(id);
    guide.isActive = !guide.isActive;
    return this.guideRepo.save(guide);
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async remove(id: string): Promise<void> {
    await this.findOne(id); // ensures 404 if not found
    await this.guideRepo.softDelete(id);
  }

  // ── Internal (called by ReviewService after new review) ──────────────────────

  async recalculateRating(guideId: string): Promise<void> {
    await this.guideRepo
      .createQueryBuilder()
      .update(Guide)
      .set({
        rating: () =>
          `(SELECT COALESCE(AVG(r.rating)::numeric(3,2), 0)
            FROM reviews r
            WHERE r.guide_id = '${guideId}'
            AND r.deleted_at IS NULL)`,
      })
      .where('id = :guideId', { guideId })
      .execute();
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private validateAge(birthDate: Date): void {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    if (age < 18)
      throw new BadRequestException('Guide must be at least 18 years old');
    if (age > 80) throw new BadRequestException('Age cannot exceed 80');
  }
}
