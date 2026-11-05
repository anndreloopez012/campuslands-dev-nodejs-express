# Taller de motos

API de gestión de motocicletas y órdenes de mantenimiento con validación, reglas de transición, paginación, manejo uniforme de errores y persistencia en memoria.

## Requisitos y ejecución

- Node.js 20 o superior
- npm

```bash
npm install
npm test
npm start
```

El servidor escucha en `PORT` o en el puerto `3000`.

## Rutas

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/health` | Estado de la API |
| GET | `/api/motorcycles?page=1&limit=10` | Lista motocicletas |
| POST | `/api/motorcycles` | Registra motocicleta |
| GET | `/api/work-orders?page=1&limit=10` | Lista órdenes |
| POST | `/api/work-orders` | Abre una orden para una motocicleta existente |
| PATCH | `/api/work-orders/:id/status` | Avanza el estado de una orden |

Una motocicleta requiere `plate`, `make`, `model` y `year`. Una orden requiere `motorcycleId`, `description` y `estimatedCost`. Los estados permitidos son `in_progress`, `completed` y `cancelled`; una orden cerrada no puede cambiarse.

```bash
curl -X POST http://localhost:3000/api/motorcycles -H "Content-Type: application/json" -d '{"plate":"MOTO-104","make":"Honda","model":"CB500","year":2024}'
```

Los datos se conservan mientras el proceso está activo y se reinician al detenerlo. La API responde con errores JSON consistentes y no depende de servicios externos.
