import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class WorkingHoursDto {
  @ApiPropertyOptional({ example: '09:00-22:00' })
  @IsOptional()
  @IsString()
  monday?: string;

  @ApiPropertyOptional({ example: '09:00-22:00' })
  @IsOptional()
  @IsString()
  tuesday?: string;

  @ApiPropertyOptional({ example: '09:00-22:00' })
  @IsOptional()
  @IsString()
  wednesday?: string;

  @ApiPropertyOptional({ example: '09:00-22:00' })
  @IsOptional()
  @IsString()
  thursday?: string;

  @ApiPropertyOptional({ example: '09:00-22:00' })
  @IsOptional()
  @IsString()
  friday?: string;

  @ApiPropertyOptional({ example: '09:00-22:00' })
  @IsOptional()
  @IsString()
  saturday?: string;

  @ApiPropertyOptional({ example: '09:00-22:00' })
  @IsOptional()
  @IsString()
  sunday?: string;
}

// import { IsOptional, IsString, Matches } from 'class-validator';
// import { ApiPropertyOptional } from '@nestjs/swagger';

// const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/;
// // Format: "09:00-22:00"

// export class WorkingHoursDto {
//   @ApiPropertyOptional({ example: '09:00-22:00' })
//   @IsOptional()
//   @IsString()
//   @Matches(TIME_REGEX, { message: 'monday format: "09:00-22:00" bo\'lishi kerak' })
//   monday?: string;

//   @ApiPropertyOptional({ example: '09:00-22:00' })
//   @IsOptional()
//   @IsString()
//   @Matches(TIME_REGEX, { message: 'tuesday format: "09:00-22:00" bo\'lishi kerak' })
//   tuesday?: string;

//   @ApiPropertyOptional({ example: '09:00-22:00' })
//   @IsOptional()
//   @IsString()
//   @Matches(TIME_REGEX, { message: 'wednesday format: "09:00-22:00" bo\'lishi kerak' })
//   wednesday?: string;

//   @ApiPropertyOptional({ example: '09:00-22:00' })
//   @IsOptional()
//   @IsString()
//   @Matches(TIME_REGEX, { message: 'thursday format: "09:00-22:00" bo\'lishi kerak' })
//   thursday?: string;

//   @ApiPropertyOptional({ example: '09:00-22:00' })
//   @IsOptional()
//   @IsString()
//   @Matches(TIME_REGEX, { message: 'friday format: "09:00-22:00" bo\'lishi kerak' })
//   friday?: string;

//   @ApiPropertyOptional({ example: '09:00-22:00' })
//   @IsOptional()
//   @IsString()
//   @Matches(TIME_REGEX, { message: 'saturday format: "09:00-22:00" bo\'lishi kerak' })
//   saturday?: string;

//   @ApiPropertyOptional({ example: '09:00-22:00' })
//   @IsOptional()
//   @IsString()
//   @Matches(TIME_REGEX, { message: 'sunday format: "09:00-22:00" bo\'lishi kerak' })
//   sunday?: string;
// }

// // import { ApiPropertyOptional } from '@nestjs/swagger';
// // import { IsOptional, IsString } from 'class-validator';

// // export class WorkingHoursDto {
// //   @ApiPropertyOptional({ example: '09:00-22:00' })
// //   @IsOptional()
// //   @IsString()
// //   monday?: string;

// //   @ApiPropertyOptional({ example: '09:00-22:00' })
// //   @IsOptional()
// //   @IsString()
// //   tuesday?: string;

// //   @ApiPropertyOptional({ example: '09:00-22:00' })
// //   @IsOptional()
// //   @IsString()
// //   wednesday?: string;

// //   @ApiPropertyOptional({ example: '09:00-22:00' })
// //   @IsOptional()
// //   @IsString()
// //   thursday?: string;

// //   @ApiPropertyOptional({ example: '09:00-22:00' })
// //   @IsOptional()
// //   @IsString()
// //   friday?: string;

// //   @ApiPropertyOptional({ example: '10:00-23:00' })
// //   @IsOptional()
// //   @IsString()
// //   saturday?: string;

// //   @ApiPropertyOptional({ example: 'yopiq' })
// //   @IsOptional()
// //   @IsString()
// //   sunday?: string;
// // }