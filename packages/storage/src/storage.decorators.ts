import { Inject } from '@nestjs/common';
import { getStorageConnectionToken } from './storage.utils.js';

export const InjectStorage: (connection?: string) =>
    ParameterDecorator = (connection?: string) => Inject(getStorageConnectionToken(connection));
