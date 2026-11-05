# Básico - Ejercicio 23: Datos en Memoria
> **Autor:** Anderson Oloroso | **Temática:** Soldadura | **Tema:** Datos en memoria

## Descripción
API REST que implementa un almacén estructurado de datos en memoria para el registro y consulta de trabajos de soldadura industrial (TIG, MIG/MAG, electrodo revestido).

## Instalación y ejecución
```bash
cd basico/ejercicio-23/resoluciones/anderson-oloroso
npm install
npm start      # producción
npm run dev    # desarrollo con recarga
```

## Endpoints
- `GET /basico/ejercicio-23` - Endpoint verificador del tema.
- `GET /api/welding/jobs` - Listar todos los trabajos en memoria.
- `POST /api/welding/jobs` - Crear un nuevo trabajo en memoria.

### Ejemplo POST /api/welding/jobs
```bash
curl -X POST http://localhost:3000/api/welding/jobs \
  -H "Content-Type: application/json" \
  -d '{"tipo":"TIG","material":"Aluminio 6061","amperaje":140,"espesorMm":4.0,"operador":"Anderson O."}'
```
```json
{
  "ok": true,
  "message": "Trabajo de soldadura registrado en memoria",
  "data": { "id": 3, "tipo": "TIG", "material": "Aluminio 6061", "amperaje": 140, "espesorMm": 4 }
}
```

## Estructura
```text
basico/ejercicio-23/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── welding.controller.js
    ├── routes/
    │   └── welding.routes.js
    └── services/
        └── welding.service.js
```
