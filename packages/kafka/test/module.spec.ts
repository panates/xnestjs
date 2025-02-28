import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ClientKafka, KafkaModule } from '../src/index.js';

describe('KafkaModule', () => {
  let app: INestApplication;

  it('forRoot', async () => {
    const module = await Test.createTestingModule({
      imports: [
        KafkaModule.forRoot({
          useValue: { lazyConnect: true },
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const kafka = await app.resolve(ClientKafka);
    expect(kafka).toBeDefined();
    expect(kafka).toBeInstanceOf(ClientKafka);
    await app.close();
  });

  it('forRootAsync', async () => {
    const module = await Test.createTestingModule({
      imports: [
        KafkaModule.forRootAsync({
          useFactory: () => ({
            brokers: ['localhost'],
            lazyConnect: true,
          }),
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const kafka = await app.resolve(ClientKafka);
    expect(kafka).toBeDefined();
    expect(kafka).toBeInstanceOf(ClientKafka);
    await app.close();
  });

  it('forRoot - multiple instances', async () => {
    const module = await Test.createTestingModule({
      imports: [
        KafkaModule.forRoot({
          token: 'kafka1',
          useValue: {
            brokers: ['localhost'],
            lazyConnect: true,
          },
        }),
        KafkaModule.forRoot({
          token: 'kafka2',
          useValue: {
            brokers: ['localhost'],
            lazyConnect: true,
          },
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const kafka1 = await app.resolve('kafka1');
    expect(kafka1).toBeDefined();
    expect(kafka1).toBeInstanceOf(ClientKafka);
    const kafka2 = await app.resolve('kafka2');
    expect(kafka2).toBeDefined();
    expect(kafka2).toBeInstanceOf(ClientKafka);
    expect(kafka1).not.toBe(kafka2);
    await app.close();
  });

  it('forRootAsync - multiple instances', async () => {
    const module = await Test.createTestingModule({
      imports: [
        KafkaModule.forRootAsync({
          token: 'kafka1',
          useFactory: () => ({
            brokers: ['localhost'],
            lazyConnect: true,
          }),
        }),
        KafkaModule.forRootAsync({
          token: 'kafka2',
          useFactory: () => ({
            brokers: ['localhost'],
            lazyConnect: true,
          }),
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const kafka1 = await app.resolve('kafka1');
    expect(kafka1).toBeDefined();
    expect(kafka1).toBeInstanceOf(ClientKafka);
    const kafka2 = await app.resolve('kafka2');
    expect(kafka2).toBeDefined();
    expect(kafka2).toBeInstanceOf(ClientKafka);
    expect(kafka1).not.toBe(kafka2);
    await app.close();
  });
});
