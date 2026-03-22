import {
  CanActivate, ExecutionContext, ForbiddenException,
  Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from 'src/common/enum/user-role.enum';
import { RestaurantMenuItem } from '../entities/menu-item.entity';

@Injectable()
export class RestaurantMenuOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(RestaurantMenuItem)
    private readonly repo: Repository<RestaurantMenuItem>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const id = request.params.id;

    if (user.role === UserRole.SUPERADMIN) return true;

    const item = await this.repo.findOne({
      where: { id },
      relations: ['restaurant', 'restaurant.user'],
    });

    if (!item) throw new NotFoundException('Menyu elementi topilmadi');

    if (item.restaurant.user.id !== user.id) {
      throw new ForbiddenException("Siz bu elementni o'zgartira olmaysiz");
    }

    return true;
  }
}