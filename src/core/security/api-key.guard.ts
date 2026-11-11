import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.API_KEY;
    if ((process.env.PROD_ENV || process.env.NODE_ENV) === 'production' && !this.apiKey) {
      throw new Error('API_KEY is required in production');
    }
  }

  canActivate(context: ExecutionContext): boolean {
    if (!this.apiKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const provided = request.headers['x-api-key'];
    if (typeof provided !== 'string') {
      throw new UnauthorizedException('Invalid API key');
    }

    const expectedBuffer = Buffer.from(this.apiKey);
    const providedBuffer = Buffer.from(provided);
    if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
