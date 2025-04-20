module.exports = {
  preset: "jest-preset-angular",
  testEnvironment: "jsdom",
  roots: [
    "<rootDir>"
  ],
  modulePaths: ["<rootDir>"],
  moduleDirectories: ["node_modules", "<rootDir>"],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  setupFilesAfterEnv: [
    'jest-extended',
    'jest-preset-angular/setup-jest'
  ],
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1"
  },
  globals: {
    'ts-jest': {
      isolatedModules: false,
      tsconfig: '<rootDir>/tsconfig.spec.json'
    },
  },
  testTimeout: 5000
}
