import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ArrayNotEmpty,
  Length,
  IsInt,
  Max,
} from 'class-validator';
import { WeekDay } from 'src/common/enum/weekends.enum';

export class CreateGuideDto {
  @ApiProperty({ example: 'Qudrat', description: 'Gidning toʻliq ismi' })
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @ApiProperty({ example: '1995-05-15', description: 'Tugʻilgan sanasi' })
  @IsDate()
  @Type(() => Date)
  birthDate: Date;
  
  @ApiPropertyOptional({ example: 5, description: 'Tajriba yillari', default: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  yearsOfExperience: number;
  
  @ApiPropertyOptional({ 
    example: 'Professional tarixchi va madaniyatshunos...', 
    description: 'Gid haqida batafsil maʼlumot' 
  })
  @IsString()
  @IsNotEmpty()
  bio: string;
  
  @ApiProperty({ 
    example: ['Uzbek', 'English', 'Russian'], 
    description: 'Gaplasha oladigan tillari' 
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true }) // Massiv ichidagi har bir element string ekanligini tekshiradi
  languages: string[];
  
  @ApiPropertyOptional({ example: 250000.00, description: 'Bir kunlik xizmat haqi' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  dailyRate: number;
  
  // @ApiPropertyOptional({ 
  //   example: 'https://example.com/photos/guide1.jpg', 
  //   description: 'Profil rasmi URL' 
  // })
  // @IsOptional()
  // @IsUrl()
  // photo?: string;
  
  @ApiProperty({ 
    enum: WeekDay, 
    isArray: true,
    example: [WeekDay.MONDAY, WeekDay.WEDNESDAY, WeekDay.FRIDAY],
    description: 'Ish kunlari'
  })
  @IsArray()
  @IsEnum(WeekDay, { each: true })
  availableDays: WeekDay[];
  
  @ApiPropertyOptional({ default: true, description: 'Gid faolmi?' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// import {
//   IsArray,
//   IsInt,
//   IsNumber,
//   IsOptional,
//   IsString,
//   Length,
//   Max,
//   Min,
//   ArrayNotEmpty,
//   ArrayUnique,
// } from 'class-validator';

/**
 * CreateGuideDto — payload for creating a new guide profile.
*/
// export class CreateGuideDto {
  //   @IsString()
  //   @Length(2, 100, { message: 'name must be between 2 and 100 characters' })
  //   name: string;
  
  //   /**
  //    * Guide's age — must be a reasonable working age.
//    */
//   @IsInt({ message: 'age must be an integer' })
//   @Min(18, { message: 'guide must be at least 18 years old' })
//   @Max(80, { message: 'age cannot exceed 80' })
//   age: number;

//   /**
//    * Years of professional guiding experience.
//    * Min 0 allows newly started guides.
//    */
//   @IsInt()
//   @Min(0)
//   yearsOfExperience: number;

//   @IsString()
//   @Length(20, 2000, { message: 'bio must be between 20 and 2000 characters' })
//   bio: string;

//   /** Optional URL for the guide's profile photo */
//   @IsOptional()
//   @IsString()
//   photo?: string;

//   /**
//    * Days the guide is available, e.g. ["monday", "friday"]
//    * @ArrayNotEmpty() → at least one day must be provided
//    * @ArrayUnique()   → no duplicate day names
//    * @IsString({ each: true }) → every item in the array must be a string
//    */
//   @IsArray()
//   @ArrayNotEmpty({ message: 'availableDays must have at least one day' })
//   @ArrayUnique({ message: 'availableDays must not contain duplicate days' })
//   @IsString({ each: true })
//   availableDays: string[];
// }

/**
 * UpdateGuideDto — payload for partial update of a guide profile.
 * All fields are optional.
 */
export class UpdateGuideDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(80)
  age?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  yearsOfExperience?: number;

  @IsOptional()
  @IsString()
  @Length(20, 2000)
  bio?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  languages: string[];

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  availableDays?: string[];
}
