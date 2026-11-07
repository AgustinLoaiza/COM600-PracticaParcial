
module.exports = {
  testEnvironment: "node",

  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js"
  ],

  coverageThreshold: {
    global: {
      lines: 80
    }
  }
};
