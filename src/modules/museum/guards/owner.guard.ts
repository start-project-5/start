import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from 'src/common/enum/user-role.enum';
import { Museum } from '../entity/museum.entity';

@Injectable()
export class MuseumOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(Museum)
    private readonly museumRepo: Repository<Museum>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const museumId = request.params.id;

    // Superadmin hamma narsani qila oladi
    if (user.role === UserRole.SUPERADMIN) return true;

    const museum = await this.museumRepo.findOne({
      where: { id: museumId },
      relations: ['user'],
    });

    if (!museum) throw new NotFoundException('Muzey topilmadi');

    if (museum.user.id !== user.id) {
      throw new ForbiddenException("Siz bu muzeyny o'zgartira olmaysiz");
    }

    return true;
  }
}

// import {
//   CanActivate, ExecutionContext, ForbiddenException,
//   Injectable, NotFoundException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { UserRole } from 'src/common/enum/user-role.enum';
// import { Museum } from '../entity/museum.entity';

// @Injectable()
// export class MuseumOwnerGuard implements CanActivate {
//   constructor(
//     @InjectRepository(Museum)
//     private readonly museumRepo: Repository<Museum>,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const user = request.user;
//     const museumId = request.params.id;

//     if (user.role === UserRole.SUPERADMIN) return true;

//     const museum = await this.museumRepo.findOne({
//       where: { id: museumId },
//       relations: ['user'],
//     });

//     if (!museum) throw new NotFoundException('Muzey topilmadi');

//     if (museum.user.id !== user.id) {
//       throw new ForbiddenException("Siz bu muzeyny o'zgartira olmaysiz");
//     }

//     return true;
//   }
// }