# Basico 08 - variables de entorno

## Que hace este ejercicio

Usa dotenv para cargar variables de entorno desde un archivo .env
(nunca se sube) a partir de .env.example. Todas las variables se 
validan en un solo lugar (src/config/env.js): si falta alguna, el 
servidor no arranca y explica que falta. La marca destacada y el 
limite de velocidad que responde el endpoint principal vienen de esas
variables, no estan hardcodeados.

## Estructura

```text
.
|-- .env.example
|-- package.json
|-- README.md
`-- src
    |-- app.js
    |-- server.js
    |-- config/
    |   `-- env.js
    |-- routes/
    |   `-- ejercicio.routes.js
    |-- controllers/
    |   `-- ejercicio.controller.js
    |-- services/
    |   `-- hiperdeportivos.service.js
    `-- data/
        `-- hiperdeportivos.json
```

- config/env.js: carga y valida las variables con dotenv.
- routes: define los endpoints HTTP.
- controllers: recibe la peticion y arma la respuesta.
- services: usa las variables ya validadas para armar el resumen.
- data: hiperdeportivos de ejemplo.

## Como ejecutar

Primero copia la plantilla de variables de entorno:

```bash
cd basico/ejercicio-08/resoluciones/allison-vargas
cp .env.example .env
npm install
npm run dev
```

En Windows/PowerShell, en vez de cp usa:

```powershell
Copy-Item .env.example .env
```

Respuesta esperada en GET /basico/ejercicio-08:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "variables de entorno",
  "resumen": {
    "marca_destacada": "Bugatti",
    "limite_velocidad_kmh": 490,
    "auto_destacado": { "id": 1, "marca": "Bugatti", "modelo": "Chiron", "velocidad_maxima_kmh": 490 },
    "total_dentro_del_limite": 3
  }
}
```