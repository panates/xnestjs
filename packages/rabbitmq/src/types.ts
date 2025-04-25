import * as net from 'node:net';
import * as tls from 'node:tls';
import type { Logger } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common/interfaces';
import type { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import { Options } from 'amqplib';

export interface RabbitmqConnectionOptions extends Options.Connect {
  lazyConnect?: boolean;
  socketOptions?: net.SocketConnectOpts | tls.TLSSocketOptions;
}

export interface RabbitmqModuleOptions extends BaseModuleOptions {
  useValue?: Partial<RabbitmqConnectionOptions>;
}

export interface RabbitmqModuleAsyncOptions
  extends BaseModuleOptions,
    Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) =>
    | Promise<Partial<RabbitmqConnectionOptions>>
    | Partial<RabbitmqConnectionOptions>;
}

interface BaseModuleOptions {
  token?: InjectionToken;
  envPrefix?: string;
  logger?: Logger | string;
  global?: boolean;
}
