// User 인터페이스 정의
interface User {
    id: number;
    email: string;
    nickname: string;
    role: string;
    gender: string;
    phoneNumber: string;
    // 다른 필드들도 있을 수 있음
}

// 응답 데이터의 타입 정의
interface ITypeForUserBoard {
    users: User[];
    totalCount: number;
    perPage: number;
}

