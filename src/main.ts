import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from './core/config';
import { config } from './app.config';
import { configureApplication } from './app.bootstrap';

async function bootstrap() {
  const configService = new ConfigService(config);
  const app = await NestFactory.create(AppModule);
  configureApplication(app, configService);
  await app.listen(configService.getPort());
  Logger.log(
    `${configService.getConfig().name} (${configService.getConfig().id}) running on port ${configService.getPort()}`,
  );
}
bootstrap();
