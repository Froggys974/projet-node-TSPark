/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/integration/setup.ts"],

  rootDir: ".",
  roots: ["<rootDir>/tests", "<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"],

  cacheDirectory: "<rootDir>/node_modules/.cache/jest",

  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
};
