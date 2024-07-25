const base = require('./jest.config.base.cjs');

module.exports = {
  ...base,
  projects: ['<rootDir>/packages/*/jest.config.cjs'],
  coveragePathIgnorePatterns: [
    '/build/',
    '/dist/',
    '/packages/oracle/',
    '/node_modules/',
    '_support',
    '_shared',
  ],
  coverageReporters: ['lcov', 'text'],
  coverageDirectory: '<rootDir>/coverage/',
};
