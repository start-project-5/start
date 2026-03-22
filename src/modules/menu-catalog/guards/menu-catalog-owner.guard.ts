import {
  CanActivate, ExecutionContext, ForbiddenException,
  Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from 'src/common/enum/user-role.enum';
import { MenuCatalog } from '../entities/menu-catalog.entity';

@Injectable()
export class MenuCatalogOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(MenuCatalog)
    private readonly repo: Repository<MenuCatalog>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const id = request.params.id;

    if (user.role === UserRole.SUPERADMIN) return true;

    const item = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!item) throw new NotFoundException('Taom topilmadi');

    if (item.user.id !== user.id) {
      throw new ForbiddenException("Siz bu taomni o'zgartira olmaysiz");
    }

    return true;
  }
}