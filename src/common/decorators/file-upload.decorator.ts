import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName } from 'src/utils/file-upload.utils';


export function UseFileUpload(fieldName: string = 'file') {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: diskStorage({
          destination: './uploads',
          filename: editFileName,
        }),
      }),
    ),
    // Bu yerda ApiBody bo'lmasligi kerak!
  );
}
