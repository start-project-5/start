import { ConflictException, NotFoundException,
         BadRequestException } from '@nestjs/common';

// 409 — allaqachon mavjud
export class RestaurantAlreadyExistsException
  extends ConflictException {
  constructor(name: string) {
    super(`"${name}" nomli restoran allaqachon mavjud`);
  }
}

// 404 — topilmadi
export class RestaurantNotFoundException
  extends NotFoundException {
  constructor(id: string) {
    super(`Restoran topilmadi: ${id}`);
  }
}

// 400 — noto'g'ri rasm
export class InvalidImageException
  extends BadRequestException {
  constructor() {
    super("Rasm formati noto'g'ri yoki hajmi katta");
  }
}