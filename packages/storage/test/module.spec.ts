import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { StorageConnection, StorageModule } from '../src/index.js';

describe('StorageModule', () => {
  let app: INestApplication;

  it('register (s3)', async () => {
    const module = await Test.createTestingModule({
      imports: [
        StorageModule.register({
          provider: 's3',
          s3: {
            endPoint: 'play.min.io',
            port: 9000,
            useSSL: true,
            accessKey: 'accessKey',
            secretKey: 'secretKey',
          },
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const connection = await app.resolve(StorageConnection);
    expect(connection).toBeDefined();
    expect(connection).toBeInstanceOf(StorageConnection);
    await app.close();
  });

  it('registerAsync - useFactory (s3)', async () => {
    const module = await Test.createTestingModule({
      imports: [
        StorageModule.registerAsync({
          useFactory: () => ({
            provider: 's3',
            s3: {
              endPoint: 'play.min.io',
              port: 9000,
              useSSL: true,
              accessKey: 'accessKey',
              secretKey: 'secretKey',
            },
          }),
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const connection = await app.resolve(StorageConnection);
    expect(connection).toBeDefined();
    expect(connection).toBeInstanceOf(StorageConnection);
    await app.close();
  });
});
