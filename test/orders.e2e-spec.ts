import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { configureApplication } from '../src/app.bootstrap';
import { ConfigService } from '../src/core/config';
import { ApiKeyGuard } from '../src/core/security/api-key.guard';
import { OrdersController } from '../src/orders/orders.controller';
import { OrdersService } from '../src/orders/orders.service';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  const originalEnv = process.env;
  const apiKey = 'test-api-key';
  const validId = '507f1f77bcf86cd799439011';
  const ordersService = {
    createOrder: jest.fn().mockResolvedValue({ id: 'order-1', orderNumber: 'order-123' }),
    findAll: jest.fn().mockResolvedValue([{ id: 'order-1', orderNumber: 'order-123' }]),
    findOne: jest.fn().mockResolvedValue({ id: validId, orderNumber: 'order-123' }),
    updateOrder: jest.fn().mockResolvedValue({ id: validId, orderNumber: 'order-123' }),
    deleteOrder: jest.fn().mockResolvedValue({ id: validId }),
  };

  beforeEach(async () => {
    process.env = {
      ...originalEnv,
      API_KEY: apiKey,
      CORS_ORIGINS: 'https://allowed.example',
    };
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        ApiKeyGuard,
        {
          provide: OrdersService,
          useValue: ordersService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApplication(app, {
      getPrefix: () => 'api',
      getEnvironment: () => 'development',
    } as ConfigService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('requires a valid service API key', async () => {
    await request(app.getHttpServer()).get('/api/orders').expect(401);
    await request(app.getHttpServer()).get('/api/orders').set('x-api-key', 'wrong').expect(401);
  });

  it('serves a bounded first page to callers with the valid API key', async () => {
    await request(app.getHttpServer())
      .get('/api/orders')
      .set('x-api-key', apiKey)
      .expect(200)
      .expect([{ id: 'order-1', orderNumber: 'order-123' }]);

    expect(ordersService.findAll).toHaveBeenCalledWith(25);
  });

  it('caps requested order list sizes at 100', async () => {
    await request(app.getHttpServer()).get('/api/orders?limit=999').set('x-api-key', apiKey).expect(200);

    expect(ordersService.findAll).toHaveBeenCalledWith(100);
  });

  it('rejects unknown request properties', async () => {
    await request(app.getHttpServer())
      .post('/api/orders')
      .set('x-api-key', apiKey)
      .send({
        goods: { sku: 'sku-1' },
        address: '1 Test Street',
        quantity: 2,
        paymentMethod: 'card',
        unexpected: 'reject-me',
      })
      .expect(400);

    expect(ordersService.createOrder).not.toHaveBeenCalled();
  });

  it('rejects invalid DTO field values', async () => {
    await request(app.getHttpServer())
      .post('/api/orders')
      .set('x-api-key', apiKey)
      .send({
        goods: { sku: 'demo' },
        address: 'Example Street 1',
        quantity: 'not-a-number',
        paymentMethod: 'card',
      })
      .expect(400);
  });

  it('rejects invalid order identifiers before reaching the service', async () => {
    await request(app.getHttpServer()).get('/api/orders/not-an-object-id').set('x-api-key', apiKey).expect(400);

    expect(ordersService.findOne).not.toHaveBeenCalled();
  });

  it('allows only configured CORS origins', async () => {
    await request(app.getHttpServer())
      .options('/api/orders')
      .set('Origin', 'https://allowed.example')
      .set('Access-Control-Request-Method', 'GET')
      .expect('access-control-allow-origin', 'https://allowed.example');

    const rejected = await request(app.getHttpServer())
      .options('/api/orders')
      .set('Origin', 'https://untrusted.example')
      .set('Access-Control-Request-Method', 'GET');

    expect(rejected.headers['access-control-allow-origin']).toBeUndefined();
  });
});
