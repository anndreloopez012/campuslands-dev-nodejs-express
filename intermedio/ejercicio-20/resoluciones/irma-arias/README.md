# Ejercicio 20: CORS controlado

## Propósito

Permitir que una aplicación de dibujo digital consulte la API solo desde orígenes explícitamente aprobados. CORS regula qué páginas web pueden leer respuestas del servidor desde el navegador.

## Ejecución y prueba

Requiere Node.js 20 o superior. Ejecuta `npm install` y `npm run dev`. El origen `http://localhost:5173` y `https://dibujos.example` están autorizados. `GET /api/palettes` devuelve una paleta. Un origen no listado no recibe el encabezado de acceso CORS.
