import { Body, Controller, Delete, Get, HttpException, HttpStatus, Post, Put, Query, Req, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/createUser.dto';
import { DtoForUserList } from './dtos/dtoForUserList.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDTO } from './dtos/UpdateUserDTO';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async getAllUsers(
    @Query('pageNum') pageNum: number = 1,
  ): Promise<{ users: DtoForUserList[], totalCount: number, perPage: number }> {
    const { users, totalCount, perPage } = await this.usersService.getAllUsers(pageNum);

    return { users, totalCount, perPage };
  }

  @Post()
  async SignUp(@Body() user: CreateUserDto) {
    console.log("add user request check !");

    try {
      await this.usersService.checkDuplicateEmailAndNickname(user.email, user.nickname);
      return this.usersService.CreateUser(user);
    } catch (error) {
      console.log("error : ", error);
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }
  }

  @Delete()
  async deleteUsersForCheckedIds(@Body('checkedIds') checkedIds: number[]) {

    try {
      //
      const deletedCount = await this.usersService.deleteUsersForCheckedIds(checkedIds);

      return {
        message: `총 ${deletedCount}명의 유저가 삭제되었습니다.`,
      };

    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  @Post("login")
  async login(@Body() requestBody, @Res() response) {
    const { email, password } = requestBody;

    // 이메일로 사용자 찾기
    const user = await this.usersService.getUserByEmail(email);

    // 사용자가 존재하지 않으면 에러 처리
    if (!user) {
      return response.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: '이메일이나 비밀번호가 잘못되었습니다.',
      });
    }

    // 비밀번호 일치 여부 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return response.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: '이메일이나 비밀번호가 잘못되었습니다.',
      });
    }

    // access token 과 refresh token 발급을 위한 서비스 함수 생성후 여기서 호출하고
    // 아래 response 할때 응답 하도록 하기
    const { accessToken, refreshToken } = await this.usersService.issueTokens(user);

    return response.status(HttpStatus.OK).json({
      success: true,
      message: '로그인 성공',
      email: user.email,
      nickname: user.email,
      accessToken,
      refreshToken
    });
  }

  @Post("login-check-by-accessToken")
  async loginCheckByAccessToken(@Req() req: Request, @Res() response) {
    console.log("login check by accessToken");

    try {
      const authorizationHeader = req.headers['authorization'] as string;

      if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return response.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid authorization header',
        });
      }

      const accessToken = authorizationHeader.replace('Bearer ', '');

      const userOrError = await this.usersService.loginCheck(accessToken);

      if (!userOrError.success) {
        return response.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          reason: userOrError.reason || 'Unknown reason',
        });
      }

      return response.status(HttpStatus.OK).json({
        success: true,
        user: userOrError.user,
      });

    } catch (error) {
      console.error('Login check error:', error);

      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error,
      });
    }
  }

  @Post("login-check-by-refreshToken")
  async loginCheckByRefreshToken(@Req() req: Request, @Res() response) {
    console.log("login check by refresh token ");

    try {
      const authorizationHeader = req.headers['authorization'] as string;

      if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return response.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid authorization header',
        });
      }

      const refreshToken = authorizationHeader.replace('Bearer ', '');

      const { user, accessToken } = await this.usersService.resignAccessTokenByRefreshToken(refreshToken);

      return response.status(HttpStatus.OK).json({
        success: true,
        user,
        accessToken,
      });

    } catch (error) {
      console.error('Login check error:', error);

      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error,
      });
    }
  }

  @Put('/')
  async updateUsersModelController(
    @Body() userList: UpdateUserDTO[],
    @Res() response
  ) {

    console.log("userList for update : ", userList);


    const updatedCount = await this.usersService.updateUsersModel(userList);
    if (updatedCount > 0) {
      return response.status(HttpStatus.OK).json({
        success: true,
        message: `${updatedCount} users updated.`,
      });
    } else {
      return response.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'No users updated.',
      });
    }
  }

}
