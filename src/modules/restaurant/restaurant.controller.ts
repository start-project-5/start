import { Body, Controller, Get, Post, Query, Req, UploadedFile } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { UseFileUpload } from 'src/common/decorators/file-upload.decorator';
import { CreateRestaurantDto } from './dto/restaurant.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRestaurantSwaggerDto } from './dto/restaurant-swagger-image.dto';

@ApiTags('restaurant')
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ApiOperation({ description: 'Create article api (public)' })
  @ApiCreatedResponse({ description: 'Created' })
  @UseFileUpload('file')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateRestaurantSwaggerDto }) // Swagger uchun maxsus DTO
  @ApiOperation({ summary: 'Create restaurant' })
  @Post()
  async create(
      @Body() createRestaurantDto: CreateRestaurantDto, // Validatsiya uchun asosiy DTO
      @UploadedFile() file: Express.Multer.File,
      @Req() req,
    ) {
        return this.restaurantService.addHotel(
            createRestaurantDto,
            file /*, req.user.id*/,
        );
  }

  @ApiOperation({ description: "Get restaurant api (public)" })
  @ApiOkResponse({ description: "Restaurants" })
  @Get("all_restaurants")
  getAllRestaurant() {
    return this.restaurantService.getAllRestaurant()
  }


}
