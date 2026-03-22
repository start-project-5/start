import {
  CanActivate, ExecutionContext, ForbiddenException,
  Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from '../entity/hotel.entity';
import { UserRole } from 'src/common/enum/user-role.enum';

@Injectable()
export class HotelOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepo: Repository<Hotel>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const hotelId = request.params.id;

    if (user.role === UserRole.SUPERADMIN) return true;

    const hotel = await this.hotelRepo.findOne({
      where: { id: hotelId },
      relations: ['user'],
    });

    if (!hotel) throw new NotFoundException('Mehmonxona topilmadi');

    if (hotel.user.id !== user.id) {
      throw new ForbiddenException("Siz bu mehmonxonani o'chira olmaysiz");
    }

    return true;
  }
}