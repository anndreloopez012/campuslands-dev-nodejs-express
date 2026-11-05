# Básico - Ejercicio 24: CRUD Básico
> **Autor:** Anderson Oloroso | **Temática:** Fórmulas químicas | **Tema:** CRUD basico

## Descripción
API REST completa que implementa las 4 operaciones fundamentales CRUD (Create, Read, Update, Delete) sobre un catálogo de compuestos y fórmulas químicas.

## Instalación y ejecución
```bash
cd basico/ejercicio-24/resoluciones/anderson-oloroso
npm install
npm start      # producción
npm run dev    # desarrollo con recarga
```

## Endpoints CRUD
- `GET /basico/ejercicio-24` - Health check.
- `GET /api/chemistry/formulas` - Listar todas las fórmulas.
- `GET /api/chemistry/formulas/:id` - Obtener una fórmula por ID.
- `POST /api/chemistry/formulas` - Crear nueva fórmula química (201 Created).
- `PUT /api/chemistry/formulas/:id` - Actualizar fórmula existente (200 OK).
- `DELETE /api/chemistry/formulas/:id` - Eliminar fórmula (200 OK).

### Ejemplo POST /api/chemistry/formulas
```bash
curl -X POST http://localhost:3000/api/chemistry/formulas \
  -H "Content-Type: application/json" \
  -d '{"nombreComun":"Ácido Sulfúrico","formula":"H2SO4","masaMolarGmol":98.079,"estado":"Líquido"}'
```

## Estructura
```text
basico/ejercicio-24/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── chemistry.controller.js
    ├── routes/
    │   └── chemistry.routes.js
    └── services/
        └── chemistry.service.js
```
