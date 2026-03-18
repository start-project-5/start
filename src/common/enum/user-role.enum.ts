/**
 * UserRole — access level of a registered account.
 *
 * TOURIST  → regular user; can browse, book, and leave reviews
 * GUIDE    → local guide; can manage their own profile and bookings
 * ADMIN    → platform administrator; full access
 */
export enum UserRole {
  // obichnioy user
  TOURIST = 0,

  // hotel, restaran, event qo'shib bilado'n odam
  BUSINESS_OWNER = 1,

  // gid
  GUIDE = 2,

  // admin
  ADMIN = 3,

  // superadmin
  SUPERADMIN = 4,
}
