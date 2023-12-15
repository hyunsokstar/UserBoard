import axios, { AxiosResponse } from "axios";
import { backendApi } from "./commonApi";
import { QueryFunctionContext } from "@tanstack/react-query";
import { IParamterTypeForLogin } from "@/types/typeForAuthentication";
import { IUser } from "@/types/typeForUserBoard";

const instance = axios.create({
    baseURL: `${backendApi}/users`,
    withCredentials: true,
});

// 1122
export const apiForSaveOrUpdateUserInfoForChecked = async (data: IUser[]) => {
    try {
        const response = await instance.put('/', data); // 여기서 data를 PUT 요청으로 보냄
        return response.data; // 응답 데이터를 반환하거나 필요에 따라 다른 처리를 수행할 수 있음
    } catch (error) {
        // 에러 처리
        console.error('Error updating users:', error);
        throw error; // 에러를 호출한 쪽으로 다시 던짐
    }
}


export const apiForLoginCheckWithRefreshToken = async (refreshToken: string) => {
    console.log("login check by refresh token at front");

    const headers = {
        Authorization: `Bearer ${refreshToken}`
    };

    try {
        const response = await instance.post("login-check-by-refreshToken", {}, { headers });
        console.log("response.data : ", response.data);
        return response.data;
    } catch (error) {
        // throw new Error("error when login check by refresh token: " + error);
        console.log("error : ", error);
        // return error
    }
};

export const apiForLoginCheckWithAccessToken = async (accessToken: string) => {
    const headers = {
        Authorization: `Bearer ${accessToken}`
    };

    try {
        const response = await instance.post("login-check-by-accessToken", {}, { headers });
        console.log("response.data : ", response.data);
        return response.data;
    } catch (error) {
        // throw new Error('Failed to perform login check');
        return error
    }
};


export const apiForLogin = async ({ email, password }: IParamterTypeForLogin): Promise<any> => {
    try {
        const response = await instance.post(
            'login', // 이렇게 실제 로그인 엔드포인트에 맞게 경로를 지정해야 합니다.
            {
                email,
                password,
            }
        );
        return response.data;
    } catch (error) {
        throw error; // 에러를 던져서 처리할 수 있도록 합니다.
    }
};


export const apiForAddUser = ({
    email,
    nickname,
    password
}: any) => {

    console.log("email : ", email);
    console.log("nickname : ", nickname);
    console.log("password : ", password);

    return instance.post(
        '',
        {
            email,
            nickname,
            password
        }
    ).then((response: any) => response.data)
}

export const apiForGetAllUsers = ({
    queryKey,
}: QueryFunctionContext) => {
    const [_, pageNum] = queryKey;

    return instance
        .get(``, {
            params: { pageNum: pageNum },
        })
        .then((response) => {

            return response.data;
        });
};

export const apiForDeleteUsersForCheckedIds = (checkedIds: any[]): Promise<any> => {
    console.log('Checked IDs (row delete api ):', checkedIds); // checkedIds 로그 출력

    // 요청을 보내는 부분
    return instance.delete(``, { data: { checkedIds } })
        .then((response) => {
            // 성공 시 처리
            return response.data;
        })
        .catch((error) => {
            // 에러 처리
            throw error; // 에러를 그대로 던지기
        });
};


