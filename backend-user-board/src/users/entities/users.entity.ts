import { Max, Min } from "class-validator";
import { GendersEnum, RolesEnum } from "../enums/roles.enum";
import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(["email", "nickname"])
export class UsersModel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column({ default: "noname" })
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

    @Column({ type: "int", nullable: true, default: 1 })
    @Min(1)
    @Max(10)
    backEndLevel: number | null;

    @Column({ type: "int", nullable: true, default: 1 })
    @Min(1)
    @Max(10)
    frontEndLevel: number | null;
}
