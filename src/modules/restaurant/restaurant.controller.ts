import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
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

@ApiTags('Restaurants')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  // ─── POST /api/restaurant ─────────────────────────────────────
  @Post()
  @Roles(UserRole.TOURIST)
  @HttpCode(HttpStatus.CREATED)
  @UseFileUpload('file')
  @ApiOperation({ summary: 'Yangi restoran qo\'shish' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateRestaurantSwaggerDto })
  @ApiCreatedResponse({ description: 'Restoran muvaffaqiyatli yaratildi' })
  create(
    @Req() req,
    @Body() createRestaurantDto: CreateRestaurantDto,
    @UploadedFile() file: Express.Multer.File,
  ) {    
    return this.restaurantService.addHotel(createRestaurantDto, file, req.user.id);
  }

  // ─── GET /api/restaurant ──────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Filtr va pagination bilan restoranlar ro\'yxati' })
  @ApiOkResponse({ description: 'Restoranlar ro\'yxati' })
  findAll(@Query() filter: FilterRestaurantDto) {
    return this.restaurantService.getAllRestaurant(filter);
  }

  // ─── GET /api/restaurant/:id ──────────────────────────────────
  // @Get(':id')
  // @ApiOperation({ summary: 'ID bo\'yicha bitta restoran' })
  // @ApiOkResponse({ description: 'Restoran topildi' })
  // @ApiNotFoundResponse({ description: 'Restoran topilmadi' })
  // findOne(@Param('id', ParseUUIDPipe) id: string) {
  //   return this.restaurantService.findById(id);
  // }

  @Delete()
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.OK) // 200 qaytaradi, chunki bizda JSON xabar bor
  @ApiOperation({ summary: 'Barcha restoranlarni o\'chirish (faqat admin)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Muvaffaqiyatli o\'chirildi va hisobot qaytarildi',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Barcha restoranlar muvaffaqiyatli o\'chirildi' }
      }
    }
  })
  deleteAll() {
    return this.restaurantService.deleteAllResturant();
  }

  // // ─── DELETE /api/restaurant ───────────────────────────────────
  // @Delete()
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Barcha restoranlarni o\'chirish (faqat admin)' })
  // @ApiNoContentResponse({ description: 'Hammasi o\'chirildi' })
  // deleteAll() {
  //   return this.restaurantService.deleteAllResturant();
  // }
}