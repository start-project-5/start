import { IsInt, IsPositive, IsString, Length } from 'class-validator';

/**
 * CreateGuideLanguageDto — adds a language to a guide's profile.
 *
 * Example body:
 *   POST /api/guide-languages
 *   { "guideId": 3, "language": "French" }
 */
export class CreateGuideLanguageDto {
  /**
   * ID of the guide to add the language to.
   * @IsPositive() ensures it's a valid positive integer.
   */
  @IsInt()
  @IsPositive()
  guideId: number;

  /**
   * Name of the language.
   * @Length(2, 50) → handles short codes ("uz") and full names ("Uzbek").
   */
  @IsString()
  @Length(2, 50, { message: 'language name must be between 2 and 50 characters' })
  language: string;
}