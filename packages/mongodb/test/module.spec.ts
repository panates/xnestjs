import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Db, MongoClient } from 'mongodb';
import { MONGODB_CONNECTION_OPTIONS, MongodbModule } from '../src/index.js';

describe('MongodbModule', () => {
  let app: INestApplication;

  it('forRoot', async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongodbModule.forRoot({
          database: 'test',
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const options = await app.resolve(MONGODB_CONNECTION_OPTIONS);
    expect(options).toBeDefined();
    expect(options.url).toEqual('mongodb://localhost:27017');
    const client = await app.resolve(MongoClient);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(MongoClient);
    const db = await app.resolve(Db);
    expect(db).toBeDefined();
    expect(db.databaseName).toEqual('test');
    await app.close();
  });

  it('forRootAsync', async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongodbModule.forRootAsync({
          useFactory: () => ({
            database: 'test',
          }),
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const options = await app.resolve(MONGODB_CONNECTION_OPTIONS);
    expect(options).toBeDefined();
    expect(options.url).toEqual('mongodb://localhost:27017');
    const client = await app.resolve(MongoClient);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(MongoClient);
    const db = await app.resolve(Db);
    expect(db).toBeDefined();
    expect(db.databaseName).toEqual('test');
    await app.close();
  });
});
