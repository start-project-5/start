import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class CreateTransportDto {
  @IsString()
  @Length(2, 150)
  name: string;

  /**
   * Category of this hub.
   * @IsIn validates the value is one of the allowed strings.
   */
  @IsIn(['airport', 'train_station', 'bus_station'], {
    message: 'type must be: airport, train_station, or bus_station',
  })
  type: string;

  @IsString()
  photo: string;

  @IsString()
  @Length(5, 255)
  address: string;

  @IsOptional()
  @IsString()
  @Length(5, 30)
  phone?: string;
}

