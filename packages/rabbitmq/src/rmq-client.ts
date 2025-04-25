import { EventEmitter } from 'node:events';
import amqplib, { type ChannelModel, Connection } from 'amqplib';
import { RabbitmqConnectionOptions } from './types.js';

export class RmqClient extends EventEmitter {
  protected _options: RabbitmqConnectionOptions;
  protected _channelModel?: ChannelModel;

  constructor(options: RabbitmqConnectionOptions) {
    super();
    this._options = options;
  }

  async connect() {
    this._channelModel = await amqplib.connect(
      this._options,
      this._options.socketOptions,
    );
    ['error', 'close', 'blocked', 'unblocked'].forEach(ev => {
      this._channelModel!.on(ev, this.emit.bind(this, ev));
    });
  }

  async close() {
    return this._channelModel?.close();
  }

  createChannel() {
    return this._channelModel?.createChannel();
  }

  createConfirmChannel() {
    return this._channelModel?.createConfirmChannel();
  }

  get connection(): Connection | undefined {
    return this._channelModel?.connection;
  }

  updateSecret(newSecret: Buffer, reason: string) {
    return this._channelModel?.updateSecret(newSecret, reason);
  }
}
