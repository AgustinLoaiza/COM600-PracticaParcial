
const pino = require("pino");

const registro = pino({
  base: {
    servicio: process.env.SERVICIO || "prestamos-api"
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (nivel) => ({ nivel })
  }
});

module.exports = { registro };
