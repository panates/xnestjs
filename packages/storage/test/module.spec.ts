import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { expect } from 'expect';
import { StorageConnection, StorageModule } from '../src/index.js';

describe('StorageModule', () => {
  let app: INestApplication;

  it('forRoot (s3)', async () => {
    const module = await Test.createTestingModule({
      imports: [
        StorageModule.forRoot({
          useValue: {
            provider: 's3',
            s3: {
              endPoint: 'play.min.io',
              port: 9000,
              useSSL: true,
              accessKey: 'accessKey',
              secretKey: 'secretKey',
            },
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

  it('forRootAsync (s3)', async () => {
    const module = await Test.createTestingModule({
      imports: [
        StorageModule.forRootAsync({
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
