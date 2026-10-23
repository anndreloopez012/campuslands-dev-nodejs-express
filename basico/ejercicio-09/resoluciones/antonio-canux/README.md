# Resolución - Ejercicio 09: JSON y Persistencia Simple

API para gestionar un roster de peleadores de Kickboxing, demostrando el uso del módulo `fs/promises` de Node.js para guardar y leer información en un archivo `.json` de manera asíncrona.

## 🛠️ Instalación y Ejecución

1. Clona el repositorio y navega a esta carpeta.
2. Ejecuta `npm install`.
3. Inicia el servidor con `npm run dev`.

## 🧪 Pruebas con Thunder Client / curl

**1. Estado del servicio (GET)**

```http
GET http://localhost:3000/basico/ejercicio-09
```

**2. Listar peleadores (GET)**

```http
GET http://localhost:3000/basico/ejercicio-09/fighters
```

**3. Registrar nuevo peleador (POST)**

```http
POST http://localhost:3000/basico/ejercicio-09/fighters
Content-Type: application/json

{
  "name": "Badr Hari",
  "category": "Heavyweight",
  "record": "106-17-0"
}
```

Si abres el archivo `src/data/fighters.json` después de enviar este POST, verás el registro físicamente guardado.