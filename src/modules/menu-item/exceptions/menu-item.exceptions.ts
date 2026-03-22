import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

export class RestaurantMenuItemAlreadyExistsException extends ConflictException {
  constructor() {
    super('Bu taom restoran menyusida allaqachon mavjud');
  }
}

export class RestaurantMenuItemNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Restoran menyu elementi topilmadi: ${id}`);
  }
}

export class InvalidImageException extends BadRequestException {
  constructor() {
    super("Rasm formati noto'g'ri yoki hajmi katta");
  }
}