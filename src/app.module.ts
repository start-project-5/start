import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/db-config';

/**
 * AppModule — the root module of the application.
 *
 * It does three things:
 *   1. Loads environment variables from .env (ConfigModule)
 *   2. Connects to PostgreSQL (TypeOrmModule)
 *   3. Registers all feature modules
 */
@Module({
  imports: [
    // 1. Make .env values available everywhere via ConfigService
    ConfigModule.forRoot({
      isGlobal: true,   // no need to import ConfigModule again in other modules
      envFilePath: '.env',
    }),

    // 2. Connect to the database using our DatabaseConfig class
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),

    // 3. Feature modules
    // UsersModule,
  ],
})
export class AppModule {}