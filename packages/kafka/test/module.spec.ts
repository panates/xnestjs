import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { expect } from 'expect';
import { Kafka, KafkaModule } from '../src/index.js';

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
    const client = await app.resolve(Kafka);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(Kafka);
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
    const client = await app.resolve(Kafka);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(Kafka);
    await app.close();
  });

  it('forRoot - multiple instances', async () => {
    const module = await Test.createTestingModule({
      imports: [
        KafkaModule.forRoot({
          token: 'client1',
          useValue: {
            brokers: ['localhost'],
            lazyConnect: true,
          },
        }),
        KafkaModule.forRoot({
          token: 'client2',
          useValue: {
            brokers: ['localhost'],
            lazyConnect: true,
          },
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const client1 = await app.resolve('client1');
    expect(client1).toBeDefined();
    expect(client1).toBeInstanceOf(Kafka);
    const client2 = await app.resolve('client2');
    expect(client2).toBeDefined();
    expect(client2).toBeInstanceOf(Kafka);
    expect(client2).not.toBe(client1);
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
    const client1 = await app.resolve('kafka1');
    expect(client1).toBeDefined();
    expect(client1).toBeInstanceOf(Kafka);
    const client2 = await app.resolve('kafka2');
    expect(client2).toBeDefined();
    expect(client2).toBeInstanceOf(Kafka);
    expect(client2).not.toBe(client1);
    await app.close();
  });
});
