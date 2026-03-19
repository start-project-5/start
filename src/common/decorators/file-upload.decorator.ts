import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  createStorage,
  imageFileFilter,
} from 'src/utils/multer/image-upload.utils';
import { MAX_FILE_SIZE } from '../constants/file.constants';

export function UseFileUpload(fieldName: string = 'file', folder: string = 'others') {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: createStorage(folder),
        fileFilter: imageFileFilter,
        limits: { fileSize: MAX_FILE_SIZE },
      }),
    ),
  );
}

// import { applyDecorators, UseInterceptors } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { diskStorage } from 'multer';
// import { editFileName } from 'src/utils/file-upload.utils';


// export function UseFileUpload(fieldName: string = 'file') {
//   return applyDecorators(
//     UseInterceptors(
//       FileInterceptor(fieldName, {
//         storage: diskStorage({
//           destination: './uploads',
//           filename: editFileName,
//         }),
//         // fileFilter: (_req, file, cb) => {

//         // },
//       }),
//     ),
//     // Bu yerda ApiBody bo'lmasligi kerak!
//   );
// }
