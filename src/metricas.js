
const client = require("prom-client");

// Registrar metricas predeterminadas de Node.js
client.collectDefaultMetrics();

// Histograma para medir duracion de peticiones HTTP
const duracionHTTP = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duracion de las peticiones HTTP en segundos",
  labelNames: ["metodo", "ruta", "codigo"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});

// Contador de prestamos registrados
const prestamosRegistrados = new client.Counter({
  name: "prestamos_registrados_total",
  help: "Cantidad total de prestamos registrados"
});

module.exports = {
  client,
  duracionHTTP,
  prestamosRegistrados
};
