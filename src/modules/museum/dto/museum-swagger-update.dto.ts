import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateMuseumDto } from './update-museum.dto';

export class UpdateMuseumSwaggerDto extends UpdateMuseumDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Yangi rasm (ixtiyoriy)',
    required: false,
  })
  declare file?: any;
}

// import { ApiPropertyOptional } from '@nestjs/swagger';
// import { UpdateMuseumDto } from './update-museum.dto';

// export class UpdateMuseumSwaggerDto extends UpdateMuseumDto {
//   @ApiPropertyOptional({
//     type: 'string',
//     format: 'binary',
//     description: 'Yangi rasm (ixtiyoriy)',
//   })
//   declare file?: any;
// }
