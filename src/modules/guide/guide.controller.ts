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
import { CreateGuideDto } from './dto/create-guide.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { MinRole } from 'src/common/decorators/min-role.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { UserRole } from 'src/common/enum/user-role.enum';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { GuideService } from './guide.service';
import { GuideFilterDto } from './dto/guide-filter.dto';

@ApiTags('Guides')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('guides')
export class GuideController {
  constructor(private readonly guideService: GuideService) {}

  // ── Public ────────────────────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'List guides (public) — filter & paginate' })
  findAll(@Query() filter: GuideFilterDto) {
    return this.guideService.findAll(filter);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get guide by ID (public)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.guideService.findOne(id);
  }

  // ── ADMIN+ ────────────────────────────────────────────────────────────────

  @Post()
  @MinRole(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Create guide' })
  create(@Body() dto: CreateGuideDto) {
    return this.guideService.create(dto);
  }

  // ── GUIDE+ (guide edits own profile, admin edits any) ────────────────────

  @Patch(':id')
  @MinRole(UserRole.GUIDE)
  @ApiOperation({ summary: '[Guide+] Update guide profile' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGuideDto) {
    return this.guideService.update(id, dto);
  }

  @Patch(':id/photo')
  @MinRole(UserRole.GUIDE)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/guides',
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `guide-${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/)) {
          return cb(
            new Error('Only jpg/jpeg/png/webp images are allowed'),
            false,
          );
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
  @ApiOperation({ summary: '[Guide+] Upload profile photo' })
  updatePhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.guideService.updatePhoto(id, file.path);
  }

  @Patch(':id/toggle-active')
  @MinRole(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Toggle guide active/inactive' })
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.guideService.toggleActive(id);
  }

  @Delete(':id')
  @MinRole(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Soft-delete guide' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.guideService.remove(id);
  }
}
