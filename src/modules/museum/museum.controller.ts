import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { MuseumService } from './museum.service';

import { UpdateMuseumDto } from './dto/update-museum.dto';
import { FilterMuseumDto } from './dto/query.dto';
import { CreateMuseumSwaggerDto } from './dto/museum-swagger.dto';
import { UpdateMuseumSwaggerDto } from './dto/museum-swagger-update.dto';
import { CreateReviewDto } from './dto/review.dto';
import {
  CreateExhibitSwaggerDto,
  UpdateExhibitSwaggerDto,
  CreateExhibitDto,
  UpdateExhibitDto,
} from './dto/exhibit.dto';
import {
  CreateGallerySwaggerDto,
  UpdateGallerySwaggerDto,
  CreateGalleryDto,
  UpdateGalleryDto,
} from './dto/gallery.dto';

import { UseFileUpload } from 'src/common/decorators/file-upload.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { MinRole } from 'src/common/decorators/min-role.decorator';
import { UserRole } from 'src/common/enum/user-role.enum';
import { FileCleanupInterceptor } from 'src/common/interceptors/file-cleanup.interceptor';
import { MuseumOwnerGuard } from './guards/owner.guard';
import { CreateMuseumDto } from './dto/create-museum.dto';

@ApiTags('Museums')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('museum')
export class MuseumController {
  constructor(private readonly museumService: MuseumService) {}

