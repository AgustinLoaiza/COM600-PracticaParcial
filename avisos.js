
const amqp = require("amqplib");

// Funcion para generar registros estructurados en JSON
function registrar(nivel, mensaje, datos = {}) {
  const registro = {
    nivel,
    time: new Date().toISOString(),
    servicio: "avisos",
    ...datos,
    msg: mensaje
  };

  console.log(JSON.stringify(registro));
}

async function iniciarConsumidor() {
  const URL = process.env.RABBITMQ_URL;

  if (!URL) {
    throw new Error("RABBITMQ_URL no esta definida");
  }

  // 1. Conectar con RabbitMQ
  const conexion = await amqp.connect(URL);
  const canal = await conexion.createChannel();

  // 2. Exchange principal
  await canal.assertExchange("biblioteca", "topic", {
    durable: true
  });

  // 3. Exchange de mensajes muertos
  await canal.assertExchange(
    "biblioteca.muertos",
    "fanout",
    { durable: true }
  );

  // 4. Cola de mensajes muertos
  await canal.assertQueue("avisos.muertos", {
    durable: true
  });

  // 5. Enlazar la cola de muertos a su exchange
  await canal.bindQueue(
    "avisos.muertos",
    "biblioteca.muertos",
    ""
  );

  // 6. Cola principal con DLQ
  await canal.assertQueue("avisos.correo", {
    durable: true,
    deadLetterExchange: "biblioteca.muertos"
  });

  // 7. Enlazar cola principal al exchange
  await canal.bindQueue(
    "avisos.correo",
    "biblioteca",
    "prestamo.*"
  );

  // 8. Procesar un mensaje sin confirmar a la vez
  await canal.prefetch(1);

  registrar("info", "Esperando mensajes de RabbitMQ");

  // 9. Consumir mensajes
  await canal.consume(
    "avisos.correo",
    async (mensaje) => {
      if (!mensaje) return;

      let evento;

      try {
        // Convertir el mensaje JSON en objeto
        evento = JSON.parse(
          mensaje.content.toString()
        );

        // 10. Validar el correo
        if (
          !evento.correo ||
          !evento.correo.includes("@")
        ) {
          registrar("error", "correo invalido", {
            idCorrelacion: evento.idCorrelacion,
            prestamoId: evento.prestamoId,
            correo: evento.correo
          });

          // Rechazar sin reencolar y enviar a DLQ
          canal.nack(mensaje, false, false);
          return;
        }

        // 11. Simular envio del aviso por correo
        registrar("info", "aviso procesado", {
          idCorrelacion: evento.idCorrelacion,
          prestamoId: evento.prestamoId,
          correo: evento.correo
        });

        // 12. Confirmar despues de procesar
        canal.ack(mensaje);

      } catch (error) {
        registrar("error", "error al procesar mensaje", {
          idCorrelacion: evento?.idCorrelacion,
          prestamoId: evento?.prestamoId,
          error: error.message
        });

        // Rechazar mensaje sin reencolar
        canal.nack(mensaje, false, false);
      }
    },
    { noAck: false }
  );
}

// Iniciar el consumidor
iniciarConsumidor().catch((error) => {
  registrar("error", "no se pudo iniciar consumidor", {
    error: error.message
  });

  process.exit(1);
});
