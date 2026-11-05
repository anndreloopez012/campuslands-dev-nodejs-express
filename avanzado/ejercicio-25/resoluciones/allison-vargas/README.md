# Integración RPG

API de misiones RPG con pruebas de integración para validar las rutas, las reglas de negocio y las respuestas HTTP.

## Requisitos

- Node.js 20 o superior
- npm

## Instalación y ejecución

```bash
npm install
npm test
npm start
```

La API escucha en `http://localhost:3000`.

## Endpoints

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/health` | Estado del servicio |
| GET | `/api/missions` | Lista misiones; acepta `status` |
| POST | `/api/missions` | Crea una misión |
| PATCH | `/api/missions/:id/complete` | Completa una misión pendiente |

Ejemplo de creación:

```bash
curl -X POST http://localhost:3000/api/missions -H "Content-Type: application/json" -d '{"title":"Explorar las ruinas","region":"Valle Norte","level":4,"reward":250}'
```

Los datos viven en memoria y se reinician al reiniciar el proceso. Las pruebas crean una aplicación independiente y verifican el flujo HTTP completo sin abrir un puerto.
