import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../entity/restaurant.entity';
import { UserRole } from 'src/common/enum/user-role.enum';

@Injectable()
export class RestaurantOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const restaurantId = request.params.id; // ← string, + yo'q

    // Superadmin hamma narsani o'chira oladi
    if (user.role === UserRole.SUPERADMIN) {
      return true;
    }

    const restaurant = await this.restaurantRepo.findOne({
      where: { id: restaurantId },
      relations: ['user'],
    });

    if (!restaurant) {
      throw new NotFoundException('Restoran topilmadi');
    }

    if (restaurant.user.id !== user.id) {
      throw new ForbiddenException('Siz bu restoranni o\'chira olmaysiz');
    }

    return true;
  }
}