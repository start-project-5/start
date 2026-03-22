import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseUUIDPipe, Patch, Post, Query, Req,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse,
  ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags,
} from '@nestjs/swagger';
import { MenuCatalogService } from './menu-catalog.service';
import { CreateMenuCatalogDto } from './dto/create-menu-catalog.dto';
import { UpdateMenuCatalogDto } from './dto/update-menu-catalog.dto';
import { FilterMenuCatalogDto } from './dto/query.dto';
import { UseFileUpload } from 'src/common/decorators/file-upload.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { MinRole } from 'src/common/decorators/min-role.decorator';
import { UserRole } from 'src/common/enum/user-role.enum';
import { FileCleanupInterceptor } from 'src/common/interceptors/file-cleanup.interceptor';
import { MenuCatalogOwnerGuard } from './guards/menu-catalog-owner.guard';
import { CreateMenuCatalogSwaggerDto } from './dto/menu-catalog-swagger.dto';
import { UpdateMenuCatalogSwaggerDto } from './dto/menu-catalog-swagger-update.dto';

@ApiTags('Menu Catalog')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('menu-catalog')
export class MenuCatalogController {
  constructor(private readonly menuCatalogService: MenuCatalogService) {}

  // ─── POST /api/menu-catalog ───────────────────────────────────
  @Post()
  @UseInterceptors(FileCleanupInterceptor)
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.CREATED)
  @UseFileUpload('file', 'menu-catalog')
  @ApiOperation({ summary: "Katalogga yangi taom qo'shish" })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateMenuCatalogSwaggerDto })
  @ApiCreatedResponse({ description: 'Taom muvaffaqiyatli yaratildi' })
  create(
    @Req() req,
    @Body() dto: CreateMenuCatalogDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.menuCatalogService.addMenuCatalog(dto, file, req.user.id);
  }

  // ─── GET /api/menu-catalog ────────────────────────────────────
  @Get()
  @ApiOperation({ summary: "Katalog ro'yxati" })
  @ApiOkResponse({ description: "Taomlar ro'yxati" })
  findAll(@Query() filter: FilterMenuCatalogDto) {
    return this.menuCatalogService.getAll(filter);
  }

  // ─── GET /api/menu-catalog/deleted ───────────────────────────
  @Get('deleted')
  @MinRole(UserRole.SUPERADMIN)
  @ApiOperation({ summary: "Arxivlangan taomlar" })
  getDeleted() {
    return this.menuCatalogService.getDeleted();
  }

  // ─── GET /api/menu-catalog/:id ───────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: "ID bo'yicha bitta taom" })
  @ApiOkResponse({ description: 'Taom topildi' })
  @ApiNotFoundResponse({ description: 'Taom topilmadi' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuCatalogService.findById(id);
  }

  // ─── PATCH /api/menu-catalog/:id ─────────────────────────────
  @Patch(':id')
  @UseInterceptors(FileCleanupInterceptor)
  @UseGuards(JwtAuthGuard, MenuCatalogOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @UseFileUpload('file', 'menu-catalog')
  @ApiOperation({ summary: "Taom ma'lumotlarini yangilash" })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateMenuCatalogSwaggerDto })
  @ApiOkResponse({ description: 'Muvaffaqiyatli yangilandi' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMenuCatalogDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.menuCatalogService.updateMenuCatalog(id, dto, file);
  }

  // ─── PATCH /api/menu-catalog/:id/image ───────────────────────
  @Patch(':id/image')
  @UseInterceptors(FileCleanupInterceptor)
  @UseGuards(JwtAuthGuard, MenuCatalogOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @UseFileUpload('file', 'menu-catalog')
  @ApiOperation({ summary: 'Taom rasmini yangilash' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  updateImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.menuCatalogService.updateImage(id, file);
  }

  // ─── DELETE /api/menu-catalog/:id/soft ───────────────────────
  @Delete(':id/soft')
  @UseGuards(JwtAuthGuard, MenuCatalogOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Taomni arxivlash' })
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuCatalogService.softDelete(id);
  }

  // ─── PATCH /api/menu-catalog/:id/restore ─────────────────────
  @Patch(':id/restore')
  @MinRole(UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Arxivlangan taomni tiklash' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuCatalogService.restore(id);
  }

  // ─── DELETE /api/menu-catalog/image/:id ──────────────────────
  @Delete('image:id')
  @UseGuards(JwtAuthGuard, MenuCatalogOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Taom rasmini o'chirish" })
  deleteImage(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuCatalogService.deleteImage(id);
  }

  // ─── DELETE /api/menu-catalog/:id ────────────────────────────
  @Delete(':id')
  @UseGuards(JwtAuthGuard, MenuCatalogOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Taomni o'chirish" })
  deleteOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuCatalogService.deleteMenuCatalog(id);
  }

  // ─── DELETE /api/menu-catalog ─────────────────────────────────
  @Delete()
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Barcha taomlarni o'chirish" })
  deleteAll() {
    return this.menuCatalogService.deleteAll();
  }
}