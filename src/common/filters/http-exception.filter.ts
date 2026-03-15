import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from 'src/modules/logger/logger.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorBody =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as Record<string, any>);

    const payload = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
      ...errorBody,
    };

    this.logger.error(
      `${req.method} ${req.url} → ${status}`,
      JSON.stringify(errorBody),
      'HttpExceptionFilter',
    );

    res.status(status).json(payload);
  }
}
