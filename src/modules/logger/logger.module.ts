import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from './logger.entity';
import { PostgresTransport } from './postgres-transport';
import { LoggerService } from './logger.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Log]),
    WinstonModule.forRootAsync({
      useFactory: (dataSource: DataSource) => ({
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
              winston.format.colorize(),
              winston.format.printf(
                ({ level, message, timestamp, context }) => {
                  return `[${timestamp}] ${level} [${
                    context || 'App'
                  }]: ${message}`;
                },
              ),
            ),
          }),
          new PostgresTransport(dataSource),
        ],
      }),
      inject: [DataSource],
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService, TypeOrmModule],
})
export class LoggerModule {}
