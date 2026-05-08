import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  await app.listen(3333);
  console.log('Backend rodando em http://localhost:3333/api');
}
bootstrap();
