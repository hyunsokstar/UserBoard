// User 인터페이스 정의
interface User {
    id: number;
    email: string;
    nickname: string;
    role: string;
    gender: string;
    phoneNumber: string;
    frontEndLevel: number;
    backEndLevel: number;
}

// 응답 데이터의 타입 정의
interface ITypeForUserBoard {
    users: User[];
    totalCount: number;
    perPage: number;
}

export type ITypeForResponseDataForGetAllUsers = {
    users: User[];
    totalCount: number;
    perPage: number;
};

export type Direction = 'ltr' | 'rtl';

export type Row = {
    id: number;
    email: string;
    nickname: string;
    role: string;
    gender: string;
    frontEndLevel: number;
    backEndLevel: number;
    phoneNumber: string | null;
};
