import { defaults } from 'jest-config';

export default {
    ...defaults,
    preset: '../../../jest-preset.js',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    moduleFileExtensions: ['ts', 'js']
};