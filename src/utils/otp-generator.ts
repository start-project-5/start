import { randomInt } from 'crypto';

/**
 * Generates a cryptographically random 6-digit OTP string.
 */
export function generateOtp(): string {
  // randomInt(min, max) — max is exclusive, so 100000–999999 covers all 6-digit codes
  return randomInt(100_000, 1_000_000).toString();
}

/** OTP expiry in milliseconds — 4 minutes */
export const OTP_EXPIRES_MS = 5 * 60 * 1000;

export function isOtpExpired(otpCreatedAt: Date): boolean {
  return Date.now() - new Date(otpCreatedAt).getTime() > OTP_EXPIRES_MS;
}