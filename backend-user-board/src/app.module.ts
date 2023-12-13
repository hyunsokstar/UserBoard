import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./users/users.module";
import { UsersModel } from "./users/entities/users.entity";
import { APP_FILTER } from "@nestjs/core";
import { TypeORMExceptionFilter } from "./filters/exceptions.filter";
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "127.0.0.1",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "userAdminBoard",
      entities: [UsersModel],
      synchronize: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true, // 어디서든 사용할 수 있도록 설정
      envFilePath: '.env', // 환경 변수 파일 경로 지정
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_FILTER,
      useClass: TypeORMExceptionFilter,
    },
  ],
})
export class AppModule { }
