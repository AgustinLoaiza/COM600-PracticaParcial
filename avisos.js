
const amqp = require("amqplib");

async function iniciarConsumidor() {
  const URL = process.env.RABBITMQ_URL;

  if (!URL) {
    throw new Error("RABBITMQ_URL no esta definida");
  }

  // 1. Conectar con RabbitMQ
  const conexion = await amqp.connect(URL);
  const canal = await conexion.createChannel();

  // 2. Declarar exchange
  await canal.assertExchange("biblioteca", "topic", {
    durable: true
  });

  // 3. Declarar cola durable
  await canal.assertQueue("avisos.correo", {
    durable: true
  });

  // 4. Enlazar cola con exchange
  await canal.bindQueue(
    "avisos.correo",
    "biblioteca",
    "prestamo.*"
  );

  // 5. Un mensaje sin confirmar a la vez
  await canal.prefetch(1);

  console.log("[avisos] Esperando mensajes...");

  // 6. Consumir mensajes
  await canal.consume(
    "avisos.correo",
    async (mensaje) => {
      if (!mensaje) return;

      try {
        const evento = JSON.parse(
          mensaje.content.toString()
        );

        // Simular envio del aviso
        console.log(
          `[avisos] Correo enviado a ${evento.correo}`
        );

        console.log(
          `[avisos] Prestamo: ${evento.prestamoId}`
        );

        // Confirmar despues de procesar
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
