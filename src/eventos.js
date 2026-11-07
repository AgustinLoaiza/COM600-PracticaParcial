// Tarea 1.4 y Tarea 2: construir el evento que se publica cuando se registra un préstamo.
// Debe cumplir el contrato contratos/prestamo-registrado.contrato.json
const { randomUUID } = require("crypto");

function construirEventoPrestamoRegistrado(prestamo) {
  // TODO: completar
  return {
    idEvento: randomUUID(),
    tipo: "PrestamoRegistrado",
    prestamoId: prestamo.id,
    lector: prestamo.lector,
    correo: prestamo.correo || "",
    libro: prestamo.libro,
    registradoEn: prestamo.registradoEn
  };
}

module.exports = { construirEventoPrestamoRegistrado };
