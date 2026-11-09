# prestamos-api — Kit base del Examen Práctico COM-600 (Segundo Parcial 2/2026)

Servicio de préstamos de la Biblioteca USFX. Es el punto de partida de las cinco tareas del examen.

```bash
npm install          # instala express, jest y supertest
npm start            # API en http://localhost:3000
```

| Ruta | Qué hace |
|---|---|
| GET  /salud | `{ "estado": "ok" }` (para las sondas de Kubernetes) |
| GET  /prestamos | lista los préstamos |
| POST /prestamos | registra `{ lector, correo, libro, diasPrestamo? }` → 201 / 400 |
| POST /prestamos/:id/devolucion | `{ diasRetraso }` → calcula la multa → 200 / 400 / 404 |

Archivos con `TODO`: `src/app.js`, `src/server.js`, `src/eventos.js`.
`src/multa.js` tiene un defecto a propósito: encuéntrelo con una prueba (Tarea 1).
Sin la variable `RABBITMQ_URL` el servicio arranca igual y no publica eventos.

instalar amqplib
npm install amqplib
export RABBITMQ_URL="amqp://admin:admin123@localhost:5672"

# Reiniciar el Docker compose
docker compose restart prometheus

# Iniciar serviodr de Rabbitmq
export RABBITMQ_URL="amqp://admin:admin123@localhost:5672"
npm start

# ejecutar el consumidor
export RABBITMQ_URL="amqp://admin:admin123@localhost:5672"
node avisos.js

# Registros JSON
npm install pino

# Instalar prom-client
npm install prom-client

# Generador de solicitudes para analizar informacion y hacer consultas en prometheus

for i in {1..20}; do
  curl -s -o /dev/null -X POST http://localhost:3000/prestamos \
    -H "Content-Type: application/json" \
    -d "{\"lector\":\"Lector$i\",\"correo\":\"lector$i@correo.com\",\"libro\":\"Microservicios\"}"
  sleep 0.2
done

# Generador de Solicitudes Incorrectas

for i in {1..120}; do
  curl -s -o /dev/null -X POST http://localhost:3000/prestamos \
    -H "Content-Type: application/json" \
    -d '{"lector":"Agustin","correo":"agustin@correo.com"}'
  sleep 0.5
done


# Consulta para calcular el precentil 95

histogram_quantile(
  0.95,
  sum by (le) (
    rate(
      http_request_duration_seconds_bucket{
        metodo="POST",
        ruta="/prestamos"
      }[5m]
    )
  )
)

# Tasa de prestamos registrados

rate(prestamos_registrados_total[1m])
