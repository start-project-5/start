import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enum/user-role.enum';

export const MIN_ROLE_KEY = 'minRole';

/**
 * @MinRole(UserRole.ADMIN)
 *
 * Allows access to any user whose role value is >= the required level.
 * Example: MinRole(UserRole.GUIDE) → GUIDE(2), ADMIN(3), SUPERADMIN(4) all pass.
 */
export const MinRole = (role: UserRole) => SetMetadata(MIN_ROLE_KEY, role);