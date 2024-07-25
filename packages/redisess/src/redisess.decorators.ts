import { Inject } from '@nestjs/common';
import { getSessionManagerToken } from './redisess.utils.js';

export const InjectSessionManager: (name?: string) => ParameterDecorator = (name?: string) =>
  Inject(getSessionManagerToken(name));
