# Ejercicio 04 — Battle Royale API

## Descripción
En este ejercicio se desarrolló una pequeña **API REST utilizando Node.js y Express**, basada en la temática de un **Battle Royale**.
El objetivo principal es practicar la estructura básica de un backend, separando las responsabilidades del código en:
---

## 📁 Estructura del proyecto

```text
└── 📁joseluis-herrera
    ├── 📁src
    │   ├── 📁controllers
    │   │   └── player_controllers.js
    │   │
    │   ├── 📁routes
    │   │   └── players_routes.js
    │   │
    │   ├── 📁services
    │   │   └── player_service.js
    │   │
    │   └── app.js
    │
    ├── package.json
    ├── package-lock.json
    └── README.md
```

---

## 📄 Archivos principales

| Archivo                                 | Descripción                                                     |
| --------------------------------------- | --------------------------------------------------------------- |
| `src/app.js`                            | Configura Express, registra las rutas e inicia el servidor.     |
| `src/routes/players_routes.js`          | Define las rutas relacionadas con los jugadores.                |
| `src/controllers/player_controllers.js` | Recibe las peticiones y prepara las respuestas HTTP.            |
| `src/services/player_service.js`        | Contiene la información y lógica relacionada con los jugadores. |
| `package.json`                          | Contiene la configuración del proyecto, dependencias y scripts. |
| `package-lock.json`                     | Guarda las versiones exactas de las dependencias instaladas.    |
| `README.md`                             | Contiene la documentación del proyecto.                         |

---

## Cómo ejecutar el proyecto

### 1. Entrar a la carpeta del ejercicio

Desde la raíz del repositorio:

```bash
cd basico/ejercicio-04/resoluciones/joseluis-herrera
```

### 2. Instalar las dependencias

```bash
npm install
```

### 3. Ejecutar el proyecto

Para ejecutar el servidor en modo desarrollo:

```bash
npm run dev
```

También puedes ejecutarlo utilizando:

```bash
npm start
```

---

##  Probar la API

Una vez iniciado el servidor, estará disponible en:

```text
http://localhost:3000
```

Para consultar los jugadores:

```text
http://localhost:3000/players
```