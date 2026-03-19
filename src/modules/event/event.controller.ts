import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { MinRole } from 'src/common/decorators/min-role.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { UserRole } from 'src/common/enum/user-role.enum';
import { EventService } from './event.service';
import { EventFilterDto } from './dto/event-filter.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';

@ApiTags('Events')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // ── Public ────────────────────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'List events — filter & paginate' })
  findAll(@Query() filter: EventFilterDto) {
    return this.eventService.findAll(filter);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get event by SEO slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.eventService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventService.findOne(id);
  }

  // ── BUSINESS_OWNER+ ───────────────────────────────────────────────────────

  @Post()
  @MinRole(UserRole.BUSINESS_OWNER)
  @ApiOperation({ summary: '[BusinessOwner+] Create event' })
  create(@Body() dto: CreateEventDto) {
    return this.eventService.create(dto);
  }

  @Patch(':id')
  @MinRole(UserRole.BUSINESS_OWNER)
  @ApiOperation({ summary: '[BusinessOwner+] Update event details' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventService.update(id, dto);
  }

  // ── ADMIN+ ────────────────────────────────────────────────────────────────

  @Patch(':id/status')
  @MinRole(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Change event status (publish, cancel, complete)' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventStatusDto,
  ) {
    return this.eventService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @MinRole(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Soft-delete event' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventService.remove(id);
  }
}