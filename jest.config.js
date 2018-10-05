module.exports = {
  setupFiles: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/styles/',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/styles/',
    '<rootDir>/jest.setup.js',
  ],
  collectCoverageFrom: [
    '<rootDir>/components/**/*.{js,jsx}',
    '<rootDir>/pages/**/*.{js,jsx}',
    '<rootDir>/server/**/*.{js,jsx}',
    '<rootDir>/utils/**/*.{js,jsx}',
  ],
}
