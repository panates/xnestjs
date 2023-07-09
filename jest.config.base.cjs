module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+.ts?$': ['ts-jest', {
      'tsconfig': '<rootDir>/test/tsconfig.json'
    }]
  },
  moduleNameMapper: {
    '^(\\..+)\\.js$': '$1'
  }

};
