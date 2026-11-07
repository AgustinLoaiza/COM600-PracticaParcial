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
