import { Logger } from '@nestjs/common';
import { logLevel } from 'kafkajs';

export function createLogCreator(logger?: Logger) {
  return ({ namespace, level, log }) => {
    if (!logger) return;
    const { message, ...extra } = log;

    switch (level) {
      case logLevel.ERROR:
        return logger.error(message, new Error(message), {
          ...extra,
          namespace,
        });
      case logLevel.WARN:
        return logger.warn(message, {
          ...extra,
          namespace,
        });
      case logLevel.INFO:
        return logger.log(message, {
          ...extra,
          namespace,
        });
      case logLevel.DEBUG:
        return logger.debug(message, {
          ...extra,
          namespace,
        });
      default:
        return logger.verbose(message, {
          ...extra,
          namespace,
        });
    }
  };
}
