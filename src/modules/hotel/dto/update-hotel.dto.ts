import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateHotelDto } from "./hotel.dto";
import { IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class UpdateHotelDto extends PartialType(CreateHotelDto) {
    @ApiPropertyOptional({ example: 'Yangi restoran nomi' })
      @IsOptional()
      @IsString()
      @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return undefined;
        return value;
      })
      name?: string;
}