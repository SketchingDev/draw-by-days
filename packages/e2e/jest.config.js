module.exports = {
  globals: {
    "ts-jest": {
      tsConfigFile: "./tsconfig.json",
    },
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testEnvironment: "node",
  collectCoverage: false,
  reporters: [
    "default",
    [
      "jest-junit",
      {
        suiteName: "jest tests",
        outputDirectory: "reports/jest/",
        outputName: "js-test-results.xml",
      },
    ],
  ],
};
