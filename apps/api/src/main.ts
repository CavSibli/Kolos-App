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

  const port = configService.get<number>('app.port') ?? 3000;
  await app.listen(port);
  console.log(`Kolos API running on http://localhost:${port}/v1`);

  // #region agent log
  try {
    const fs = await import('fs');
    const httpAdapter = app.getHttpAdapter();
    const instance = httpAdapter.getInstance() as {
      _router?: { stack?: Array<{ route?: { path?: string; methods?: Record<string, boolean> } }> };
    };
    const stack = instance._router?.stack ?? [];
    const adminRoutes = stack
      .filter((layer) => layer.route?.path?.includes('admin'))
      .map((layer) => {
        const methods = Object.keys(layer.route!.methods ?? {})
          .join(',')
          .toUpperCase();
        return `${methods} ${layer.route!.path}`;
      });
    fs.appendFileSync(
      'C:/Users/sibli.cav/OneDrive - Ouidou Consulting/Bureau/3WA-KOLOS/debug-081765.log',
      `${JSON.stringify({
        sessionId: '081765',
        runId: 'pre-fix',
        hypothesisId: 'A',
        location: 'main.ts:bootstrap',
        message: 'API bootstrap admin routes',
        data: {
          port,
          adminRouteCount: adminRoutes.length,
          adminRoutes,
          hasStats: adminRoutes.some((r) => r.includes('stats')),
          hasUsers: adminRoutes.some((r) => r.includes('users')),
          hasRequests: adminRoutes.some((r) => r.includes('requests')),
          hasMissionsMsg: adminRoutes.some((r) =>
            r.includes('missions') && r.includes('messages'),
          ),
        },
        timestamp: Date.now(),
      })}\n`,
    );
  } catch (e) {
    console.error('agent-log-failed', e);
  }
  // #endregion
}

bootstrap();
