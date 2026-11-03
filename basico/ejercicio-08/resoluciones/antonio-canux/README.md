# Resolución - Ejercicio 08: Variables de Entorno

Esta solución implementa una API de Hiperdeportivos demostrando el uso profesional de las variables de entorno (`process.env`) mediante la librería `dotenv`. Se centralizó la configuración y se implementaron validaciones basadas en el entorno (development vs production).

## 🛠️️ Instalación y Configuración

1. Clona el repositorio e instala las dependencias:
   ```bash
   npm install
   ```

**Importante:** Crea un archivo `.env` en la raíz de este proyecto basándote en el archivo `.env.example`.

```bash
cp .env.example .env
```

Llena los valores en tu nuevo archivo `.env`.

## 🚀 Ejecución

Para iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

## 🧪 Cómo probar los Endpoints

Puedes usar Thunder Client, Postman o curl.

1. Validar el estado del ejercicio:

```http
GET http://localhost:3000/basico/ejercicio-08
```

2. Listar hiperdeportivos (Aplica filtro de velocidad del `.env`):

```http
GET http://localhost:3000/basico/ejercicio-08/hypercars
```

3. Prueba de Seguridad (Simulando Producción):

Si cambias `NODE_ENV=production` en tu archivo `.env` y reinicias el servidor, el endpoint de hiperdeportivos te pedirá un Header llamado `x-api-key` con el valor que hayas configurado en tu variable `API_KEY`.