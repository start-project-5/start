import { IsInt, IsPositive, IsString, Length, Max, Min } from 'class-validator';

/**
 * CreateReviewDto — data required to post a review for a guide.
 *
 * Note: in a real app with JWT auth, userId would come from the
 * JWT token (req.user.id), not from the request body.
 * For simplicity at this stage it is included in the body.
 */
export class CreateReviewDto {
  /** Score from 1 (worst) to 5 (best) */
  @IsInt()
  @Min(1, { message: 'rating must be at least 1' })
  @Max(5, { message: 'rating cannot exceed 5' })
  rating: number;

  @IsString()
  @Length(5, 1000, { message: 'comment must be between 5 and 1000 characters' })
  comment: string;

  /** The guide being reviewed */
  @IsInt()
  @IsPositive()
  guideId: number;

  /** The tourist writing the review */
  @IsInt()
  @IsPositive()
  userId: number;
}