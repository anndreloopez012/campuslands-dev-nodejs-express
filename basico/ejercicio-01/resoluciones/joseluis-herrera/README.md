# Ejercicio 01 

## Descripción
En este ejercicio se creó un pequeño programa utilizando **Node.js** que realiza una petición a una API pública de Pokémon.
El programa consulta información específica de **Pikachu** y muestra en la consola algunos de sus datos, como:

* ID
* Altura
* Peso
* Nombre
* Información adicional del Pokémon
---

## 📁 Estructura del proyecto

```text
ejercicio-01/
│
├── 📁 plantilla/
│   └── README.md
│
└── 📁 resoluciones/
    │
    └── 📁 joseluis-herrera/
        │
        ├── 📁 src/
        │   └── app.js
        │
        ├── 📄 package.json
        ├── 📄 package-lock.json
        └── 📄 README.md
```

## Archivos principales

| Archivo             | Descripción                                                            |
| ------------------- | ---------------------------------------------------------------------- |
| `src/app.js`        | Contiene el código JavaScript que realiza la petición a la API.        |
| `package.json`      | Contiene la configuración del proyecto y los comandos para ejecutarlo. |
| `package-lock.json` | Guarda las versiones exactas de las dependencias instaladas.           |
| `README.md`         | Documentación del ejercicio.                                           |

---

## Cómo ejecutar el proyecto

### 1.  Entrar a la carpeta del ejercicio
Desde la raíz del repositorio, ejecuta:

```bash
cd basico/ejercicio-01/resoluciones/joseluis-herrera
```

### 2. Instalar las dependencias

```bash
npm install
```

### 3. Ejecutar el programa

```bash
npm run start
```
---

## API utilizada
Para obtener la información se utiliza **PokéAPI**:

```text
https://pokeapi.co/api/v2/pokemon/pikachu
```
---
