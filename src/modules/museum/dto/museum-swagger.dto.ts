import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateMuseumDto } from './create-museum.dto';

export class CreateMuseumSwaggerDto extends CreateMuseumDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Muzey uchun rasm fayli (jpg, png, webp)',
    required: false,
  })
  declare file?: any;
}

// import { ApiPropertyOptional } from '@nestjs/swagger';
// import { CreateMuseumDto } from './create-museum.dto';

// export class CreateMuseumSwaggerDto extends CreateMuseumDto {
//   @ApiPropertyOptional({
//     type: 'string',
//     format: 'binary',
//     description: 'Muzey uchun rasm (jpg, png, webp)',
//   })
//   declare file?: any;
// }