import { randomInt } from 'crypto';

/**
 * kod yaratdai 6 honali.
 */
export function generateOtp(): string {
  // 100000 - 999999
  return randomInt(100_000, 1_000_000).toString();
}

/** otp amal qilish vaqti*/
export const OTP_EXPIRES_MS = 5 * 60 * 1000;

/**
 * OTP muddati o'tganligini tekshirish.
 */
export function isOtpExpired(otpCreatedAt: Date): boolean {
  const diff = Date.now() - new Date(otpCreatedAt).getTime();
  return diff > OTP_EXPIRES_MS;
}