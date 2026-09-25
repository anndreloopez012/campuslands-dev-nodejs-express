# BASICO 19 - req.params y req.query

## Descripción

Este ejercicio practica el uso de `req.params` y `req.query` utilizando Node.js y Express.

La temática utilizada es **tatuajes**.

El objetivo es comprender la diferencia entre:

* Parámetros de ruta mediante `req.params`.
* Parámetros de consulta mediante `req.query`.
* Validación básica de datos recibidos desde una petición.
* Separación entre rutas, controladores y servicios.
* Uso de códigos de estado HTTP.
* Organización básica de una API REST.

---

## Tecnologías utilizadas

* Node.js
* Express
* JavaScript
* npm

Se recomienda utilizar Node.js 20 o superior.

---

## Estructura del proyecto

```text
joseph-ramirez/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
└── src/
    ├── app.js
    ├── controllers/
    │   └── tattoos.controller.js
    ├── routes/
    │   └── tattoos.routes.js
    └── services/
        └── tattoos.service.js
```

---

## Instalación

Desde la carpeta del ejercicio:

```bash
npm install
```

---

## Ejecución

Para iniciar normalmente:

```bash
npm start
```

Para ejecutar utilizando `node --watch`:

```bash
npm run dev
```

El servidor estará disponible en:

```text
http://localhost:3000
```

---

## Verificación de sintaxis

Se puede comprobar la sintaxis del archivo principal con:

```bash
npm run check
```

---

# Endpoint de salud

## GET /health

Permite verificar que el servidor está funcionando correctamente.

### Prueba

```bash
curl http://localhost:3000/health
```

### Respuesta esperada

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "req.params y req.query"
}
```

---

# Endpoint principal

## GET /tattoos

Permite obtener todos los tatuajes.

### Prueba

```bash
curl http://localhost:3000/tattoos
```

La respuesta contiene todos los tatuajes disponibles.

---

# req.params

`req.params` permite obtener valores enviados como parte de la ruta.

La ruta utilizada es:

```text
GET /tattoos/:id
```

Por ejemplo:

```text
GET /tattoos/1
```

En este caso:

```javascript
req.params.id
```

contiene:

```text
"1"
```

El controlador convierte ese valor a número:

```javascript
const id = Number(req.params.id);
```

---

## Buscar tatuaje por ID

### Tatuaje 1

```bash
curl http://localhost:3000/tattoos/1
```

### Tatuaje 2

```bash
curl http://localhost:3000/tattoos/2
```

### Tatuaje 3

```bash
curl http://localhost:3000/tattoos/3
```

### Tatuaje 4

```bash
curl http://localhost:3000/tattoos/4
```

### Tatuaje 5

```bash
curl http://localhost:3000/tattoos/5
```

---

## ID inexistente

Prueba:

```bash
curl http://localhost:3000/tattoos/999
```

Debe responder con:

```json
{
  "ok": false,
  "message": "Tatuaje no encontrado"
}
```

El código HTTP esperado es:

```text
404
```

---

## ID inválido

Prueba:

```bash
curl http://localhost:3000/tattoos/abc
```

Debe responder con un error `400`.

También se puede probar:

```bash
curl http://localhost:3000/tattoos/0
```

El objetivo es demostrar que el controlador valida que el ID sea un número entero positivo.

---

# req.query

`req.query` permite recibir parámetros después del signo `?`.

Por ejemplo:

```text
/tattoos?estilo=Tradicional
```

El valor:

```text
Tradicional
```

se puede obtener mediante:

```javascript
req.query.estilo
```

---

# Filtrar por estilo

## Tatuajes tradicionales

```bash
curl "http://localhost:3000/tattoos?estilo=Tradicional"
```

Deben aparecer los tatuajes cuyo estilo sea:

```text
Tradicional
```

---

## Tatuajes de realismo

```bash
curl "http://localhost:3000/tattoos?estilo=Realismo"
```

---

## Tatuajes geométricos

```bash
curl "http://localhost:3000/tattoos?estilo=Geometrico"
```

---

## Tatuajes minimalistas

```bash
curl "http://localhost:3000/tattoos?estilo=Minimalista"
```

---

# Filtrar por artista

También podemos utilizar `req.query` para buscar por artista.

Prueba:

```bash
curl "http://localhost:3000/tattoos?artista=Carlos%20Mendoza"
```

Esto debe devolver los tatuajes realizados por:

```text
Carlos Mendoza
```

---

# Filtrar por zona

También podemos utilizar:

```text
zona
```

como parámetro de consulta.

Prueba:

```bash
curl "http://localhost:3000/tattoos?zona=Brazo"
```

Otro ejemplo:

```bash
curl "http://localhost:3000/tattoos?zona=Espalda"
```

---

# Combinar parámetros query

Una de las ventajas de `req.query` es que podemos enviar varios filtros.

Por ejemplo:

```bash
curl "http://localhost:3000/tattoos?estilo=Tradicional&zona=Brazo"
```

También:

```bash
curl "http://localhost:3000/tattoos?estilo=Tradicional&artista=Carlos%20Mendoza"
```

Y:

```bash
curl "http://localhost:3000/tattoos?artista=Carlos%20Mendoza&zona=Antebrazo"
```

El servicio aplica los filtros recibidos.

---

# Query sin resultados

Prueba:

```bash
curl "http://localhost:3000/tattoos?estilo=Acuarela"
```

En este ejercicio se devuelve una lista vacía porque no existen tatuajes con ese estilo.

La respuesta mantiene el código:

```text
200
```

porque la petición fue válida y simplemente no encontró coincidencias.

Ejemplo:

```json
{
  "ok": true,
  "message": "Tatuajes obtenidos correctamente",
  "total": 0,
  "filtros": {
    "estilo": "Acuarela",
    "artista": null,
    "zona": null
  },
  "data": []
}
```

---

# Ruta inexistente

Prueba:

```bash
curl http://localhost:3000/tattoo
```

Debe responder:

```json
{
  "ok": false,
  "status": 404,
  "message": "Ruta no encontrada"
}
```

También se puede probar:

```bash
curl http://localhost:3000/unknown
```

---

# Diferencia entre req.params y req.query

## req.params

Se utiliza cuando el valor forma parte de la estructura de la ruta.

Ejemplo:

```text
GET /tattoos/3
```

Código:

```javascript
req.params.id
```

Resultado:

```text
3
```

Su uso habitual es identificar un recurso específico.

---

## req.query

Se utiliza para enviar filtros, búsquedas u opciones.

Ejemplo:

```text
GET /tattoos?estilo=Tradicional
```

Código:

```javascript
req.query.estilo
```

Resultado:

```text
Tradicional
```

---

## Comparación

```text
req.params

