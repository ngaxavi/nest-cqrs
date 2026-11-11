import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from './core/config';

export function parseCorsOrigins(value: string | undefined): string[] {
  return (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function configureApplication(app: INestApplication, configService: ConfigService): void {
  const origins = parseCorsOrigins(process.env.CORS_ORIGINS);

  if (configService.getEnvironment() === 'production' && origins.length === 0) {
    throw new Error('CORS_ORIGINS is required in production');
  }

  if (origins.length > 0) {
    app.enableCors({ origin: origins });
  } else {
    app.enableCors();
  }
  app.setGlobalPrefix(configService.getPrefix());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
