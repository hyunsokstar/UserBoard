import { GendersEnum, RolesEnum } from "../enums/roles.enum";
import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(["email", "nickname"]) // 이 부분을 추가합니다.
export class UsersModel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column()
    nickname: string;

    @Column({
        type: "enum",
        enum: RolesEnum,
        default: RolesEnum.FRONTEND,
    })
    role: RolesEnum;

    @Column({
        type: "enum",
        enum: GendersEnum,
        default: GendersEnum.MAN
    })
    gender: GendersEnum;

    @Column({ nullable: true })
    phoneNumber: string;
}
