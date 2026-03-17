// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from './user/user.service';
import { JwtStrategy } from './strategies/jwt.strategy';
// import { JwtAuthGuard } from './guards/jwt-auth.guard';
// import { RolesGuard } from './guards/roles.guard';
import { User } from './user/user.entity';
import { EmailSender } from '../../utils/email-sender';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UserController } from './user/user.controller';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User]),

    // JwtModule async konfiguratsiya — ConfigService orqali
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_EXPIRES', '15m') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController, UserController],
  providers: [
    AuthService,
    UserService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    EmailSender,
  ],
  exports: [
    AuthService,
    UserService,
    JwtAuthGuard,
    RolesGuard,
    JwtModule,
  ],
})
export class AuthModule {}