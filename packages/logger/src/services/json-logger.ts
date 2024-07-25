import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { JsonLoggerOptions } from '../types.js';

export class JsonLogger<T extends object> extends ConsoleLogger {
  constructor();
  constructor(context: string);
  constructor(context: string, options: JsonLoggerOptions);
  constructor(...args: any[]) {
    // @ts-ignore
    super(...args);
  }

  log(message: any, data?: T): void;
  log(data?: T): void;
  log(...args: any[]) {
    // @ts-ignore
    super.log.call(this, ...args);
  }

  error(message: any, data?: T): void;
  error(data?: T): void;
  error(...args: any[]) {
    // @ts-ignore
    super.log.call(this, ...args);
  }

  warn(message: any, data?: T): void;
  warn(data?: T): void;
  warn(...args: any[]) {
    // @ts-ignore
    super.log.call(this, ...args);
  }

  debug(message: any, data?: T): void;
  debug(data?: T): void;
  debug(...args: any[]) {
    // @ts-ignore
    super.log.call(this, ...args);
  }

  verbose(message: any, data?: T): void;
  verbose(data?: T): void;
  verbose(...args: any[]) {
    // @ts-ignore
    super.log.call(this, ...args);
  }

  fatal(message: any, data?: T): void;
  fatal(data?: T): void;
  fatal(...args: any[]) {
    // @ts-ignore
    super.log.call(this, ...args);
  }

  protected printMessages(
    messages: any[],
    context = '',
    logLevel: LogLevel = 'log',
    writeStreamType?: 'stdout' | 'stderr',
  ) {
    let message: string = '';
    const data: any = {
      pid: process.pid,
      level: logLevel,
      context,
      time: new Date().toISOString(),
      message,
    };
    messages.forEach((x: any) => {
      if (x instanceof Error) x = JSON.stringify(x, Object.getOwnPropertyNames(x));
      if (typeof x === 'object') {
        Object.assign(data, x);
      } else message += (message ? ' ' : '') + x;
    });
    data.message = message;
    const formattedMessage = JSON.stringify(data);
    process[writeStreamType ?? 'stdout'].write(formattedMessage + '\n');
  }

  protected colorize(message: string): string {
    return message;
  }
}
