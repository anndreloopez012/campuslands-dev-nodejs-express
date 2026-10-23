# Resolución - Ejercicio 010: Funciones Asíncronas

Esta API simula un torneo de PingPong. Demuestra el uso de funciones asíncronas (`async` / `await`) y Promesas para simular tiempos de espera de la red o de cálculos complejos en el backend, sin bloquear el hilo principal de Node.js.

## 🛠️ Instalación y Ejecución

1. Clona el repositorio e instala dependencias con `npm install`.

2. Ejecuta el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

## 🧪 Cómo probar los Endpoints

**1. Validar el estado del ejercicio (Síncrono)**

```http
GET http://localhost:3000/basico/ejercicio-010
```

**2. Simular un partido (Asíncrono - Tardará ~2.5 segundos en responder)**

```http
POST http://localhost:3000/basico/ejercicio-010/match
Content-Type: application/json

{
  "player1": "Ma Long",
  "player2": "Timo Boll"
}
```

**Nota:** Al enviar esta petición, notarás que tu cliente HTTP (Thunder Client, Postman) se queda cargando un par de segundos. Esto demuestra el comportamiento asíncrono gestionado con `await`.