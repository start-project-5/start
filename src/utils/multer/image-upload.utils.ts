import { extname } from 'path';

import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { ALLOWED_MIME_TYPES } from 'src/common/constants/file.constants';

export const createStorage = (folder: string) =>
  diskStorage({
    destination: (_req, _file, cb) => {
      const uploadPath = `./uploads/${folder}`;
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: editFileName,
  });

export const imageFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: any,
) => {
  if (!ALLOWED_MIME_TYPES.test(file.mimetype)) {
    return cb(
      new BadRequestException(
        'Faqat jpg/jpeg/png/webp formatdagi rasmlar qabul qilinadi',
      ),
      false,
    );
  }
  cb(null, true);
};

export const editFileName = (
  req: any,
  file: Express.Multer.File,
  callback: any,
) => {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  callback(null, `${unique}${extname(file.originalname)}`);
};
