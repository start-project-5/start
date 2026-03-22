import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseUUIDPipe, Patch, Post, Query, Req,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse,
  ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags,
} from '@nestjs/swagger';
import { FilterRestaurantMenuDto } from './dto/query.dto';
import { UseFileUpload } from 'src/common/decorators/file-upload.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { MinRole } from 'src/common/decorators/min-role.decorator';
import { UserRole } from 'src/common/enum/user-role.enum';
import { FileCleanupInterceptor } from 'src/common/interceptors/file-cleanup.interceptor';
import { RestaurantMenuService } from './menu-item.service';
import { CreateRestaurantMenuDto } from './dto/create-menu-item.dto';
import { UpdateRestaurantMenuDto } from './dto/update-menu-item.dto';
import { RestaurantMenuOwnerGuard } from './guards/menu-item-owner.guard';
import { CreateRestaurantMenuSwaggerDto } from './dto/menu-item-swagger.dto';
import { UpdateRestaurantMenuSwaggerDto } from './dto/menu-item-swagger-update.dto';

@ApiTags('Restaurant Menu')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('restaurant-menu')
export class RestaurantMenuController {
  constructor(private readonly restaurantMenuService: RestaurantMenuService) {}

  // ─── POST /api/restaurant-menu ────────────────────────────────
  @Post()
  @UseInterceptors(FileCleanupInterceptor)
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.CREATED)
  @UseFileUpload('file', 'restaurant-menu')
  @ApiOperation({ summary: 'Restoran menyusiga taom qo\'shish' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateRestaurantMenuSwaggerDto })
  @ApiCreatedResponse({ description: 'Taom menyuga qo\'shildi' })
  create(
    @Body() dto: CreateRestaurantMenuDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.restaurantMenuService.addToMenu(dto, file);
  }

  // ─── GET /api/restaurant-menu ─────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Restoran menyusi (restaurantId bilan filtr)' })
  @ApiOkResponse({ description: 'Menyu ro\'yxati' })
  findAll(@Query() filter: FilterRestaurantMenuDto) {
    return this.restaurantMenuService.getAll(filter);
  }

  // ─── GET /api/restaurant-menu/:id ────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Bitta menyu elementi' })
  @ApiOkResponse({ description: 'Topildi' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantMenuService.findById(id);
  }

  // ─── PATCH /api/restaurant-menu/:id ──────────────────────────
  @Patch(':id')
  @UseInterceptors(FileCleanupInterceptor)
  @UseGuards(JwtAuthGuard, RestaurantMenuOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @UseFileUpload('file', 'restaurant-menu')
  @ApiOperation({ summary: 'Menyu elementini yangilash' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateRestaurantMenuSwaggerDto })
  @ApiOkResponse({ description: 'Yangilandi' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRestaurantMenuDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.restaurantMenuService.updateMenuItem(id, dto, file);
  }

  // ─── PATCH /api/restaurant-menu/:id/image ────────────────────
  @Patch(':id/image')
  @UseInterceptors(FileCleanupInterceptor)
  @UseGuards(JwtAuthGuard, RestaurantMenuOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @UseFileUpload('file', 'restaurant-menu')
  @ApiOperation({ summary: 'Maxsus rasmni yangilash' })
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
    return this.restaurantMenuService.updateImage(id, file);
  }

  // ─── DELETE /api/restaurant-menu/image/:id ───────────────────
  @Delete('image:id')
  @UseGuards(JwtAuthGuard, RestaurantMenuOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Maxsus rasmni o\'chirish' })
  deleteImage(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantMenuService.deleteImage(id);
  }

  // ─── DELETE /api/restaurant-menu/:id ─────────────────────────
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RestaurantMenuOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Menyudan taomni olib tashlash' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  removeOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantMenuService.removeFromMenu(id);
  }

  // ─── DELETE /api/restaurant-menu ─────────────────────────────
  @Delete()
  @MinRole(UserRole.TOURIST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Barcha menyu elementlarini o\'chirish' })
  clearAll() {
    return this.restaurantMenuService.clearMenu();
  }
}