/tattoos/3
         ↑
       ID del recurso
```

```text
req.query

/tattoos?estilo=Tradicional
         ↑
       filtro
```

Una forma sencilla de recordarlo:

> `req.params` identifica.

> `req.query` filtra o modifica la consulta.

---

# Flujo de una petición

Cuando llega:

```text
GET /tattoos/3
```

el flujo es:

```text
Cliente
   ↓
Express
   ↓
routes/tattoos.routes.js
   ↓
getTattooById()
   ↓
req.params.id
   ↓
tattoos.service.js
   ↓
Busca el tatuaje
   ↓
Controller
   ↓
Respuesta JSON
```

Para una consulta como:

```text
GET /tattoos?estilo=Tradicional
```

el flujo es:

```text
Cliente
   ↓
Express
   ↓
routes/tattoos.routes.js
   ↓
getTattoos()
   ↓
req.query.estilo
   ↓
tattoos.service.js
   ↓
Filtra los tatuajes
   ↓
Controller
   ↓
Respuesta JSON
```

---

# Separación de responsabilidades

## app.js

Se encarga de:

* Crear la aplicación Express.
* Configurar `express.json()`.
* Registrar las rutas.
* Crear `/health`.
* Crear el manejador 404.
* Iniciar el servidor.

---

## routes/tattoos.routes.js

Se encarga de definir las rutas:

```text
GET /
GET /:id
```

No contiene la lógica de negocio.

---

## controllers/tattoos.controller.js

Se encarga de:

* Leer `req.params`.
* Leer `req.query`.
* Validar el ID.
* Llamar al servicio.
* Crear la respuesta HTTP.

---

## services/tattoos.service.js

Se encarga de:

* Mantener los datos.
* Buscar tatuajes.
* Filtrar tatuajes.
* Realizar la lógica relacionada con los datos.

---

# Códigos HTTP utilizados

| Código | Uso                          |
| ------ | ---------------------------- |
| 200    | Petición correcta            |
| 400    | Datos de entrada inválidos   |
| 404    | Recurso o ruta no encontrada |

---

# Pruebas con Postman o Thunder Client

También se puede probar la API utilizando Postman o Thunder Client.

Crear las siguientes peticiones:

```text
GET http://localhost:3000/health
```

```text
GET http://localhost:3000/tattoos
```

```text
GET http://localhost:3000/tattoos/1
```

```text
GET http://localhost:3000/tattoos/999
```

```text
GET http://localhost:3000/tattoos?estilo=Tradicional
```

```text
GET http://localhost:3000/tattoos?zona=Brazo
```

```text
GET http://localhost:3000/tattoos?artista=Carlos%20Mendoza
```

```text
GET http://localhost:3000/tattoos?estilo=Tradicional&zona=Brazo
```

---

# Checklist final

Antes de entregar el ejercicio verificar:

* [ ] El proyecto tiene `package.json`.
* [ ] Express está instalado.
* [ ] Existe `src/app.js`.
* [ ] Existe `routes/`.
* [ ] Existe `controllers/`.
* [ ] Existe `services/`.
* [ ] Existe `README.md`.
* [ ] Existe `.gitignore`.
* [ ] `node_modules/` no se sube al repositorio.
* [ ] `/health` funciona.
* [ ] `/tattoos` funciona.
* [ ] `/tattoos/:id` utiliza `req.params`.
* [ ] Los IDs inválidos generan `400`.
* [ ] Los IDs inexistentes generan `404`.
* [ ] Los filtros utilizan `req.query`.
* [ ] Se pueden combinar varios parámetros query.
* [ ] Se puede ejecutar `npm install`.
* [ ] Se puede ejecutar `npm start`.
* [ ] Se puede ejecutar `npm run dev`.
* [ ] Se puede ejecutar `npm run check`.
* [ ] No se modificaron archivos base.
* [ ] No se modificaron entregas de otros estudiantes.
* [ ] La entrega está dentro de `resoluciones/joseph-ramirez/`.
* [ ] El PR apunta a `dev`.

---

# Git

Cuando hayas terminado y probado correctamente el ejercicio:

```bash
git status
```

Agregar únicamente la entrega:

```bash
git add basico/ejercicio-19/resoluciones/joseph-ramirez/
```

Crear el commit:

```bash
git commit -m "feat: resolver basico 19 req params y req query"
```

Subir la rama:

```bash
git push -u origin alumno/joseph-ramirez/ejercicio-19
```

Después crear el Pull Request:

```text
alumno/joseph-ramirez/ejercicio-19 → dev
```

No crear el Pull Request hacia `main`.

Después de crear el PR, regresar a `dev`:

```bash
git switch dev
git pull origin dev
```
