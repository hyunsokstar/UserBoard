// createUser.dto.ts
import { IsEmail, IsEnum, IsPhoneNumber, IsString, Matches } from 'class-validator';
import { GendersEnum, RolesEnum } from "../enums/roles.enum";

export class DtoForUserList {
    @IsEmail()
    email: string;

    @IsString()
    nickname: string;

    @IsEnum(RolesEnum)
    role: RolesEnum;

    @Matches(/^010-\d{4}-\d{4}$/, { message: '휴대폰 번호 형식을 지켜주세요.' })
    phoneNumber: string;
}
