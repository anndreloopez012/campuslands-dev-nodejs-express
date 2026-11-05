# Intermedio - Ejercicio 12: Subrecursos REST
> **Autor:** Anderson Oloroso | **Temática:** Películas de miedo | **Tema:** Subrecursos REST

## Descripción
Modela una relación jerárquica padre-hijo mediante **Subrecursos REST**, donde las críticas (`reviews`) son subrecursos subordinados de una película específica identificada por su ID (`/api/movies/:id/reviews`).

## Instalación y ejecución
```bash
cd intermedio/ejercicio-12/resoluciones/anderson-oloroso
npm install
npm start
npm run dev
```

## Endpoints
- `GET /intermedio/ejercicio-12` -> Verificación del tema.
- `GET /api/movies/:id/reviews` -> Listar críticas de una película.
- `POST /api/movies/:id/reviews` -> Agregar una crítica a la película.

### Ejemplo POST /api/movies/1/reviews
```bash
curl -X POST http://localhost:3000/api/movies/1/reviews \
  -H "Content-Type: application/json" \
  -d '{"autor":"Marcos Terror","calificacion":8,"comentario":"Sustos genuinos y gran dirección sonora."}'
```

## Estructura
```text
intermedio/ejercicio-12/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── horror.controller.js
    ├── routes/
    │   └── horror.routes.js
    └── services/
        └── horror.service.js
```
