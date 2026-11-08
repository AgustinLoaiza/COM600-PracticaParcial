
const amqp = require("amqplib");

async function iniciarConsumidor() {
  const URL = process.env.RABBITMQ_URL;

  if (!URL) {
    throw new Error("RABBITMQ_URL no esta definida");
  }

  const conexion = await amqp.connect(URL);
  const canal = await conexion.createChannel();

  // Exchange principal
  await canal.assertExchange("biblioteca", "topic", {
    durable: true
  });

  // Exchange de mensajes muertos
  await canal.assertExchange(
    "biblioteca.muertos",
    "fanout",
    { durable: true }
  );

  // Cola de mensajes muertos
  await canal.assertQueue("avisos.muertos", {
    durable: true
  });

  // Enlazar la cola de muertos a su exchange
  await canal.bindQueue(
    "avisos.muertos",
    "biblioteca.muertos",
    ""
  );

  // Cola principal con DLQ
  await canal.assertQueue("avisos.correo", {
    durable: true,
    deadLetterExchange: "biblioteca.muertos"
  });

  await canal.bindQueue(
    "avisos.correo",
    "biblioteca",
    "prestamo.*"
  );

  await canal.prefetch(1);

  console.log("[avisos] Esperando mensajes...");

  await canal.consume(
    "avisos.correo",
    async (mensaje) => {
      if (!mensaje) return;

      try {
        const evento = JSON.parse(
          mensaje.content.toString()
        );

        // Validar correo
        if (
          !evento.correo ||
          !evento.correo.includes("@")
        ) {
          console.error(
            "[avisos] Correo invalido:",
            evento.correo
          );

          // Rechazar sin reencolar
          canal.nack(mensaje, false, false);
          return;
        }

        // Simular envio de correo
        console.log(
          `[avisos] Correo enviado a ${evento.correo}`
        );

        console.log(
          `[avisos] Prestamo: ${evento.prestamoId}`
        );

        canal.ack(mensaje);

      } catch (error) {
        console.error(
          "[avisos] Error:",
          error.message
        );

        canal.nack(mensaje, false, false);
      }
    },
    { noAck: false }
  );
}

iniciarConsumidor().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
