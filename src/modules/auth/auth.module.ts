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
import { UserController } from './user/user.controller';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { SocialAccount } from './user/socialAccount.entity';
import { ProfileModule } from '../profile/profile.module';
import { GoogleStrategy } from './google-strategy';
import { UserGoogleModule } from './user_google/user_google.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User, SocialAccount]),

    // JwtModule async konfiguratsiya — ConfigService orqali
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_EXPIRES', '1d') as any,
        },
      }),
    }),
    UserGoogleModule,
    ProfileModule,
  ],
  controllers: [AuthController, UserController],
  providers: [
    AuthService,
    UserService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    EmailSender,
    JwtStrategy,
    GoogleStrategy,
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