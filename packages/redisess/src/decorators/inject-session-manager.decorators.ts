import { Inject } from '@nestjs/common';
import { getSessionManagerToken } from '../utils/get-session-manager-token.util.js';

export const InjectSessionManager: (name?: string) => ParameterDecorator = (name?: string) =>
  Inject(getSessionManagerToken(name));
