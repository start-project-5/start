import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class FileCleanupInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(async (err) => {
        const request = context.switchToHttp().getRequest();
        const file: Express.Multer.File = request.file;

        if (file?.path) {
          // Multer path ni to'liq saqlaydi — folder ni bilish shart emas
          if (existsSync(file.path)) {
            await unlink(file.path);
          }
        }

        throw err;
      }),
    );
  }
}

// import {
//   Injectable,
//   NestInterceptor,
//   ExecutionContext,
//   CallHandler,
//   BadRequestException,
// } from '@nestjs/common';
// import { Observable, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import * as fs from 'fs';
// import { join } from 'path';

// @Injectable()
// export class FileCleanupInterceptor implements NestInterceptor {
//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     return next.handle().pipe(
//       catchError((err) => {
//         const request = context.switchToHttp().getRequest();
//         const file = request.file;

//         // Agar xato bo'lsa va rasm yuklangan bo'lsa, uni o'chiramiz
//         if (file && file.filename) {
//           const path = join(process.cwd(), 'uploads/restaurant', file.filename);
          
//           if (fs.existsSync(path)) {
//             fs.unlinkSync(path);
//           }
//         }
//         return throwError(() => err);
//       }),
//     );
//   }
// }