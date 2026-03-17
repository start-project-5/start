// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { JwtPayload } from '../auth.service';
import { User } from '../user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  /** JWT payload dan foydalanuvchini tekshirib qaytarish */
  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Token egasi topilmadi');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Hisob bloklangan');
    }

    return user; // req.user ga o'rnatiladi
  }
}