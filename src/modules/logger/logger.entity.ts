import { BaseEntity } from 'src/database/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/entity/auth.entity';
import { LogLevel } from 'src/common/enum/logger-level.enum';

@Entity('logs')
export class Log extends BaseEntity {
  @Column({ type: 'enum', enum: LogLevel })
  level: LogLevel;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true })
  context: string;

  @Column({ type: 'text', nullable: true })
  stack: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ nullable: true })
  userId?: string;
}
