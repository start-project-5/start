// // src/modules/auth/guards/roles.guard.ts
// import {
//   CanActivate,
//   ExecutionContext,
//   ForbiddenException,
//   Injectable,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { ROLES_KEY } from '../../../common/decorators/roles.decorator';
// import { User } from '../user/user.entity';
// import { UserRole } from 'src/common/enum/user-role.enum';


// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private readonly reflector: Reflector) {}

//   /** Foydalanuvchi roliga qarab endpointga ruxsat tekshirish */
//   canActivate(context: ExecutionContext): boolean {
//     const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);

//     if (!requiredRoles || requiredRoles.length === 0) return true;

//     const { user }: { user: User } = context.switchToHttp().getRequest();

//     if (!user) {
//       throw new ForbiddenException('Foydalanuvchi aniqlanmadi');
//     }

//     const hasRole = requiredRoles.includes(user.role);
//     if (!hasRole) {
//       throw new ForbiddenException(
//         `Bu amalni bajarish uchun ${requiredRoles.join(' yoki ')} roli kerak`,
//       );
//     }

//     return true;
//   }
// }