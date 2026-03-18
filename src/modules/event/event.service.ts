import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entity/event.entity';
import slugify from 'slugify';
import { CreateEventDto } from './dto/create-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { paginate, PaginatedResult, SortOrder } from 'src/utils/pagination';
import { EventStatus } from 'src/common/enum/eventSatatus.enum';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
  ) {}

  // ── Create ──────────────────────────────────────────────────────────────────

  async create(dto: CreateEventDto): Promise<Event> {
    if (dto.endDate && dto.endDate <= dto.startDate) {
      throw new BadRequestException('endDate must be after startDate');
    }

    const slug = await this.generateUniqueSlug(dto.title);
    const event = this.eventRepo.create({ ...dto, slug });
    return this.eventRepo.save(event);
  }

  // ── Read ────────────────────────────────────────────────────────────────────

  async findAll(filter: EventFilterDto): Promise<PaginatedResult<Event>> {
    const {
      search,
      status,
      fromDate,
      toDate,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      order = SortOrder.ASC,
    } = filter;

    const qb = this.eventRepo.createQueryBuilder('event');

    if (search) {
      qb.andWhere(
        '(event.title ILIKE :s OR event.description ILIKE :s OR event.organizer ILIKE :s)',
        { s: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('event.status = :status', { status });
    } else {
      // Hide drafts from public listing
      qb.andWhere('event.status != :draft', { draft: EventStatus.DRAFT });
    }

    if (fromDate) qb.andWhere('event.startDate >= :fromDate', { fromDate: new Date(fromDate) });
    if (toDate) qb.andWhere('event.startDate <= :toDate', { toDate: new Date(toDate) });
    if (minPrice !== undefined) qb.andWhere('event.price >= :minPrice', { minPrice });
    if (maxPrice !== undefined) qb.andWhere('event.price <= :maxPrice', { maxPrice });

    qb.orderBy('event.startDate', order);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, page, limit);
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`Event "${id}" not found`);
    return event;
  }

  async findBySlug(slug: string): Promise<Event> {
    const event = await this.eventRepo.findOne({ where: { slug } });
    if (!event) throw new NotFoundException(`Event "${slug}" not found`);
    return event;
  }

  // ── Update ──────────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    if (dto.endDate && dto.startDate && dto.endDate <= dto.startDate) {
      throw new BadRequestException('endDate must be after startDate');
    }

    // Regenerate slug if title changed
    if (dto.title && dto.title !== event.title) {
      (dto as any).slug = await this.generateUniqueSlug(dto.title);
    }

    Object.assign(event, dto);
    return this.eventRepo.save(event);
  }

  async updateStatus(id: string, status: EventStatus): Promise<Event> {
    const event = await this.findOne(id);

    if (event.status === EventStatus.COMPLETED) {
      throw new BadRequestException('Cannot change the status of a completed event');
    }

    event.status = status;
    return this.eventRepo.save(event);
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.eventRepo.softDelete(id);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private async generateUniqueSlug(title: string): Promise<string> {
    const base = slugify(title, { lower: true, strict: true });
    let slug = base;
    let counter = 1;

    while (await this.eventRepo.findOne({ where: { slug } })) {
      slug = `${base}-${counter++}`;
    }

    return slug;
  }
}