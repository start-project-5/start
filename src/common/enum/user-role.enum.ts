/**
 * UserRole — access level of a registered account.
 *
 * TOURIST  → regular user; can browse, book, and leave reviews
 * GUIDE    → local guide; can manage their own profile and bookings
 * ADMIN    → platform administrator; full access
 */
export enum UserRole {
  // obichnioy user
  TOURIST = 'tourist',

  // hotel, restaran, event qo'shib bilado'n odam
  BUSINESS_OWNER = 'business_owner',

  // gid
  GUIDE = 'guide',

  // admin
  ADMIN = 'admin',

  // superadmin
  SUPERADMIN = 'superadmin',
}
