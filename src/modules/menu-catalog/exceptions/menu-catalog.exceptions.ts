import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

export class MenuCatalogAlreadyExistsException extends ConflictException {
  constructor(name: string) {
    super(`"${name}" nomli taom katalogda allaqachon mavjud`);
  }
}

export class MenuCatalogNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Taom topilmadi: ${id}`);
  }
}

export class InvalidImageException extends BadRequestException {
  constructor() {
    super("Rasm formati noto'g'ri yoki hajmi katta");
  }
}