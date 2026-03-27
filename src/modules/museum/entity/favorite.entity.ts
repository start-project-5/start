import { Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { Museum } from './museum.entity';
import { User } from 'src/modules/auth/user/user.entity';

@Entity('museum_favorites')
@Unique(['user', 'museum']) // bir user bir muzeygna bir marta qo'sha oladi
export class Favorite extends BaseEntity {
  @ManyToOne(() => Museum, (museum) => museum.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'museum_id' })
  museum: Museum;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