  // ═══════════════════════════════════════════════════════════
  // MUSEUM ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  // ─── POST /api/museum ─────────────────────────────────────
  @Post()
  @UseInterceptors(FileCleanupInterceptor)
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.CREATED)
  @UseFileUpload('file', 'museum')
  @ApiOperation({ summary: "Yangi muzey qo'shish" })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateMuseumSwaggerDto })
  @ApiCreatedResponse({ description: 'Muzey muvaffaqiyatli yaratildi' })
  create(
    @Req() req,
    @Body() dto: CreateMuseumDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.museumService.addMuseum(dto, file, req.user.id);
  }

  // ─── GET /api/museum ──────────────────────────────────────
  @Get()
  @ApiOperation({ summary: "Filtr bilan muzeylar ro'yxati" })
  @ApiOkResponse({ description: "Muzeylar ro'yxati" })
  findAll(@Query() filter: FilterMuseumDto) {
    return this.museumService.getAll(filter);
  }

  // ─── GET /api/museum/deleted ──────────────────────────────
  @Get('deleted')
  @MinRole(UserRole.TOURIST)
  @ApiOperation({ summary: "Arxivlangan muzeylar ro'yxati" })
  getDeleted() {
    return this.museumService.getDeletedMuseums();
  }

  // ─── GET /api/museum/:id ──────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: "ID bo'yicha bitta muzey" })
  @ApiOkResponse({ description: 'Muzey topildi' })
  @ApiNotFoundResponse({ description: 'Muzey topilmadi' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.museumService.findById(id);
  }

  // ─── PATCH /api/museum/:id ────────────────────────────────
  @Patch(':id')
  @UseGuards(JwtAuthGuard, MuseumOwnerGuard)
  @UseInterceptors(FileCleanupInterceptor)
  @HttpCode(HttpStatus.OK)
  @UseFileUpload('file', 'museum')
  @ApiOperation({ summary: "Muzey ma'lumotlarini yangilash" })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateMuseumSwaggerDto })
  @ApiOkResponse({ description: 'Muvaffaqiyatli yangilandi' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMuseumDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.museumService.updateMuseum(id, dto, file);
  }

  // ─── PATCH /api/museum/:id/image ──────────────────────────
  @Patch(':id/image')
  @UseGuards(JwtAuthGuard, MuseumOwnerGuard)
  @UseInterceptors(FileCleanupInterceptor)
  @HttpCode(HttpStatus.OK)
  @UseFileUpload('file', 'museum')
  @ApiOperation({ summary: 'Muzey rasmini yangilash' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Yangi rasm' },
      },
    },
  })
  updateImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.museumService.updateImage(id, file);
  }

  // ─── DELETE /api/museum/:id/image ────────────────────────
  @Delete(':id/image')
  @UseGuards(JwtAuthGuard, MuseumOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Muzey rasmini o'chirish" })
  deleteImage(@Param('id', ParseUUIDPipe) id: string) {
    return this.museumService.deleteImage(id);
  }

  // ─── DELETE /api/museum/:id/soft ─────────────────────────
  @Delete(':id/soft')
  @UseGuards(JwtAuthGuard, MuseumOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Muzeyny arxivlash (soft delete)' })
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.museumService.softDeleteMuseum(id);
  }

  // ─── PATCH /api/museum/:id/restore ───────────────────────
  @Patch(':id/restore')
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Arxivlangan muzeyny tiklash' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.museumService.restoreMuseum(id);
  }

  // ─── DELETE /api/museum/:id ───────────────────────────────
  @Delete(':id')
  @UseGuards(JwtAuthGuard, MuseumOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Muzeyny o'chirish" })
  @ApiNotFoundResponse({ description: 'Muzey topilmadi' })
  deleteOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.museumService.deleteMuseum(id);
  }

  // ─── DELETE /api/museum ───────────────────────────────────
  @Delete()
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Barcha muzeylarni o'chirish (faqat superadmin)" })
  deleteAll() {
    return this.museumService.deleteAllMuseums();
  }

  // ═══════════════════════════════════════════════════════════
  // EXHIBIT ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  // ─── POST /api/museum/exhibit ─────────────────────────────
  @Post('exhibit')
  @UseInterceptors(FileCleanupInterceptor)
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.CREATED)
  @UseFileUpload('file', 'exhibit')
  @ApiOperation({ summary: "Muzeyga eksponat qo'shish" })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateExhibitSwaggerDto })
  @ApiCreatedResponse({ description: 'Eksponat yaratildi' })
  addExhibit(
    @Body() dto: CreateExhibitDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.museumService.addExhibit(dto, file);
  }

  // ─── GET /api/museum/:id/exhibits ────────────────────────
  @Get(':id/exhibits')
  @ApiOperation({ summary: "Muzeyning barcha eksponatlari" })
  @ApiOkResponse({ description: "Eksponatlar ro'yxati" })
  getExhibits(@Param('id', ParseUUIDPipe) id: string) {
    return this.museumService.getExhibitsByMuseum(id);
  }

  // ─── PATCH /api/museum/exhibit/:id ───────────────────────
  @Patch('exhibit/:id')
  @UseInterceptors(FileCleanupInterceptor)
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.OK)
  @UseFileUpload('file', 'exhibit')
  @ApiOperation({ summary: 'Eksponatni yangilash' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateExhibitSwaggerDto })
  updateExhibit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExhibitDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.museumService.updateExhibit(id, dto, file);
  }

  // ─── DELETE /api/museum/exhibit/:id ──────────────────────
  @Delete('exhibit/:id')
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Eksponatni o'chirish (soft)" })
  deleteExhibit(@Param('id', ParseUUIDPipe) id: string) {
    return this.museumService.deleteExhibit(id);
  }

  // ═══════════════════════════════════════════════════════════
  // GALLERY ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  // ─── POST /api/museum/gallery ─────────────────────────────
  @Post('gallery')
  @UseInterceptors(FileCleanupInterceptor)
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.CREATED)
  @UseFileUpload('file', 'gallery')
  @ApiOperation({ summary: "Muzeyga galereya rasmi qo'shish" })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateGallerySwaggerDto })
  @ApiCreatedResponse({ description: 'Galereya rasmi yaratildi' })
  addGallery(
    @Body() dto: CreateGalleryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.museumService.addGalleryImage(dto, file);
  }

  // ─── GET /api/museum/:id/gallery ─────────────────────────
  @Get(':id/gallery')
  @ApiOperation({ summary: 'Muzey galereyasi' })
  @ApiOkResponse({ description: "Galereya rasmlari ro'yxati" })
  getGallery(@Param('id', ParseUUIDPipe) id: string) {
    return this.museumService.getGalleryByMuseum(id);
  }

  // ─── PATCH /api/museum/gallery/:id ───────────────────────
  @Patch('gallery/:id')
  @UseInterceptors(FileCleanupInterceptor)
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.OK)
  @UseFileUpload('file', 'gallery')
  @ApiOperation({ summary: 'Galereya rasmini yangilash' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateGallerySwaggerDto })
  updateGallery(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGalleryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.museumService.updateGalleryItem(id, dto, file);
  }

  // ─── DELETE /api/museum/gallery/:id ──────────────────────
  @Delete('gallery/:id')
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Galereya rasmini o'chirish" })
  deleteGallery(@Param('id', ParseUUIDPipe) id: string) {
    return this.museumService.deleteGalleryItem(id);
  }

  // ═══════════════════════════════════════════════════════════
  // REVIEW ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  // ─── POST /api/museum/review ──────────────────────────────
  @Post('review')
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Muzeyga review qo'shish" })
  @ApiCreatedResponse({ description: 'Review yaratildi' })
  addReview(@Req() req, @Body() dto: CreateReviewDto) {
    return this.museumService.addReview(dto, req.user.id);
  }

  // ─── GET /api/museum/:id/reviews ─────────────────────────
  @Get(':id/reviews')
  @ApiOperation({ summary: "Muzeyning barcha reviewlari" })
  @ApiOkResponse({ description: "Reviewlar ro'yxati" })
  getReviews(@Param('id', ParseUUIDPipe) id: string) {
    return this.museumService.getReviewsByMuseum(id);
  }

  // ─── DELETE /api/museum/review/:id ───────────────────────
  @Delete('review/:id')
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "O'z reviewini o'chirish" })
  deleteReview(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.museumService.deleteReview(id, req.user.id, req.user.role);
  }

  // ═══════════════════════════════════════════════════════════
  // FAVORITE ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  // ─── POST /api/museum/:id/favorite ───────────────────────
  @Post(':id/favorite')
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Sevimlilarga qo'shish / olib tashlash (toggle)" })
  toggleFavorite(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.museumService.toggleFavorite(id, req.user.id);
  }

  // ─── GET /api/museum/favorites/my ────────────────────────
  @Get('favorites/my')
  @MinRole(UserRole.TOURIST)
  @ApiOperation({ summary: "Mening sevimli muzeylarim" })
  @ApiOkResponse({ description: "Sevimli muzeylar ro'yxati" })
  getMyFavorites(@Req() req) {
    return this.museumService.getFavoritesByUser(req.user.id);
  }
}

