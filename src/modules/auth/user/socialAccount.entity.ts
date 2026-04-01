import { Column, Entity, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { BaseEntity } from "src/database/base.entity";

@Entity({name: "socialAccount"})
export class SocialAccount extends BaseEntity {
    @Column({nullable: true})
    provider: string;

    @Column({nullable: true})
    externalId: string;

    @ManyToOne(() => User, (auth) => auth.socialAccounts, { onDelete: "CASCADE" })
    auth: User
}