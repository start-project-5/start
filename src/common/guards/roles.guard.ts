import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserRole } from '../enum/user-role.enum';
import { MIN_ROLE_KEY } from '../decorators/min-role.decorator';

/**
 * HierarchicalRolesGuard
 *
 * Instead of checking exact role equality, compares numeric weights:
 *   user.role >= requiredRole
 *
 * Benefits:
 *   - Adding a new role never requires touching controllers
 *   - SUPERADMIN (4) automatically passes every check
 *   - One decorator @MinRole(UserRole.ADMIN) instead of
 *     @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
 *
 * Usage in controller:
 *   @MinRole(UserRole.ADMIN)   → ADMIN + SUPERADMIN
 *   @MinRole(UserRole.GUIDE)   → GUIDE + ADMIN + SUPERADMIN
 *   @MinRole(UserRole.TOURIST) → everyone authenticated
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // @Public() skips all auth checks
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Get minimum required role from @MinRole() decorator
    const requiredRole = this.reflector.getAllAndOverride<UserRole>(MIN_ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @MinRole() = any authenticated user can access
    if (requiredRole === undefined || requiredRole === null) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    // The magic: numeric comparison instead of equality check
    return user.role >= requiredRole;
  }
}