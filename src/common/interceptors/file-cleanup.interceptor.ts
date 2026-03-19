import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class FileCleanupInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        const request = context.switchToHttp().getRequest();
        const file = request.file;

        // Agar xato bo'lsa va rasm yuklangan bo'lsa, uni o'chiramiz
        if (file && file.filename) {
          const path = join(process.cwd(), 'uploads/restaurant', file.filename);
          
          if (fs.existsSync(path)) {
            fs.unlinkSync(path);
          }
        }
        return throwError(() => err);
      }),
    );
  }
}