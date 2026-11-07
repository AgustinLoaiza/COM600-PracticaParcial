
const { construirEventoPrestamoRegistrado } = require("../src/eventos");

const contrato = require(
  "../contratos/prestamo-registrado.contrato.json"
);

describe("Contrato del evento PrestamoRegistrado", () => {

  test("Cumple con los campos y tipos obligatorios", () => {

    const prestamo = {
      id: "PRE-1",
      lector: "Agustin",
      correo: "agustin@correo.com",
      libro: "Microservicios",
      registradoEn: new Date().toISOString()
    };

    const evento = construirEventoPrestamoRegistrado(prestamo);

    for (const campo of contrato.camposObligatorios) {
      expect(evento).toHaveProperty(campo);
      expect(typeof evento[campo]).toBe(contrato.tipos[campo]);
    }

    expect(evento.tipo).toBe(contrato.evento);
  });

});
