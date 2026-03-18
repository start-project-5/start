import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { EventStatus } from "src/common/enum/eventSatatus.enum";

export class UpdateEventStatusDto {
  @ApiProperty({ enum: EventStatus })
  @IsEnum(EventStatus)
  status: EventStatus;
}