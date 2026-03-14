import { PartialType } from "@nestjs/swagger";
import { CreateHotelDto } from "./hotel.dto";

export class UpdateHotelDto extends PartialType(CreateHotelDto) {}