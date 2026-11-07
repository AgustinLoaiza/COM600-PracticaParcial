const { crearApp } = require("./app");

const PORT = process.env.PORT || 3000;

// Sin RABBITMQ_URL el servicio arranca igual y no publica nada
// (así puede correr en Kubernetes sin el broker).
async function crearPublicador() {
  if (!process.env.RABBITMQ_URL) {
    console.warn("[prestamos] RABBITMQ_URL no definida: los eventos no se publican");
    return async () => {};
  }
  // TODO Tarea 2: conectar con amqplib y devolver la función publicar(clave, evento)
  return async () => {};
}

crearPublicador()
  .then((publicar) => {
    const app = crearApp({ publicar });
    app.listen(PORT, () => console.log("[prestamos] API en el puerto " + PORT));
  })
  .catch((e) => {
    console.error("no se pudo iniciar:", e.message);
    process.exit(1);
  });
