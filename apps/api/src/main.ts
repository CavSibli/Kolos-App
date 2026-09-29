import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/presentation/common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('v1');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const corsOrigin = configService.get<string>('app.corsOrigin');
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // En prod Docker, toujours 3000 (Caddy proxy vers api:3000).
  const port =
    process.env.NODE_ENV === 'production'
      ? 3000
      : Number(process.env.PORT ?? 3000);

  // #region agent log
  console.log(
    `DBG_KOLOS ${JSON.stringify({
      sessionId: '27b403',
      hypothesisId: 'H2',
      location: 'main.ts:listen',
      message: 'about to listen',
      data: {
        chosenPort: port,
        envPORT: process.env.PORT ?? null,
        envPOSTGRES_PORT: process.env.POSTGRES_PORT ?? null,
        configAppPort: configService.get('app.port') ?? null,
        nodeEnv: process.env.NODE_ENV ?? null,
        corsOrigin: corsOrigin ?? null,
      },
      timestamp: Date.now(),
    })}`,
  );
  // #endregion

  await app.listen(port);
  console.log(`Kolos API running on http://localhost:${port}/v1`);
}

bootstrap();
