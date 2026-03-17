// src/modules/auth/dto/sign-up.dto.ts

/**
 * SignUpDto — CreateUserDto bilan bir xil strukturada.
 * AuthController da CreateUserDto ishlatiladi (mavjud DTO saqlanadi).
 * Bu fayl re-export sifatida turadi — kelajakda kengaytirish uchun.
 */
export { CreateUserDto as SignUpDto } from '../user/dto/user.dto';