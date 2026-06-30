# AVANZADO 27 - manejo de configuracion avanzada

## Dificultad

Avanzado integrador

## Tematica usada

MOBA esports

## Contexto del problema

Estas construyendo una solucion backend con Node.js y Express para un escenario relacionado con MOBA esports. El objetivo es aprender paso a paso como se piensa, organiza y prueba una API real sin saltar conceptos importantes.

Este ejercicio se enfoca en manejo de configuracion avanzada. No se busca hacer una aplicacion gigante, sino dominar una pieza concreta del backend profesional.

## Objetivo

Crear una pequena solucion Node.js/Express que demuestre el concepto del ejercicio, con codigo ordenado, rutas claras, validacion basica y documentacion de uso.

## Que vas a practicar

- Analisis de requerimientos backend.
- Estructura de carpetas en proyectos Node.js.
- Uso correcto de rutas, controladores y servicios.
- Manejo de datos de entrada y salida.
- Respuestas HTTP claras.
- Lectura de errores y depuracion.
- Documentacion tecnica para otros desarrolladores.

## Explicacion paso a paso

1. Lee el problema completo antes de crear archivos.
2. Define que endpoint o comando necesitas construir.
3. Identifica los datos de entrada.
4. Define la respuesta esperada.
5. Crea la estructura minima del proyecto.
6. Implementa primero el caso feliz.
7. Agrega validaciones y casos de error.
8. Prueba manualmente con navegador, Thunder Client, Postman o curl.
9. Documenta como ejecutar y probar.

## Instrucciones detalladas

1. Crea tu carpeta en `resoluciones/nombre-apellido/`.
2. Dentro de tu carpeta crea un mini proyecto Node.js.
3. Debe existir un `package.json` con scripts utiles.
4. Debe existir una carpeta `src/`.
5. Implementa el ejercicio usando Node.js y Express cuando aplique.
6. Incluye un `README.md` de tu entrega.
7. Agrega ejemplos de peticiones o comandos.
8. No uses bases de datos externas a menos que el instructor lo pida.

## Requisitos tecnicos minimos

- Node.js 20 o superior recomendado.
- Express cuando el ejercicio requiera servidor HTTP.
- No subir `node_modules/`.
- No subir `.env` con secretos reales.
- Usar nombres de archivos claros y en minusculas.

## Ejemplo esperado

Ruta sugerida:

```text
/avanzado/ejercicio-27
```

Respuesta ejemplo:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "manejo de configuracion avanzada"
}
```

## Entregable esperado

```text
avanzado/ejercicio-27/resoluciones/nombre-apellido/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── routes/
    ├── controllers/
    └── services/
```

La estructura puede ser mas simple en los primeros ejercicios, pero debe crecer con orden cuando el ejercicio lo pida.

## Reglas

- No modifiques archivos base del ejercicio.
- No borres entregas de otros estudiantes.
- No subas dependencias generadas.
- No abras PR hacia `main`.
- Tu PR debe apuntar a `dev`.
- Tu entrega debe vivir dentro de `resoluciones/nombre-apellido/`.

## Consejos

- Empieza con una ruta simple y luego agrega complejidad.
- Separa logica de negocio de la respuesta HTTP.
- Usa codigos HTTP coherentes.
- Documenta los comandos que usaste para probar.
- Si algo falla, lee el error completo antes de cambiar codigo.

## Errores comunes

- Poner toda la logica en `server.js` cuando ya se pide separar capas.
- Subir `node_modules/`.
- No validar `req.body`.
- Responder siempre status 200 aunque haya error.
- No documentar como ejecutar el proyecto.

## Pistas opcionales

- Usa `npm init -y` para iniciar rapido.
- Usa `npm run dev` si configuras `node --watch`.
- Prueba primero una ruta `GET /health`.
- Si hay CRUD, implementa primero listar y crear.

## Como validar si quedo bien

Tu entrega esta bien si:

- Instala dependencias con `npm install`.
- Ejecuta con el script indicado.
- Responde correctamente al endpoint principal.
- Maneja al menos un error esperado.
- Esta dentro de tu carpeta personal.
- No modifica archivos base ni entregas ajenas.
