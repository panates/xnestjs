import base from './jest.config.base.mjs';

export default {
  ...base,
  verbose: true,
  projects: ['<rootDir>/packages/*/jest.config.mjs'],
  reporters: ['default'],
  coverageReporters: ['lcov'],
  coverageDirectory: '<rootDir>/reports/',
};
