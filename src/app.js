const express = require("express");
const { calcularMulta } = require("./multa");

// publicar(clave, evento) se inyecta desde server.js: así las pruebas
// pueden pasar una función falsa (jest.fn) sin necesitar el broker.
function crearApp({ publicar = async () => {} } = {}) {
  const app = express();
  app.use(express.json());
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
    // TODO Tarea 2: publicar el evento PrestamoRegistrado con la clave prestamo.registrado
    await publicar("prestamo.registrado", {
      prestamoId: prestamo.id,
      lector: prestamo.lector,
      correo: prestamo.correo,
      libro: prestamo.libro,
      registradoEn: prestamo.registradoEn
    });

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

  return app;
}

module.exports = { crearApp };
