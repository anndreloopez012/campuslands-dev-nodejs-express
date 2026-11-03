# Ejercicio 01: Arquitectura por capas

## Propósito

Organizar una API pequeña de videojuegos RPG separando las responsabilidades de la ruta, el controlador y el servicio. La ruta recibe la petición, el controlador prepara la respuesta HTTP y el servicio contiene la lógica de los héroes.

## Estructura

- `src/routes/heroes.js`: declara los endpoints.
- `src/controllers/heroesController.js`: traduce la petición y responde al cliente.
- `src/services/heroesService.js`: consulta y modifica los datos en memoria.
- `src/app.js`: configura Express y conecta las rutas.
- `src/server.js`: inicia el servidor.

## Ejecución

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

La API se inicia en `http://localhost:3000`.

## Pruebas manuales

- `GET http://localhost:3000/api/heroes` lista los héroes.
- `POST http://localhost:3000/api/heroes` con `Content-Type: application/json` y cuerpo `{"name":"Ayla","class":"mage"}` crea un héroe.
- Un nombre vacío devuelve el estado `400`.

Los datos se guardan solo mientras el proceso está activo; no se utiliza una base de datos.
