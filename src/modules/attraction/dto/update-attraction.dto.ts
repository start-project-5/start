import { PartialType } from '@nestjs/swagger';
import { CreateAttractionDto } from './attraction.dto';

export class UpdateAttractionDto extends PartialType(CreateAttractionDto) {}
