# Ejercicio 14 - API de Libros

## Temática

Libros.

## Objetivo

Crear una pequeña API REST utilizando **Node.js** y **Express** para practicar la **validación de entrada**.

La API permite consultar libros y registrar nuevos libros verificando que los datos recibidos tengan los campos y tipos correctos.

## Tecnologías utilizadas

* Node.js
* Express
* JavaScript
* API REST
* JSON
* Validación de entrada

## Estructura del proyecto

```text
joseluis-herrera/
├── src/
│   ├── app.js
│   └── libros.js
├── package.json
└── README.md
```

## Instalación

Entrar a la carpeta del proyecto:

```bash
cd basico/ejercicio-14/resoluciones/joseluis-herrera/
```

Inicializar el proyecto:

```bash
npm init -y
```

Instalar Express:

```bash
npm install express
```

Configurar el proyecto para utilizar módulos ES:

```bash
npm pkg set type=module
```

Configurar el comando para iniciar la aplicación:

```bash
npm pkg set scripts.start="node src/app.js"
```

## Ejecución

Para iniciar el servidor:

```bash
npm start
```

El servidor estará disponible en:

```text
http://localhost:3000
```

# Endpoints

## Obtener todos los libros

**Método:**

```text
GET
```

**Ruta:**

```text
/libros
```

**URL:**

```text
http://localhost:3000/libros
```

### Respuesta

```json
[
    {
        "id": 1,
        "titulo": "Cien años de soledad",
        "autor": "Gabriel García Márquez",
        "anio": 1967
    }
]
```

## Crear un libro

**Método:**

```text
POST
```

**Ruta:**

```text
/libros
```

**URL:**

```text
http://localhost:3000/libros
```

### Body

```json
{
    "titulo": "El Hobbit",
    "autor": "J.R.R. Tolkien",
    "anio": 1937
}
```

### Respuesta

```json
{
    "id": 2,
    "titulo": "El Hobbit",
    "autor": "J.R.R. Tolkien",
    "anio": 1937
}
```

## Autor

Jose Luis Herrera
