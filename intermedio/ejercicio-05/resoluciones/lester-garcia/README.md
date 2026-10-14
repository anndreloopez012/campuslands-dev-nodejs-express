# API Fútbol Sala — Repositorios en Memoria (In-Memory Repository Pattern)

Este repositorio implementa el Patrón Repositorio en Memoria con Node.js y Express sobre la temática de fútbol sala profesional, campeonatos y gestión de partidos oficiales.

---

## Beneficios del Repositorio en Memoria

1. **Desacoplamiento Total de la Persistencia**
   La capa de servicio (`src/services/`) desconoce dónde o cómo se almacenan los datos. Solo invoca los métodos estándar de la interfaz (`findAll`, `findById`, `findByCode`, `save`, `update`, `remove`).

2. **Aislamiento para Pruebas Unitarias**
   Permite ejecutar pruebas de software sin configurar bases de datos físicas ni tocar el disco, asegurando velocidad y determinismo.

3. **Sustituibilidad (DIP - Dependency Inversion)**
   Reemplazar el almacenamiento en memoria por una base de datos relacional (PostgreSQL/MySQL) o NoSQL requiere modificar únicamente el repositorio, dejando intactos los controladores, rutas y servicios.

---

## Estructura de Directorios

```text
src/
├── app.js                                       # Configuración global de Express y rutas
├── server.js                                    # Arranque del servidor HTTP
├── routes/
│   └── futsalMatches.routes.js                  # Rutas para gestión de encuentros
├── controllers/
│   └── futsalMatches.controller.js              # Controladores delgados (Clean Controllers)
├── services/
│   └── futsalMatches.service.js                 # Lógica de negocio y reglas de dominio
├── repositories/
│   └── futsalMatches.inMemory.repository.js     # Implementación del repositorio en RAM
├── middlewares/
│   ├── logger.middleware.js                     # Registro de peticiones HTTP
│   └── errorHandler.js                          # Formateador global de errores
├── utils/
│   ├── asyncHandler.js                          # Envoltorio asíncrono
│   └── customErrors.js                          # Clases de error (400, 401, 404, 409)
.env                                             # Variables de entorno (excluido en Git)
.env.example                                     # Plantilla de entorno
.gitignore                                       # Control de archivos excluidos
package.json                                     # Scripts y dependencias
```

---

## Configuración e Instalación

### 1. Variables de entorno
Duplique la plantilla de configuración:
```bash
cp .env.example .env
```

### 2. Dependencias
Instale los módulos necesarios del proyecto:
```bash
npm install
```

### 3. Modo desarrollo
Inicie el servidor con recarga automática:
```bash
npm run dev
```

---

## Referencia de Endpoints

**Base URL:** `/api/v1/futsal`

| Método | Endpoint | Descripción | Header Requerido |
| :--- | :--- | :--- | :--- |
| **GET** | `/matches` | Listar partidos (filtros: status, surface, team) | Ninguno |
| **GET** | `/matches/:id` | Consultar partido por ID | Ninguno |
| **POST** | `/matches` | Registrar nuevo encuentro oficial | `x-league-key` |
| **PUT** | `/matches/:id` | Actualizar marcador o estado del partido | `x-league-key` |
| **DELETE** | `/matches/:id` | Eliminar encuentro de la memoria | `x-league-key` |
