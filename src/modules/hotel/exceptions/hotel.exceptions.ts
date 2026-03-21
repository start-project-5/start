import { ConflictException, NotFoundException,
         BadRequestException } from '@nestjs/common';

// 409 — allaqachon mavjud
export class HotelAlreadyExistsException
  extends ConflictException {
  constructor(name: string) {
    super(`"${name}" nomli mehmonxona allaqachon mavjud`);
  }
}

// 404 — topilmadi
export class HotelNotFoundException
  extends NotFoundException {
  constructor(id: string) {
    super(`Mehmonxona topilmadi: ${id}`);
  }
}

// 400 — noto'g'ri rasm
export class InvalidImageException
  extends BadRequestException {
  constructor() {
    super("Rasm formati noto'g'ri yoki hajmi katta");
  }
}

export class HotelHasNoImageException extends BadRequestException {
  constructor() {
    super('Mehmonxonada rasm mavjud emas');
  }
}