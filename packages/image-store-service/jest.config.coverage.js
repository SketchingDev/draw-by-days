const commonConfig = require("./jest.config");

module.exports = Object.assign({}, commonConfig, {
  collectCoverage: true,
  collectCoverageFrom: ["**/*.{ts,tsx}", "!**/node_modules/**"],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: -10,
    },
  },
});
