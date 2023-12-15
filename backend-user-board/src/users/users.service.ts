import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersModel } from './entities/users.entity';
import { DtoForUserList } from './dtos/dtoForUserList.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UpdateUserDTO } from './dtos/UpdateUserDTO';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(UsersModel)
        private readonly usersRepository: Repository<UsersModel>,

        private readonly configService: ConfigService
    ) { }

    issueTokens(user: UsersModel): { accessToken: string, refreshToken: string } {
        const accessTokenSecret = this.configService.get<string>('ACCESS_TOKEN_SECRET');
        const refreshTokenSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET');

        const accessTokenPayload = {
            id: user.id,
            email: user.email,
            nickname: user.nickname // 사용자의 닉네임을 토큰에 추가
        };

        const refreshTokenPayload = {
            id: user.id,
            email: user.email
        };

        // 1d, 1h, 1m
        const accessToken = jwt.sign(accessTokenPayload, accessTokenSecret, { expiresIn: '10m' });
        const refreshToken = jwt.sign(refreshTokenPayload, refreshTokenSecret, { expiresIn: '1h' });

        return { accessToken, refreshToken };
    }

    async getUserByEmail(email: string): Promise<UsersModel> {
        return await this.usersRepository.findOne({ where: { email } });
    }

    async getAllUsers(pageNum: number = 1, perPage: number = 5): Promise<{ users: DtoForUserList[], totalCount: number, perPage: number }> {
        const skip = (pageNum - 1) * perPage;

        const [users, totalCount] = await this.usersRepository.findAndCount({
            skip,
            take: perPage,
            order: {
                id: 'DESC', // id를 기준으로 내림차순 정렬
            },
        });

        if (!users || !users.length) {
            throw new NotFoundException('No users found');
        }

        const dtoUsers = users.map(user => {
            const dtoUser: DtoForUserList = {
                id: user.id,
                email: user.email,
                nickname: user.nickname,
                role: user.role,
                gender: user.gender,
                phoneNumber: user.phoneNumber,
                backEndLevel: user.backEndLevel,
                frontEndLevel: user.frontEndLevel,
            };
            return dtoUser;
        });

        return { users: dtoUsers, totalCount, perPage };
    }

    async CreateUser(user: Partial<UsersModel>) {
        const hashedPassword = await this.hashPassword(user.password); // 비밀번호를 해시화
        const userToCreate = {
            ...user,
            password: hashedPassword, // 해시된 비밀번호로 교체
        };
        return await this.usersRepository.save(userToCreate);
    }

    private async hashPassword(password: string): Promise<string> {
        const saltOrRounds = 10;
        const salt = await bcrypt.genSalt(saltOrRounds); // 솔트 생성

        return bcrypt.hash(password, salt); // 솔트를 이용하여 비밀번호를 해시화
    }

    async createUser(user: Partial<UsersModel>): Promise<UsersModel> {
        return await this.usersRepository.save(user);
    }

    async checkDuplicateEmailAndNickname(email: string, nickname: string): Promise<void> {
        const existingUserByEmail = await this.usersRepository.findOne({ where: { email } });
        const existingUserByNickname = await this.usersRepository.findOne({ where: { nickname } });

        if (existingUserByEmail) {
            throw new ConflictException('이미 존재하는 email 입니다.');
        }

        if (existingUserByNickname) {
            throw new ConflictException('이미 존재하는 nickname 입니다.');
        }
    }

    async deleteUsersForCheckedIds(checkedIds: number[]): Promise<number> {
        try {
            // 삭제할 사용자들을 찾아서 삭제
            console.log("checkedIds : ", checkedIds);

            const deletedUsers = await this.usersRepository.delete(checkedIds);
            return deletedUsers.affected ?? 0;
        } catch (error) {
            throw new Error('삭제 중 오류가 발생했습니다.');
        }
    }

    async validateAccessToken(accessToken: string): Promise<{ success: boolean, reason?: string }> {
        try {
            const accessTokenSecret = this.configService.get<string>('ACCESS_TOKEN_SECRET');
            const decodedToken = jwt.verify(accessToken, accessTokenSecret) as jwt.JwtPayload;

            // 토큰이 유효하면서 만료기간이 현재보다 미래인지 확인
            const currentTime = Math.floor(Date.now() / 1000); // 현재 시간(초 단위)
            if (decodedToken && decodedToken.exp && decodedToken.exp > currentTime) {
                return { success: true };
            } else {
                return { success: false, reason: 'duedate_has_passed' };
            }

        } catch (error) {
            // 토큰 검증에 실패하거나 만료된 경우
            console.error('Access Token Validation Error:', error);
            return { success: false, reason: error };
        }

    }


    async validateRefreshToken(refreshToken: string): Promise<boolean> {
        try {
            const refreshTokenSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
            const decodedToken = jwt.verify(refreshToken, refreshTokenSecret) as jwt.JwtPayload;

            // 토큰이 유효하면서 만료기간이 현재보다 미래인지 확인
            const currentTime = Math.floor(Date.now() / 1000); // 현재 시간(초 단위)
            console.log('Expiry:', decodedToken.exp);
            console.log('Refresh Token Expiry:', decodedToken && decodedToken.exp);

            return decodedToken && decodedToken.exp && decodedToken.exp > currentTime;
        } catch (error) {
            // 토큰 검증에 실패하거나 만료된 경우
            console.error('Refresh Token Validation Error:', error);
            return false;
        }
    }

    async loginCheck(accessToken: string): Promise<{ success: boolean, user?: UsersModel, reason?: string }> {
        const resultForTokenValidationTest = await this.validateAccessToken(accessToken);

        if (!resultForTokenValidationTest.success) {
            console.log("resultForTokenValidationTest : ", resultForTokenValidationTest);
            return { success: false, reason: resultForTokenValidationTest.reason };
        }

        try {
            const decodedToken = jwt.verify(accessToken, this.configService.get<string>('ACCESS_TOKEN_SECRET')) as jwt.JwtPayload;
            const userEmail = decodedToken.email; // 토큰에서 이메일 추출

            const user = await this.getUserByEmail(userEmail); // 해당 이메일로 사용자 정보 가져오기
            if (!user) {
                throw new NotFoundException('User not found');
            }

            return { success: true, user };
        } catch (error) {
            console.error('Error retrieving user information:', error);
            throw new Error('Failed to retrieve user information');
        }
    }


    private issueNewAccessToken(user: UsersModel): string {
        const accessTokenSecret = this.configService.get<string>('ACCESS_TOKEN_SECRET');
        const accessTokenPayload = {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
        };
        const newAccessToken = jwt.sign(accessTokenPayload, accessTokenSecret, { expiresIn: '1h' });

        return newAccessToken;

    }

    async resignAccessTokenByRefreshToken(refreshToken: string): Promise<{ user: UsersModel; accessToken: string }> {
        const isRefreshTokenValid = await this.validateRefreshToken(refreshToken);

        if (!isRefreshTokenValid) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        try {
            const refreshTokenSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
            const decodedToken = jwt.verify(refreshToken, refreshTokenSecret) as jwt.JwtPayload;

            // Refresh Token이 유효하면 해당 유저 정보 가져오기
            const user = await this.getUserByEmail(decodedToken.email);

            // Access Token 재발급
            const newAccessToken = this.issueNewAccessToken(user);

            return { user, accessToken: newAccessToken };
        } catch (error) {
            console.log('Error resigning access token by refresh token:', error);
            throw new InternalServerErrorException('Failed to issue new access token');
        }
    }

    // react-data-grid 의 save button 눌러서 넘어온 데이터로 UsersModel 업데이트
    // UsersService

    // UsersService

    async updateUsersModel(userList: UpdateUserDTO[]): Promise<number> {
        let updatedCount = 0;

        try {
            for (const userData of userList) {
                const { id, ...updateData } = userData;

                const userToUpdate = await this.usersRepository.findOne({ where: { id } });

                if (userToUpdate) {
                    const result = await this.usersRepository.update(id, updateData);
                    if (result.affected) {
                        updatedCount++;
                    }
                }
            }
        } catch (error) {
            // Error handling logic
            console.error('Error updating users:', error);
            throw new InternalServerErrorException('Error updating users');
        }

        return updatedCount;
    }




}
