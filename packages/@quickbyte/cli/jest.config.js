const path = require('path');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: '../../../jest-preset.js',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: ['ts', 'js']
};