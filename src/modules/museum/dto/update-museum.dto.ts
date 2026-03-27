import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateMuseumDto } from './create-museum.dto';

export class UpdateMuseumDto extends PartialType(CreateMuseumDto) {
  @ApiPropertyOptional({ example: 'Yangi muzey nomi' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  })
  name?: string;
}

// import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
// import { IsOptional, IsString } from 'class-validator';
// import { Transform } from 'class-transformer';
// import { CreateMuseumDto } from './create-museum.dto';

// export class UpdateMuseumDto extends PartialType(CreateMuseumDto) {
//   @ApiPropertyOptional({ example: 'Yangi muzey nomi' })
//   @IsOptional()
//   @IsString()
//   @Transform(({ value }) => {
//     if (value === '' || value === null || value === undefined) return undefined;
//     return value;
//   })
//   name?: string;
// }