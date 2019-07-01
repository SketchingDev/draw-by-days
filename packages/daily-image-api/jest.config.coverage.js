const commonConfig = require("./jest.config");

module.exports = Object.assign({}, commonConfig, {
  collectCoverage: true,
  collectCoverageFrom: ["**/*.{ts,tsx}", "!**/node_modules/**"],
});