// import {
//   Body, Controller, Delete, Get, HttpCode, HttpStatus,
//   Param, ParseUUIDPipe, Patch, Post, Query, Req,
//   UploadedFile, UseGuards, UseInterceptors,
// } from '@nestjs/common';
// import {
//   ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse,
//   ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags,
// } from '@nestjs/swagger';
// import { MuseumService } from './museum.service';
// import { UpdateMuseumDto } from './dto/update-museum.dto';
// import { FilterMuseumDto } from './dto/query.dto';
// import { CreateMuseumSwaggerDto } from './dto/museum-swagger.dto';
// import { UpdateMuseumSwaggerDto } from './dto/museum-swagger-update.dto';
// import { UseFileUpload } from 'src/common/decorators/file-upload.decorator';
// import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
// import { RolesGuard } from 'src/common/guards/roles.guard';
// import { MinRole } from 'src/common/decorators/min-role.decorator';
// import { UserRole } from 'src/common/enum/user-role.enum';
// import { FileCleanupInterceptor } from 'src/common/interceptors/file-cleanup.interceptor';
// import { MuseumOwnerGuard } from './guards/owner.guard';
// import { CreateMuseumDto } from './dto/create-museum.dto';

// @ApiTags('Museums')
// @ApiBearerAuth('access-token')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Controller('museum')
// export class MuseumController {
//   constructor(private readonly museumService: MuseumService) {}

//   // ─── POST /api/museum ─────────────────────────────────────────
//   @Post()
//   @UseInterceptors(FileCleanupInterceptor)
//   @MinRole(UserRole.TOURIST)
//   @HttpCode(HttpStatus.CREATED)
//   @UseFileUpload('file', 'museum')
//   @ApiOperation({ summary: "Yangi muzey qo'shish" })
//   @ApiConsumes('multipart/form-data')
//   @ApiBody({ type: CreateMuseumSwaggerDto })
//   @ApiCreatedResponse({ description: 'Muzey muvaffaqiyatli yaratildi' })
//   create(
//     @Req() req,
//     @Body() dto: CreateMuseumDto,
//     @UploadedFile() file: Express.Multer.File,
//   ) {
//     return this.museumService.addMuseum(dto, file, req.user.id);
//   }

//   // ─── GET /api/museum ──────────────────────────────────────────
//   @Get()
//   @ApiOperation({ summary: "Filtr bilan muzeylar ro'yxati" })
//   @ApiOkResponse({ description: "Muzeylar ro'yxati" })
//   findAll(@Query() filter: FilterMuseumDto) {
//     return this.museumService.getAll(filter);
//   }

