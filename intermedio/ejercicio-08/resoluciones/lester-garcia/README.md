# API Hiperdeportivos — Middleware de Request ID (Request ID & Correlation Pattern)

Este repositorio implementa el estándar de **Trazabilidad de Solicitudes y Correlación (Request ID Pattern)** utilizando **Node.js** y **Express** sobre la temática de **fabricación, telemetría y especificaciones de hiperdeportivos**.

---

## ¿Por qué es fundamental el Request ID?

En arquitecturas cliente-servidor y microservicios:

* **Correlación de Logs:** Cada línea de log emitida en la consola o sistema de observabilidad (Datadog, CloudWatch, Grafana Loki) incluye el `req.id`, permitiendo filtrar y ver el ciclo de vida completo de una solicitud.
* **Soporte y Depuración Rápida:** Si un cliente o aplicación móvil recibe un error (ej. `400` o `500`), el JSON de error devuelve el `requestId`. El usuario reporta ese identificador y el equipo de ingeniería puede ubicar la traza exacta en segundos sin adivinar la hora o el usuario.
* **Respeto a Proxies y Gateways:** Si la petición ya incluye una cabecera `X-Request-Id`, el middleware la respeta y reutiliza; si no existe, genera un UUID v4 criptográfico nativo (`node:crypto`).

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global; requestIdMiddleware como primer paso
├── server.js                                    # Arranque del servidor HTTP
├── routes/
│   └── hypercars.routes.js                      # Rutas de hiperdeportivos
├── controllers/
│   └── hypercars.controller.js                  # Controladores limpios que emiten el requestId
├── services/
│   └── hypercars.service.js                     # Lógica de dominio y catálogo exclusivo
├── repositories/
│   └── hypercars.inMemory.repository.js         # Repositorio en memoria
├── middlewares/
│   ├── requestId.middleware.js                  # Asigna req.id y setea el header X-Request-Id
│   ├── logger.middleware.js                     # Imprime [ReqID: xxx] en cada log
│   ├── errorHandler.middleware.js               # Devuelve requestId en el JSON de error
│   └── validators/
│       ├── validate.middleware.js               # Validador de esquemas
│       └── hypercar.validator.js                # Validación de potencias (>1000 HP) y velocidades
├── utils/
│   ├── asyncHandler.js                          # Envoltorio asíncrono
│   └── customErrors.js                          # Clases de error operacionales
.env                                             # Variables de entorno
.env.example                                     # Plantilla de entorno
.gitignore                                       # Archivos excluidos
package.json                                     # Scripts y dependencias
```

---

## Configuración e Instalación

### 1. Variables de entorno

```bash
cp .env.example .env
```

### 2. Dependencias

```bash
npm install
```

### 3. Modo desarrollo

```bash
npm run dev
```

---

## Referencia de Endpoints

* **Base URL:** `/api/v1/factory`

| Método | Endpoint | Cabecera Devuelta | Descripción | Header Requerido |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/hypercars` | `X-Request-Id` | Listar hiperdeportivos (filtros: manufacturer, powertrain) | Ninguno |
| **GET** | `/hypercars/:id` | `X-Request-Id` | Obtener hiperdeportivo por ID | Ninguno |
| **POST** | `/hypercars` | `X-Request-Id` | Registrar nuevo hiperdeportivo en producción | `x-factory-key` |
| **DELETE**| `/hypercars/:id` | `X-Request-Id` | Dar de baja un chasis del catálogo | Ninguno |
