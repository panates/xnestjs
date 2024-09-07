import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Kafka, KafkaModule } from '../src/index.js';

describe('KafkaModule', () => {
  let app: INestApplication;

  it('forRoot', async () => {
    const module = await Test.createTestingModule({
      imports: [
        KafkaModule.forRoot({
          brokers: ['localhost'],
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const kafka = await app.resolve(Kafka);
    expect(kafka).toBeDefined();
    expect(kafka).toBeInstanceOf(Kafka);
    await app.close();
  });

  it('forRootAsync', async () => {
    const module = await Test.createTestingModule({
      imports: [
        KafkaModule.forRootAsync({
          useFactory: () => ({
            brokers: ['localhost'],
          }),
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const kafka = await app.resolve(Kafka);
    expect(kafka).toBeDefined();
    expect(kafka).toBeInstanceOf(Kafka);
    await app.close();
  });

  it('forRoot - multiple instances', async () => {
    const module = await Test.createTestingModule({
      imports: [
        KafkaModule.forRoot({
          id: 'kafka1',
          brokers: ['localhost'],
        }),
        KafkaModule.forRoot({
          id: 'kafka2',
          brokers: ['localhost'],
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const kafka1 = await app.resolve('kafka1');
    expect(kafka1).toBeDefined();
    expect(kafka1).toBeInstanceOf(Kafka);
    const kafka2 = await app.resolve('kafka2');
    expect(kafka2).toBeDefined();
    expect(kafka2).toBeInstanceOf(Kafka);
    expect(kafka1).not.toBe(kafka2);
    await app.close();
  });

  it('forRootAsync - multiple instances', async () => {
    const module = await Test.createTestingModule({
      imports: [
        KafkaModule.forRootAsync({
          id: 'kafka1',
          useFactory: () => ({
            brokers: ['localhost'],
          }),
        }),
        KafkaModule.forRootAsync({
          id: 'kafka2',
          useFactory: () => ({
            brokers: ['localhost'],
          }),
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const kafka1 = await app.resolve('kafka1');
    expect(kafka1).toBeDefined();
    expect(kafka1).toBeInstanceOf(Kafka);
    const kafka2 = await app.resolve('kafka2');
    expect(kafka2).toBeDefined();
    expect(kafka2).toBeInstanceOf(Kafka);
    expect(kafka1).not.toBe(kafka2);
    await app.close();
  });
});