//   // ─── GET /api/museum/deleted ──────────────────────────────────
//   @Get('deleted')
//   @MinRole(UserRole.TOURIST)
//   @ApiOperation({ summary: "Arxivlangan muzeylar ro'yxati" })
//   getDeleted() {
//     return this.museumService.getDeletedMuseums();
//   }

//   // ─── GET /api/museum/:id ──────────────────────────────────────
//   @Get(':id')
//   @ApiOperation({ summary: "ID bo'yicha bitta muzey" })
//   @ApiOkResponse({ description: 'Muzey topildi' })
//   @ApiNotFoundResponse({ description: 'Muzey topilmadi' })
//   findById(@Param('id', ParseUUIDPipe) id: string) {
//     return this.museumService.findById(id);
//   }

//   // ─── PATCH /api/museum/:id ────────────────────────────────────
//   @Patch(':id')
//   @UseInterceptors(FileCleanupInterceptor)
//   @MinRole(UserRole.TOURIST)
//   @HttpCode(HttpStatus.OK)
//   @UseFileUpload('file', 'museum')
//   @ApiOperation({ summary: "Muzey ma'lumotlarini yangilash" })
//   @ApiConsumes('multipart/form-data')
//   @ApiBody({ type: UpdateMuseumSwaggerDto })
//   update(
//     @Param('id', ParseUUIDPipe) id: string,
//     @Body() dto: UpdateMuseumDto,
//     @UploadedFile() file: Express.Multer.File,
//   ) {
//     return this.museumService.updateMuseum(id, dto, file);
//   }

//   // ─── PATCH /api/museum/:id/image ──────────────────────────────
//   @Patch(':id/image')
//   @UseInterceptors(FileCleanupInterceptor)
//   @MinRole(UserRole.TOURIST)
//   @HttpCode(HttpStatus.OK)
//   @UseFileUpload('file', 'museum')
//   @ApiOperation({ summary: 'Muzey rasmini yangilash' })
//   @ApiConsumes('multipart/form-data')
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         file: { type: 'string', format: 'binary', description: 'Yangi rasm' },
//       },
//     },
//   })
//   updateImage(
//     @Param('id', ParseUUIDPipe) id: string,
//     @UploadedFile() file: Express.Multer.File,
//   ) {
//     return this.museumService.updateImage(id, file);
//   }

//   // ─── DELETE /api/museum/:id/soft ─────────────────────────────
//   @Delete(':id/soft')
//   @UseGuards(JwtAuthGuard, MuseumOwnerGuard)
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: 'Muzeyny arxivlash (soft delete)' })
//   softDelete(@Param('id', ParseUUIDPipe) id: string) {
//     return this.museumService.softDeleteMuseum(id);
//   }

//   // ─── PATCH /api/museum/:id/restore ───────────────────────────
//   @Patch(':id/restore')
//   @MinRole(UserRole.TOURIST)
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: 'Arxivlangan muzeyny tiklash' })
//   restore(@Param('id', ParseUUIDPipe) id: string) {
//     return this.museumService.restoreMuseum(id);
//   }

//   // ─── DELETE /api/museum/image/:id ────────────────────────────
//   @Delete('image/:id')
//   @UseGuards(JwtAuthGuard, MuseumOwnerGuard)
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: "Muzey rasmini o'chirish" })
//   deleteImage(@Param('id', ParseUUIDPipe) id: string) {
//     return this.museumService.deleteImage(id);
//   }

//   // ─── DELETE /api/museum/:id ───────────────────────────────────
//   @Delete(':id')
//   @UseGuards(JwtAuthGuard, MuseumOwnerGuard)
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: "Muzeyny o'chirish" })
//   @ApiNotFoundResponse({ description: 'Muzey topilmadi' })
//   deleteOne(@Param('id', ParseUUIDPipe) id: string) {
//     return this.museumService.deleteMuseum(id);
//   }

//   // ─── DELETE /api/museum ───────────────────────────────────────
//   @Delete()
//   @MinRole(UserRole.TOURIST)
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: "Barcha muzeylarni o'chirish (faqat superadmin)" })
//   deleteAll() {
//     return this.museumService.deleteAllMuseums();
//   }
// }