/**
 * BookingStatus — lifecycle states of a tourist's guide booking.
 *
 * Flow:
 *   PENDING → CONFIRMED  (guide accepts)
 *   PENDING → CANCELLED  (tourist or guide cancels)
 *   CONFIRMED → CANCELLED
 */

export enum BookingStatus {
  /** Booking was just created; waiting for guide confirmation */
  PENDING = 'pending',

  /** Guide has accepted the booking */
  CONFIRMED = 'confirmed',

  /** Booking was cancelled by tourist or guide */
  CANCELLED = 'cancelled',

  /** Booking was completed */
  COMPLETED = 'completed',
}