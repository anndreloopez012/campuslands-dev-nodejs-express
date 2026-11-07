# INTERMEDIO 03 - Controladores limpios

## Objetivo

Crear una API Node.js con Express donde los controladores sean funciones con una sola responsabilidad: traducir peticiones HTTP en llamadas a servicios, sin logica de negocio.

## Concepto principal

Un controlador limpio cumple tres reglas:

1. **Una funcion por accion** (listar, obtener, crear, eliminar). Nada mas.
2. **Cero logica de negocio**: todas las validaciones y reglas viven en el servicio.
3. **Errores delegados con `next`**: el controlador no decide el formato del error, lo envia al middleware centralizado.

El servicio lanza errores tipados (`ValidationError`, `NotFoundError`) que el middleware de errores convierte en respuestas HTTP coherentes. Asi el controlador queda de solo lectura y testeable.

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── errors/
    │   └── app.error.js
    ├── middlewares/
    │   └── error.handler.js
    ├── routes/
    │   └── champions.routes.js
    ├── controllers/
    │   └── champions.controller.js
    └── services/
        └── champions.service.js
```

## Como ejecutar

```bash
npm install
npm run start   # produccion
npm run dev     # desarrollo con recarga automatica
```

## Endpoints

| Metodo | Ruta | Descripcion | Codigo |
| ------ | ---- | ----------- | ------ |
| GET | /health | Verifica el estado del servidor | 200 |
| GET | /champions | Lista todos los campeones | 200 |
| GET | /champions/:id | Obtiene un campeon por id | 200 |
| POST | /champions | Crea un campeon | 201 |
| DELETE | /champions/:id | Elimina un campeon | 200 |
| * | rutas inexistentes | Ruta no encontrada | 404 |

## Ejemplos de peticiones

```bash
# Listar campeones
curl http://localhost:3000/champions

# Obtener campeon (error tipado NotFoundError si no existe -> 404)
curl http://localhost:3000/champions/999

# Crear campeon
curl -X POST http://localhost:3000/champions \
  -H "Content-Type: application/json" \
  -d '{"name": "Orion", "rol": "mago", "danioBase": 55, "dificultad": "media"}'

# Caso de error de validacion -> 400 { error: "ValidationError", ... }
curl -X POST http://localhost:3000/champions \
  -H "Content-Type: application/json" \
  -d '{"name": "X", "rol": "piloto", "danioBase": 55, "dificultad": "media"}'

# Eliminar campeon
curl -X DELETE http://localhost:3000/champions/2
```

## Punto clave

El error nunca llega crudo al cliente: toda respuesta de error pasa por `error.handler.js`, que responde `{ ok, error, message }` y oculta el stack de excepciones no controladas (500).
