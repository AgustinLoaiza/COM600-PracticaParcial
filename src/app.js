const express = require("express");
const { calcularMulta } = require("./multa");
const { construirEventoPrestamoRegistrado } = require("./eventos");
const { randomUUID } = require("crypto");
const { registro } = require("./registro");

const {
  client,
  duracionHTTP,
  prestamosRegistrados
} = require("./metricas");

// publicar(clave, evento) se inyecta desde server.js: así las pruebas
// pueden pasar una función falsa (jest.fn) sin necesitar el broker.
function crearApp({ publicar = async () => {} } = {}) {
  const app = express();
  app.use(express.json());
  
  app.use((req, res, next) => {
    req.idCorrelacion =
      req.get("x-correlation-id") || randomUUID();

    res.set("x-correlation-id", req.idCorrelacion);

    req.registro = registro.child({
      idCorrelacion: req.idCorrelacion,
      metodo: req.method,
      ruta: req.path
  });

  req.registro.info("peticion recibida");

  next();
  });

  
  // Middleware para medir duracion HTTP
  app.use((req, res, next) => {
    const finalizar = duracionHTTP.startTimer();

    res.on("finish", () => {
      finalizar({
        metodo: req.method,
        ruta: req.route ? req.route.path : "sin_ruta",
        codigo: String(res.statusCode)
      });
    });

    next();
  });


  const prestamos = [];

  app.get("/salud", (_req, res) => res.json({ estado: "ok" }));

  app.get("/prestamos", (_req, res) => res.json(prestamos));

  app.post("/prestamos", async (req, res) => {
    const { lector, correo, libro, diasPrestamo } = req.body || {};
    if (!lector || !libro) {
      return res.status(400).json({ error: "lector y libro son obligatorios" });
    }
    const prestamo = {
      id: "PRE-" + (prestamos.length + 1),
      lector, correo, libro,
      diasPrestamo: diasPrestamo || 7,
      registradoEn: new Date().toISOString(),
    };
    prestamos.push(prestamo);
    prestamosRegistrados.inc();
    // TODO Tarea 2: publicar el evento PrestamoRegistrado con la clave prestamo.registrado
    //? punto anterior y abajo se termina remplazando
    /* await publicar("prestamo.registrado", {
      prestamoId: prestamo.id,
      lector: prestamo.lector,
      correo: prestamo.correo,
      libro: prestamo.libro,
      registradoEn: prestamo.registradoEn
    }); */

    
  const evento = construirEventoPrestamoRegistrado(prestamo);

  evento.idCorrelacion = req.idCorrelacion;

  await publicar("prestamo.registrado", evento);

  req.registro.info(
    { prestamoId: prestamo.id },
    "prestamo registrado"
  );
    res.status(201).json(prestamo);
  });

  app.post("/prestamos/:id/devolucion", (req, res) => {
    const prestamo = prestamos.find((p) => p.id === req.params.id);
    if (!prestamo) return res.status(404).json({ error: "prestamo no encontrado" });
    const porDia = Number(process.env.MULTA_POR_DIA || 2);
    try {
      const multa = calcularMulta(Number(req.body.diasRetraso || 0), porDia);
      prestamo.devuelto = true;
      res.json({ ...prestamo, multa });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  
  app.get("/metrics", async (_req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  });


  return app;
}

module.exports = { crearApp };
