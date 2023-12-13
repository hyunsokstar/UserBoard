import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 여러 주소를 포함하는 CORS 설정
  const allowedOrigins = ['http://127.0.0.1:3000', 'http://127.0.0.1:3010'];

  app.enableCors({
    origin: allowedOrigins, // 여러 주소를 배열로 추가
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // DTO에 정의되지 않은 속성은 필터링합니다.
    forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 들어오면 요청을 막습니다.
    transform: true, // 요청 데이터를 DTO 타입으로 자동 변환합니다.
  }));

  await app.listen(8080);
}
bootstrap();
