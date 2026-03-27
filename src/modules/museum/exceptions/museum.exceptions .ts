import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

export class MuseumAlreadyExistsException extends ConflictException {
  constructor(name: string) {
    super(`"${name}" nomli muzey allaqachon mavjud`);
  }
}

export class MuseumNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Muzey topilmadi: ${id}`);
  }
}

export class ExhibitNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Eksponat topilmadi: ${id}`);
  }
}

export class GalleryNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Galereya rasmi topilmadi: ${id}`);
  }
}

export class ReviewNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Review topilmadi: ${id}`);
  }
}

export class ReviewAlreadyExistsException extends ConflictException {
  constructor() {
    super('Siz bu muzeyga allaqachon review yozgansiz');
  }
}

export class InvalidImageException extends BadRequestException {
  constructor() {
    super("Rasm formati noto'g'ri yoki hajmi katta (max 5MB, faqat jpg/png/webp)");
  }
}

// import {
//   BadRequestException,
//   ConflictException,
//   NotFoundException,
// } from '@nestjs/common';

// export class MuseumAlreadyExistsException extends ConflictException {
//   constructor(name: string) {
//     super(`"${name}" nomli muzey allaqachon mavjud`);
//   }
// }

// export class MuseumNotFoundException extends NotFoundException {
//   constructor(id: string) {
//     super(`Muzey topilmadi: ${id}`);
//   }
// }

// export class ExhibitNotFoundException extends NotFoundException {
//   constructor(id: string) {
//     super(`Eksponat topilmadi: ${id}`);
//   }
// }

// export class GalleryNotFoundException extends NotFoundException {
//   constructor(id: string) {
//     super(`Galereya rasmi topilmadi: ${id}`);
//   }
// }

// export class ReviewNotFoundException extends NotFoundException {
//   constructor(id: string) {
//     super(`Review topilmadi: ${id}`);
//   }
// }

// export class ReviewAlreadyExistsException extends ConflictException {
//   constructor() {
//     super('Siz bu muzeyga allaqachon review yozgansiz');
//   }
// }

// export class InvalidImageException extends BadRequestException {
//   constructor() {
//     super("Rasm formati noto'g'ri yoki hajmi katta (max 5MB, faqat jpg/png/webp)");
//   }
// }