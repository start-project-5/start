import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseUUIDPipe, Patch, Post, Query, Req,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse,
  ApiNotFoundResponse, ApiOkResponse, ApiOperation,
  ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { FilterHotelDto } from './dto/query.dto';
import { UseFileUpload } from 'src/common/decorators/file-upload.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { MinRole } from 'src/common/decorators/min-role.decorator';
import { UserRole } from 'src/common/enum/user-role.enum';
import { FileCleanupInterceptor } from 'src/common/interceptors/file-cleanup.interceptor';
import { CreateHotelSwaggerDto } from './dto/hotel-swagger.dto';
import { HotelOwnerGuard } from './guards/owner-guard';
import { UpdateHotelSwaggerDto } from './dto/hotel-swagger-update.dto';

@ApiTags('Hotels')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  // ─── POST /api/hotel ──────────────────────────────────────────
  @Post()
  @UseInterceptors(FileCleanupInterceptor)
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.CREATED)
  @UseFileUpload('file', 'hotel')
  @ApiOperation({ summary: "Yangi mehmonxona qo'shish" })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateHotelSwaggerDto })
  @ApiCreatedResponse({ description: 'Mehmonxona muvaffaqiyatli yaratildi' })
  create(
    @Req() req,
    @Body() dto: CreateHotelDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.hotelService.addHotel(dto, file, req.user.id);
  }

  // ─── GET /api/hotel ───────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: "Filtr va pagination bilan mehmonxonalar ro'yxati" })
  @ApiOkResponse({ description: "Mehmonxonalar ro'yxati" })
  findAll(@Query() filter: FilterHotelDto) {
    return this.hotelService.getAll(filter);
  }

  // ─── GET /api/hotel/deleted ───────────────────────────────────
  @Get('deleted')
  @MinRole(UserRole.TOURIST)
  @ApiOperation({ summary: "Arxivlangan mehmonxonalar ro'yxati" })
  @ApiOkResponse({ description: 'Arxivlangan mehmonxonalar' })
  getDeleted() {
    return this.hotelService.getDeletedHotels();
  }

  // ─── GET /api/hotel/:id ───────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: "ID bo'yicha bitta mehmonxona" })
  @ApiOkResponse({ description: 'Mehmonxona topildi' })
  @ApiNotFoundResponse({ description: 'Mehmonxona topilmadi' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelService.findById(id);
  }

  // ─── PATCH /api/hotel/:id ─────────────────────────────────────
  @Patch(':id')
  @UseInterceptors(FileCleanupInterceptor)
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.OK)
  @UseFileUpload('file', 'hotel')
  @ApiOperation({ summary: "Mehmonxona ma'lumotlarini yangilash" })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateHotelSwaggerDto })
  @ApiOkResponse({ description: 'Muvaffaqiyatli yangilandi' })
  @ApiNotFoundResponse({ description: 'Mehmonxona topilmadi' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHotelDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.hotelService.updateHotel(id, dto, file);
  }

  // ─── PATCH /api/hotel/:id/image ───────────────────────────────
  @Patch(':id/image')
  @UseInterceptors(FileCleanupInterceptor)
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.OK)
  @UseFileUpload('file', 'hotel')
  @ApiOperation({ summary: 'Mehmonxona rasmini yangilash' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Yangi rasm' },
      },
    },
  })
  @ApiOkResponse({ description: 'Rasm muvaffaqiyatli yangilandi' })
  updateImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.hotelService.updateImage(id, file);
  }

  // ─── DELETE /api/hotel/:id/soft ───────────────────────────────
  @Delete(':id/soft')
  @UseGuards(JwtAuthGuard, HotelOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mehmonxonani arxivlash (soft delete)' })
  @ApiOkResponse({
    schema: { type: 'object', properties: { message: { type: 'string' } } },
  })
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelService.softDeleteHotel(id);
  }

  // ─── PATCH /api/hotel/:id/restore ─────────────────────────────
  @Patch(':id/restore')
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Arxivlangan mehmonxonani tiklash' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelService.restoreHotel(id);
  }

  // ─── DELETE /api/hotel/image/:id ──────────────────────────────
  @Delete('image:id')
  @UseGuards(JwtAuthGuard, HotelOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mehmonxona rasmini o'chirish" })
  deleteImage(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelService.deleteImage(id);
  }

  // ─── DELETE /api/hotel/:id ────────────────────────────────────
  @Delete(':id')
  @UseGuards(JwtAuthGuard, HotelOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Bitta mehmonxonani o'chirish" })
  @ApiNotFoundResponse({ description: 'Mehmonxona topilmadi' })
  deleteOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelService.deleteHotel(id);
  }

  // ─── DELETE /api/hotel ────────────────────────────────────────
  @Delete()
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Barcha mehmonxonalarni o'chirish (faqat superadmin)" })
  deleteAll() {
    return this.hotelService.deleteAllHotels();
  }
}