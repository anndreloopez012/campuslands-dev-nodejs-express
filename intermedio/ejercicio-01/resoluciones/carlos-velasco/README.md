# INTERMEDIO 01 - Arquitectura por capas

## Objetivo

Crear una API Node.js con Express que demuestre la separacion de responsabilidades en capas: rutas, controladores y servicios.

## Concepto principal

Cada capa cumple un rol unico dentro de la API:

- **routes**: define las URLs y el metodo HTTP de cada endpoint.
- **controllers**: recibe la peticion, decide el codigo de respuesta HTTP y delega la logica.
- **services**: contiene la logica de negocio y los datos en memoria.

Con esta separacion, cambiar la logica de negocio no rompe el HTTP y cambiar el HTTP no rompe el negocio.

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── routes/
    │   └── heroes.routes.js
    ├── controllers/
    │   └── heroes.controller.js
    └── services/
        └── heroes.service.js
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
| GET | /heroes | Lista todos los heroes | 200 |
| GET | /heroes/:id | Obtiene un heroe por id | 200 / 404 |
| POST | /heroes | Crea un heroe nuevo | 201 / 400 |
| DELETE | /heroes/:id | Elimina un heroe | 200 / 404 |

## Ejemplos de peticiones

```bash
# Estado del servidor
curl http://localhost:3000/health

# Listar heroes
curl http://localhost:3000/heroes

# Obtener heroe por id
curl http://localhost:3000/heroes/1

# Crear heroe
curl -X POST http://localhost:3000/heroes \
  -H "Content-Type: application/json" \
  -d '{"name": "Rurik", "clase": "clerigo", "nivel": 8, "hp": 150}'

# Caso de error: clase invalida (responde 400)
curl -X POST http://localhost:3000/heroes \
  -H "Content-Type: application/json" \
  -d '{"name": "Error", "clase": "pirata", "nivel": 1, "hp": 100}'

# Eliminar heroe
curl -X DELETE http://localhost:3000/heroes/3
```

## Validaciones implementadas

- `name`: obligatorio, texto de al menos 3 caracteres.
- `clase`: debe pertenecer al catalogo de clases validas.
- `nivel`: entero entre 1 y 100.
- `hp`: entero mayor a 0.

## Codigos HTTP usados

- `200`: consulta o eliminacion correcta.
- `201`: recurso creado.
- `400`: datos de entrada invalidos (validacion del servicio).
- `404`: heroe no encontrado o ruta inexistente.
