const { crearApp } = require("./app");
const amqp = require("amqplib")
const PORT = process.env.PORT || 3000;

// Sin RABBITMQ_URL el servicio arranca igual y no publica nada
// (así puede correr en Kubernetes sin el broker).
async function crearPublicador() {
  if (!process.env.RABBITMQ_URL) {
    console.warn("[prestamos] RABBITMQ_URL no definida: los eventos no se publican");
    return async () => {};
  }
  // TODO Tarea 2: conectar con amqplib y devolver la función publicar(clave, evento)

  // Conectar con RabbitMQ
  const conexion = await amqp.connect(process.env.RABBITMQ_URL);

  // Crear canal
  const canal = await conexion.createChannel();

  // Declarar el exchange
  await canal.assertExchange("biblioteca", "topic", {
    durable: true
  });

  console.log("[prestamos] Conectado a RabbitMQ");

  // Funcion que utiliza app.js para publicar eventos
  return async (clave, evento) => {
    canal.publish(
      "biblioteca",
      clave,
      Buffer.from(JSON.stringify(evento)),
      {
        persistent: true,
        contentType: "application/json"
      }
    );
  };
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
