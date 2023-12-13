import axios, { AxiosResponse } from "axios";
import { backendApi } from "./commonApi";
import { QueryFunctionContext } from "@tanstack/react-query";
import { IParamterTypeForLogin } from "@/types/typeForAuthentication";

const instance = axios.create({
    baseURL: `${backendApi}/users`,
    withCredentials: true,
});

// 1122
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

export const apiForDeleteUsersForCheckedIds = (checkedIds: number[]): Promise<any> => {
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

