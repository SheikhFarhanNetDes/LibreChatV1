module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  roots: ['<rootDir>'],
  coverageDirectory: 'coverage',
  setupFiles: ['./test/jestSetup.js', './test/__mocks__/KeyvMongo.js'],
  moduleNameMapper: {
    '~/(.*)': '<rootDir>/$1',
  },
};
