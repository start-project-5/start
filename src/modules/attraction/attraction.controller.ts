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
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AttractionService } from './attraction.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { MinRole } from 'src/common/decorators/min-role.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from 'src/common/enum/user-role.enum';
import { AttractionFilterDto } from './dto/attraction-filter.dto';
import { CreateAttractionDto } from './dto/create-attraction.dto';
import { UpdateAttractionDto } from './dto/update-attraction.dto';

@ApiTags('Attractions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attractions')
export class AttractionController {
  constructor(private readonly attractionService: AttractionService) {}

  // ── Public ────────────────────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'List public attractions — filter & paginate' })
  findAll(@Query() filter: AttractionFilterDto) {
    return this.attractionService.findAll(filter, false);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get attraction by slug (SEO URL)' })
  findBySlug(@Param('slug') slug: string) {
    return this.attractionService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get attraction by ID (increments viewsCount)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.attractionService.findOne(id);
  }

  // ── ADMIN+ ────────────────────────────────────────────────────────────────

  @Get('admin/all')
  @MinRole(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] List all attractions including hidden ones' })
  findAllAdmin(@Query() filter: AttractionFilterDto) {
    // adminView=true → honours isPublic filter or shows everything
    return this.attractionService.findAll(filter, true);
  }

  @Post()
  @MinRole(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Create attraction' })
  create(@Body() dto: CreateAttractionDto) {
    return this.attractionService.create(dto);
  }

  @Patch(':id')
  @MinRole(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Update attraction details' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAttractionDto,
  ) {
    return this.attractionService.update(id, dto);
  }

  @Patch(':id/photo')
  @MinRole(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/attractions',
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `attraction-${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/)) {
          return cb(new Error('Only jpg/jpeg/png/webp images are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { photo: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOperation({ summary: '[Admin] Upload attraction photo' })
  updatePhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attractionService.updatePhoto(id, file.path);
  }

  @Patch(':id/toggle-visibility')
  @MinRole(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Toggle attraction public/hidden' })
  toggleVisibility(@Param('id', ParseUUIDPipe) id: string) {
    return this.attractionService.toggleVisibility(id);
  }

  @Delete(':id')
  @MinRole(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Soft-delete attraction' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.attractionService.remove(id);
  }
}