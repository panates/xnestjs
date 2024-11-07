/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  maxWorkers: 1,
  moduleFileExtensions: ['ts', 'js', 'mjs', 'cjs'],
  transform: {
    '^.+\\.m?[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/test/tsconfig.json',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules'],
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  coveragePathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/dist/', '<rootDir>/test/', '/node_modules/', '_support'],
};
