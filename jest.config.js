module.exports = {
  projects: [
    {
      displayName: 'backend',
      testMatch: ['<rootDir>/backend/**/*.test.js'],
      testEnvironment: 'node'
    },
    {
      displayName: 'frontend',
      testMatch: [
        '<rootDir>/tests/**/*.test.js',
        '<rootDir>/__tests__/**/*.test.js',
        '<rootDir>/*.test.js'
      ],
      testEnvironment: 'jsdom'
    }
  ],
  transform: {}
};
