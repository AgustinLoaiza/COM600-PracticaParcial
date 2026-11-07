
const request = require("supertest");
const { crearApp } = require("../src/app");

describe("Pruebas de la API de prestamos", () => {

  test("POST valido responde 201 y publica evento", async () => {
    const publicar = jest.fn().mockResolvedValue(true);
    const app = crearApp({ publicar });

    const respuesta = await request(app)
      .post("/prestamos")
      .send({
        lector: "Agustin",
        correo: "agustin@correo.com",
        libro: "Microservicios",
        diasPrestamo: 7
      });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body).toHaveProperty("id");

    expect(publicar).toHaveBeenCalledWith(
      "prestamo.registrado",
      expect.objectContaining({
        prestamoId: respuesta.body.id,
        lector: "Agustin"
      })
    );

  });

  test("POST sin libro responde 400 y no publica", async () => {
    const publicar = jest.fn().mockResolvedValue(true);
    const app = crearApp({ publicar });

    const respuesta = await request(app)
      .post("/prestamos")
      .send({
        lector: "Agustin",
        correo: "agustin@correo.com"
      });

    expect(respuesta.status).toBe(400);
    expect(publicar).not.toHaveBeenCalled();
  });

});


describe("Pruebas de devolucion de prestamos", () => {

  test("Devuelve un prestamo y calcula su multa", async () => {
    const publicar = jest.fn().mockResolvedValue(true);
    const app = crearApp({ publicar });

    // Primero registramos el prestamo
    const registro = await request(app)
      .post("/prestamos")
      .send({
        lector: "Agustin",
        correo: "agustin@correo.com",
        libro: "Microservicios"
      });

    expect(registro.status).toBe(201);

    // Despues registramos su devolucion
    const respuesta = await request(app)
      .post(`/prestamos/${registro.body.id}/devolucion`)
      .send({
        diasRetraso: 3
      });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.multa).toBe(6);
    expect(respuesta.body.devuelto).toBe(true);
  });

});
