module.exports = {
    testEnvironment: 'jsdom',
    collectCoverageFrom: [
        'src/memeGenerator.js',
        '!**/node_modules/**',
        '!**/coverage/**',
        '!**/*.config.js',
        '!**/memeGeneratorApp.js'
    ],
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100
        }
    },
    coverageReporters: ['text', 'json', 'html', 'lcov'],
    testMatch: ['**/__tests__/**/*.test.js'],
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    verbose: true
};
