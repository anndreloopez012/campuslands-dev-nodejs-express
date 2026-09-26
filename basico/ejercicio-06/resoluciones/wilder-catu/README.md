# Motos y Mecánica - Path y rutas seguras

## Descripción

Este proyecto es un ejercicio básico de backend con Node.js relacionado con motos y mecánica.

El objetivo principal es aprender a utilizar el módulo nativo `path` para construir rutas de archivos de forma segura y compatible con diferentes sistemas operativos.

También se utiliza el módulo `fs` para leer la información de las motos almacenada en un archivo JSON.

No se utiliza Express. El servidor se construye utilizando los módulos nativos de Node.js.

## Tecnologías

- Node.js 20+
- JavaScript
- Módulo `http`
- Módulo `fs`
- Módulo `path`
- JSON

## Instalación

Clonar o descargar el proyecto y entrar en su carpeta:

```bash
cd motos-mecanica-path
```

Instalar las dependencias:

```bash
npm install
```

Este proyecto no necesita dependencias externas, por lo que `npm install` no instalará paquetes adicionales.

## Ejecución

Para iniciar el servidor:

```bash
npm start
```

Para ejecutar el servidor utilizando `node --watch`:

```bash
npm run dev
```

Para comprobar que el código JavaScript no tenga errores de sintaxis:

```bash
npm run check
```

El servidor estará disponible en:

```text
http://localhost:3000
```

## ¿Qué es `path`?

`path` es un módulo nativo de Node.js que permite trabajar con rutas de archivos y directorios.

En este proyecto se utiliza:

```js
const path = require("path");
```

Después se construye la ubicación del archivo JSON:

```js
const archivoMotos = path.join(__dirname, "data", "motos.json");
```

`path.join()` combina las diferentes partes de la ruta utilizando el formato correcto del sistema operativo.

Esto es preferible a construir una ruta manualmente:

```js
const archivo = __dirname + "/data/motos.json";
```

La utilización de `path.join()` permite que el código sea más seguro y portable.

## ¿Qué representa `__dirname`?

`__dirname` representa la ruta absoluta del directorio donde se encuentra el archivo JavaScript actual.

Por ejemplo:

```js
console.log(__dirname);
```

puede mostrar una ruta similar a:

```text
/home/usuario/motos-mecanica-path
```

Por eso:

```js
path.join(__dirname, "data", "motos.json");
```

termina apuntando al archivo:

```text
motos-mecanica-path/data/motos.json
```

## Rutas de la API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Muestra las rutas disponibles |
| GET | `/motos` | Obtiene todas las motos |
| GET | `/motos/:id` | Obtiene una moto específica |

## Ejemplos

### Obtener información de la API

```bash
curl http://localhost:3000/
```

### Obtener todas las motos

```bash
curl http://localhost:3000/motos
```

### Obtener una moto

```bash
curl http://localhost:3000/motos/1
```

Resultado:

```json
{
    "id": 1,
    "marca": "Yamaha",
    "modelo": "MT-07",
    "cilindraje": 689,
    "tipo": "Naked",
    "estado": "Disponible"
}
```

### Buscar una moto inexistente

```bash
curl http://localhost:3000/motos/99
```

Respuesta:

```json
{
    "error": "Moto no encontrada"
}
```

### Utilizar un ID inválido

```bash
curl http://localhost:3000/motos/abc
```

Respuesta:

```json
{
    "error": "El ID de la moto debe ser un número"
}
```

## Flujo del programa

El funcionamiento básico es:

```text
Cliente
   |
   v
Servidor Node.js
   |
   v
Ruta solicitada
   |
   v
path.join()
   |
   v
data/motos.json
   |
   v
fs.readFileSync()
   |
   v
JSON.parse()
   |
   v
Respuesta JSON
```

## Conceptos aprendidos

### 1. Crear un servidor

Se utiliza el módulo `http`:

```js
const http = require("http");
```

### 2. Construir rutas seguras

Se utiliza:

```js
path.join(__dirname, "data", "motos.json");
```

### 3. Leer archivos

Se utiliza:

```js
fs.readFileSync(archivoMotos, "utf-8");
```

### 4. Convertir JSON

El contenido del archivo se convierte en un objeto JavaScript:

```js
JSON.parse(contenido);
```

### 5. Validar parámetros

Antes de buscar una moto se comprueba que el ID sea numérico:

```js
/^\d+$/.test(id)
```

### 6. Manejar errores HTTP

El servidor utiliza diferentes códigos:

- `200`: solicitud correcta.
- `400`: solicitud incorrecta.
- `404`: recurso o ruta no encontrada.
- `500`: error interno al leer los datos.

## Conclusión

El proyecto demuestra cómo utilizar `path` para construir rutas de archivos de manera segura y portable dentro de una aplicación Node.js.

La API mantiene una estructura pequeña para concentrarse en el concepto principal del ejercicio: trabajar correctamente con rutas de archivos utilizando `path.join()`.