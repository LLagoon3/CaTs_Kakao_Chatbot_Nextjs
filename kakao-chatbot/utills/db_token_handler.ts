import axios, { AxiosResponse } from 'axios';
import LocalStorge from './local_storge';
import TokenResponse from '../interface/token';

// import * as path from 'path';

// const apiUrl: string = process.env.NEXT_PUBLIC_BASE_API_URL as string;
// const adminData: string = JSON.parse(process.env.NEXT_PUBLIC_ADMIN_DATA as string);

const localStorge = new LocalStorge(__dirname);

// 테스트 데이터
const apiUrl: string = 'http://0.0.0.0:8000';
const adminData: object = {
                'username': 'cats',
	            'password': 'cats1234'
            }


export default class TokenHandler{
    public static apiLoginTokenUrl: string = `${apiUrl}/api/token/login/`;
    public static apiRefreshTokenUrl: string = `${apiUrl}/api/token/refresh/`;
    public static apiVerifyTokenUrl: string = `${apiUrl}/api/token/verify/`;

    // login 토큰 발급
    static async getLoginToken(): Promise<TokenResponse | null>{
        try {
            // login 토큰 가져오기
            const response: AxiosResponse<TokenResponse> = await axios.post(TokenHandler.apiLoginTokenUrl, adminData);
            console.log(response.status);
            // 로컬에 토큰 저장
            localStorge.setItem(response.data);
            return response.data;
        } catch (error) {
            console.error('[Token] getLoginToken :', error);
            return null;
        }
    }

    // refresh 토큰 재발급
    static async getRefreshToken(loginToken: string): Promise<TokenResponse | null>{
        try {
            // refresh 토큰 가져오기
            const body: object = {
                'body': loginToken
            };
            const response: AxiosResponse<TokenResponse> = await axios.post(TokenHandler.apiLoginTokenUrl, body);
            const newTokenItem: TokenResponse = {
                'access': loginToken,
                'refresh': response.data.refresh
            };

            // 로컬에 토큰 저장
            localStorge.setItem(newTokenItem);
            return newTokenItem;
        }
        catch (error) {
            console.error('[Token] getRefreshToken :', error);
            return null;
        }
    }

    // 토큰 유효성 검증
    static async verifyToken(token: string): Promise<boolean>{
        try {
            const response: AxiosResponse<TokenResponse> = await axios.post(TokenHandler.apiVerifyTokenUrl, { 'token': token });
            if (response.status === 200) return true;
        } catch (error) {
            // console.error(error);
        }
        return false;
    }

    // 토큰 가져오기
    static async getToken(): Promise<string | void> {
        let token: TokenResponse | null = localStorge.getItem() as TokenResponse;
        // 저장된 토큰 없거나 토큰 만료 시 login 토큰 발급
        if (!token || !await TokenHandler.verifyToken(token['access'])) token = await TokenHandler.getLoginToken();
        // refresh 토큰 만료 시 재발급
        if (token && !await TokenHandler.verifyToken(token['refresh'])) token = await TokenHandler.getRefreshToken(token['refresh']);
        
        return token?.refresh;
    }
}

console.log('test.ts');

async function testFunc(): Promise<void>{
    const token = await TokenHandler.getToken();
    console.log(token);
}

testFunc();
