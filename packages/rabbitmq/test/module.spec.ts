import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ClientRMQ, RabbitmqModule } from '../src/index.js';

describe('RabbitmqModule', () => {
  let app: INestApplication;

  it('forRoot', async () => {
    const module = await Test.createTestingModule({
      imports: [
        RabbitmqModule.forRoot({
          useValue: { lazyConnect: true },
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const client = await app.resolve(ClientRMQ);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(ClientRMQ);
    await app.close();
  });

  it('forRootAsync', async () => {
    const module = await Test.createTestingModule({
      imports: [
        RabbitmqModule.forRootAsync({
          useFactory: () => ({
            brokers: ['localhost'],
            lazyConnect: true,
          }),
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const client = await app.resolve(ClientRMQ);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(ClientRMQ);
    await app.close();
  });

  it('forRoot - multiple instances', async () => {
    const module = await Test.createTestingModule({
      imports: [
        RabbitmqModule.forRoot({
          token: 'client1',
          useValue: {
            urls: ['amqp://localhost:5672'],
            lazyConnect: true,
          },
        }),
        RabbitmqModule.forRoot({
          token: 'client2',
          useValue: {
            urls: ['amqp://localhost:5673'],
            lazyConnect: true,
          },
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const client1 = await app.resolve('client1');
    expect(client1).toBeDefined();
    expect(client1).toBeInstanceOf(ClientRMQ);
    const client2 = await app.resolve('client2');
    expect(client2).toBeDefined();
    expect(client2).toBeInstanceOf(ClientRMQ);
    expect(client2).not.toBe(client1);
    await app.close();
  });

  it('forRootAsync - multiple instances', async () => {
    const module = await Test.createTestingModule({
      imports: [
        RabbitmqModule.forRootAsync({
          token: 'client1',
          useFactory: () => ({
            urls: ['amqp://localhost:5672'],
            lazyConnect: true,
          }),
        }),
        RabbitmqModule.forRootAsync({
          token: 'client2',
          useFactory: () => ({
            urls: ['amqp://localhost:5673'],
            lazyConnect: true,
          }),
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const client1 = await app.resolve('client1');
    expect(client1).toBeDefined();
    expect(client1).toBeInstanceOf(ClientRMQ);
    const client2 = await app.resolve('client2');
    expect(client2).toBeDefined();
    expect(client2).toBeInstanceOf(ClientRMQ);
    expect(client2).not.toBe(client1);
    await app.close();
  });
});
