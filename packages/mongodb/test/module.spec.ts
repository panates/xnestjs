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

  it('forRoot - multiple instances', async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongodbModule.forRoot({
          token: 'mongo1',
          dbToken: 'db1',
          database: 'test1',
        }),
        MongodbModule.forRoot({
          token: 'mongo2',
          dbToken: 'db2',
          database: 'test2',
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const mongo1 = await app.resolve('mongo1');
    expect(mongo1).toBeDefined();
    expect(mongo1).toBeInstanceOf(MongoClient);
    const db1: Db = await app.resolve('db1');
    expect(db1).toBeDefined();
    expect(db1.databaseName).toEqual('test1');
    const db2: Db = await app.resolve('db2');
    expect(db2).toBeDefined();
    expect(db2.databaseName).toEqual('test2');
    await app.close();
  });

  it('forRootAsync - multiple instances', async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongodbModule.forRootAsync({
          token: 'mongo1',
          dbToken: 'db1',
          useFactory: () => ({
            database: 'test1',
          }),
        }),
        MongodbModule.forRootAsync({
          token: 'mongo2',
          dbToken: 'db2',
          useFactory: () => ({
            database: 'test2',
          }),
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const mongo1 = await app.resolve('mongo1');
    expect(mongo1).toBeDefined();
    expect(mongo1).toBeInstanceOf(MongoClient);
    const db1: Db = await app.resolve('db1');
    expect(db1).toBeDefined();
    expect(db1.databaseName).toEqual('test1');
    const db2: Db = await app.resolve('db2');
    expect(db2).toBeDefined();
    expect(db2.databaseName).toEqual('test2');
    await app.close();
  });
});
