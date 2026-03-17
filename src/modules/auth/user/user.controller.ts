// src/modules/auth/user/user.controller.ts
import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enum/user-role.enum';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
// import { UpdateUserDto } from './dto/update-users.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ─────────────────────────────────────────────────────────────
  /** Barcha userlarni olish — faqat ADMIN */
  // ─────────────────────────────────────────────────────────────
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Barcha foydalanuvchilar (ADMIN)' })
  findAll() {
    return this.userService.findAll();
  }

  // ─────────────────────────────────────────────────────────────
  /** O'zining profilini ko'rish — barcha login qilganlar */
  // ─────────────────────────────────────────────────────────────
  @Get('me')
  @ApiOperation({ summary: 'Mening profilim' })
  getMe(@CurrentUser() user: User) {
    return user;
  }

  // ─────────────────────────────────────────────────────────────
  /** ID bo'yicha user olish — faqat ADMIN */
  // ─────────────────────────────────────────────────────────────
  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ID bo\'yicha foydalanuvchi (ADMIN)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  // ─────────────────────────────────────────────────────────────
  /** O'z profilini yangilash */
  // ─────────────────────────────────────────────────────────────
  @Patch('me')
  @ApiOperation({ summary: 'Profilni yangilash' })
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.userService.updateById(user.id, dto);
  }

  // ─────────────────────────────────────────────────────────────
  /** Userni bloklash — faqat ADMIN */
  // ─────────────────────────────────────────────────────────────
  @Patch(':id/block')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Userni bloklash (ADMIN)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  blockUser(@Param('id') id: string) {
    return this.userService.updateById(id, { isActive: false });
  }

  // ─────────────────────────────────────────────────────────────
  /** Userni faollashtirish — faqat ADMIN */
  // ─────────────────────────────────────────────────────────────
  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Userni faollashtirish (ADMIN)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  activateUser(@Param('id') id: string) {
    return this.userService.updateById(id, { isActive: true });
  }

  // ─────────────────────────────────────────────────────────────
  /** GUIDE/BUSINESS_OWNER ni tasdiqlash — faqat ADMIN */
  // ─────────────────────────────────────────────────────────────
  @Patch(':id/approve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Guide/Business owner tasdiqlash (ADMIN)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  approveUser(@Param('id') id: string) {
    return this.userService.updateById(id, { isApprovedByAdmin: true });
  }

  // ─────────────────────────────────────────────────────────────
  /** Userni o'chirish — faqat ADMIN */
  // ─────────────────────────────────────────────────────────────
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Userni o\'chirish (ADMIN)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  remove(@Param('id') id: string) {
    return this.userService.removeById(id);
  }
}