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
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/restaurant.dto';
import { CreateRestaurantSwaggerDto } from './dto/restaurant-swagger-image.dto';
import { FilterRestaurantDto } from './dto/query.dto';
import { UseFileUpload } from 'src/common/decorators/file-upload.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enum/user-role.enum';
import { MinRole } from 'src/common/decorators/min-role.decorator';
import { UpdateRestaurantSwaggerDto } from './dto/restaurant-swagger-update-image.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantOwnerGuard } from './guards/owner-guard';
import { FileCleanupInterceptor } from 'src/common/interceptors/file-cleanup.interceptor';

@ApiTags('Restaurants')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  // ─── POST /api/restaurant ─────────────────────────────────────
  @Post()
  @UseInterceptors(FileCleanupInterceptor) // ← SHU YERDA QO'SHILDI
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.CREATED)
  @UseFileUpload('file', 'restaurant') 
  @ApiOperation({ summary: "Yangi restoran qo'shish" })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateRestaurantSwaggerDto })
  @ApiCreatedResponse({ description: 'Restoran muvaffaqiyatli yaratildi' })
  create(
    @Req() req,
    @Body() createRestaurantDto: CreateRestaurantDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.restaurantService.addRestaurant(
      createRestaurantDto,
      file,
      req.user.id,
    );
  }

  // ─── GET /api/restaurant ──────────────────────────────────────
  @Get()
  @ApiOperation({ summary: "Filtr va pagination bilan restoranlar ro'yxati" })
  @ApiOkResponse({ description: "Restoranlar ro'yxati" })
  findAll(@Query() filter: FilterRestaurantDto) {
    return this.restaurantService.getAllRestaurant(filter);
  }

  // ─── GET /api/restaurant/:id ──────────────────────────────────
  @Get('one:id')
  @ApiOperation({ summary: "ID bo'yicha bitta restoran" })
  @ApiOkResponse({ description: 'Restoran topildi' })
  @ApiNotFoundResponse({ description: 'Restoran topilmadi' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantService.findById(id);
  }

  // ─── PATCH /api/restaurant/:id ────────────────────────────────
  @Patch(':id')
  @UseInterceptors(FileCleanupInterceptor)
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.OK)
  @UseFileUpload('file', 'restaurant')
  @ApiOperation({ summary: "Restoran ma'lumotlarini yangilash" })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateRestaurantSwaggerDto })
  @ApiOkResponse({ description: 'Muvaffaqiyatli yangilandi' })
  @ApiNotFoundResponse({ description: 'Restoran topilmadi' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.restaurantService.updateRestaurant(
      id,
      updateRestaurantDto,
      file,
    );
  }

  // ─── PATCH /api/restaurant/:id/image ─────────────────────────
  @Patch(':id/image')
  @UseInterceptors(FileCleanupInterceptor)
  @UseFileUpload('file', 'restaurant')
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restoran rasmini yangilash' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Yangi rasm (jpg/png/webp, max 5MB)',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Rasm muvaffaqiyatli yangilandi' })
  @ApiNotFoundResponse({ description: 'Restoran topilmadi' })
  updateImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.restaurantService.updateImage(id, file);
  }

  // ─── SOFT DELETE FUNKSIYALARI ─────────────────────────────

  // ← OLDIN
  @Get('deleted')
  @MinRole(UserRole.TOURIST)
  @ApiOperation({ summary: "Arxivlangan restoranlar ro'yxati api (biznes ovner)" })
  @ApiOkResponse({ description: 'Arxivlangan restoranlar' })
  getDeleted() {
    return this.restaurantService.getDeletedRestaurants();
  }

  // ← KEYIN
  @Get(':id')
  @ApiOperation({ summary: "ID bo'yicha bitta restoran" })
  @ApiOkResponse({ description: 'Restoran topildi' })
  @ApiNotFoundResponse({ description: 'Restoran topilmadi' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantService.findById(id);
  }

  // ─── DELETE /api/restaurant/:id/soft ─────────────────────────
  @Delete(':id/soft')
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restoranni arxivlash (soft delete) api (biznes ovner)' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Restoran arxivlandi' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restoran topilmadi' })
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantService.softDeleteRestaurant(id);
  }

  // ─── PATCH /api/restaurant/:id/restore ───────────────────────
  @Patch(':id/restore')
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Arxivlangan restoranni tiklash api (biznes ovner)' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Restoran tiklandi' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restoran topilmadi' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantService.restoreRestaurant(id);
  }
  
  // ─── DELETE IMAGE /api/restaurant/:id ───────────────────────────────
  @Delete('image:id')
  @MinRole(UserRole.TOURIST)
  @UseGuards(JwtAuthGuard, RestaurantOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Rrestoran rasmini o'chirish api (biznes ovner)" })
  @ApiOkResponse({
    description: "Muvaffaqiyatli o'chirildi",
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: "Restoran muvaffaqiyatli o'chirildi",
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restoran topilmadi' })
  deleteImage(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantService.deleteImage(id);
  }

  // ─── DELETE /api/restaurant/:id ───────────────────────────────
  @Delete(':id')
  @MinRole(UserRole.TOURIST)
  @UseGuards(JwtAuthGuard, RestaurantOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Bitta restoranni o'chirish" })
  @ApiOkResponse({
    description: "Muvaffaqiyatli o'chirildi",
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: "Restoran muvaffaqiyatli o'chirildi",
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restoran topilmadi' })
  deleteOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantService.deleteRestaurant(id);
  }

  // ─── DELETE ALL /api/restaurant/:id ───────────────────────────────
  @Delete()
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.OK) // 200 qaytaradi, chunki bizda JSON xabar bor
  @ApiOperation({
    summary: "Barcha restoranlarni o'chirish (faqat superadmin)",
  })
  @ApiResponse({
    status: 200,
    description: "Muvaffaqiyatli o'chirildi va hisobot qaytarildi",
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: "Barcha restoranlar muvaffaqiyatli o'chirildi",
        },
      },
    },
  })
  deleteAll() {
    return this.restaurantService.deleteAllResturant();
  }
}
