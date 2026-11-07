const { calcularMulta } = require("../src/multa")

describe("Pruebas unitarias de multas", () => {

  test("Devolucion a tiempo: multa de 0 Bs", () => {
    expect(calcularMulta(0)).toBe(0);
  });

  test("Tres dias de retraso: multa de 6 Bs", () => {
    expect(calcularMulta(3)).toBe(6);
  });

  test("Cuarenta dias de retraso: multa maxima de 50 Bs", () => {
    expect(calcularMulta(40)).toBe(50);
  });

  test("Dias negativos: debe lanzar un error", () => {
    expect(() => calcularMulta(-1))
      .toThrow("dias de retraso invalidos");
  });

});
