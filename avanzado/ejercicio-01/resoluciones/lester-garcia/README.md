# API Gremio de Héroes RPG — Diseño de API Versionada (v1 & v2)

Este repositorio implementa una solución backend profesional de **Diseño de API Versionada** construida con **Node.js** y **Express** sobre la temática de **videojuegos RPG, gestión de héroes, clases de combate y evolución de esquemas de estadísticas**.

---

## Estrategia de Versionamiento Implementada

En un entorno de producción real (como servidores de videojuegos RPG con clientes móviles y de escritorio en distintas versiones), introducir cambios disruptivos (*breaking changes*) en un endpoint existente rompería los clientes antiguos. Esta solución aplica:

1. **Versionamiento por URI (`/api/v1` y `/api/v2`)**:
   * **Contrato `v1` (`/api/v1/heroes`) — Legado / Deprecado**:
     Entrega y recibe atributos planos (`attackPower`, `defensePower`) pensados para la primera versión del cliente del juego.
   * **Contrato `v2` (`/api/v2/heroes`) — Actual**:
     Evoluciona la estructura hacia un objeto anidado `stats` (`attack`, `defense`, `mana`, `critRate`), exige afiliación a un gremio (`guild`) y calcula dinámicamente el índice de poder total (`combatRating`).
2. **Patrón Adapter / DTO sobre una Entidad Canónica Única**:
   Ambas versiones consumen el mismo repositorio en memoria (`heroes.inMemory.repository.js`), transformando los datos mediante adaptadores (`toHeroV1DTO` y `toHeroV2DTO`) en la capa de servicio.
3. **Cabeceras de Ciclo de Vida HTTP (`X-API-Version`, `Deprecation`, `Sunset`, `Link`)**:
   Las respuestas de `/api/v1/heroes` notifican automáticamente a los consumidores su estado de obsolescencia, la fecha de apagado (`Sunset`) y el enlace a la versión sucesora (`/api/v2/heroes`).

---

## Estructura de Directorios

```text
avanzado/ejercicio-01/resoluciones/lester-garcia/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── app.js                                    # Configuración de Express y rutas principales
    ├── server.js                                 # Punto de entrada HTTP
    ├── routes/
    │   ├── index.routes.js                       # Montaje versionado (/v1/heroes y /v2/heroes)
    │   ├── v1/
    │   │   └── heroes.v1.routes.js               # Rutas de la versión 1
    │   └── v2/
    │       └── heroes.v2.routes.js               # Rutas de la versión 2
    ├── controllers/
    │   ├── v1/
    │   │   └── heroes.v1.controller.js           # Controladores para contrato v1
    │   └── v2/
    │       └── heroes.v2.controller.js           # Controladores para contrato v2
    ├── services/
    │   └── heroes.service.js                     # Lógica de negocio y mappers DTO (v1 <-> v2)
    ├── repositories/
    │   └── heroes.inMemory.repository.js         # Almacén canónico de héroes RPG
    ├── middlewares/
    │   ├── apiVersion.middleware.js              # Cabeceras HTTP de versión y deprecación
    │   ├── errorHandler.middleware.js            # Manejador centralizado de errores HTTP
    │   └── validators/
    │       └── hero.validator.js                 # Validadores específicos por versión (v1 y v2)
    └── utils/
        ├── asyncHandler.js                       # Envoltorio para promesas en controladores
        └── customErrors.js                       # Clases de error operacionales (400, 404, 409)
```

---

## Instalación y Ejecución

### 1. Configurar variables de entorno
```bash
cp .env.example .env
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar el servidor
```bash
# Modo desarrollo con recarga automática
npm run dev

# Modo producción
npm start
```

---

## Guía de Pruebas con `curl`

### 1. Verificar endpoint principal del ejercicio y salud
```bash
curl -i http://localhost:3000/avanzado/ejercicio-01
```
Respuesta esperada (`200 OK`):
```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "diseno API versionada",
  "theme": "videojuegos RPG",
  "endpoints": {
    "v1": "/api/v1/heroes",
    "v2": "/api/v2/heroes"
  }
}
```

### 2. Consultar héroes en la Versión 1 (Contrato Plano + Cabeceras de Deprecación)
```bash
curl -i http://localhost:3000/api/v1/heroes
```
Observa las cabeceras HTTP devueltas (`X-API-Version: v1`, `Deprecation: true`, `Sunset`, `Link`) y la estructura plana con `attackPower` y `defensePower`.

### 3. Consultar héroes en la Versión 2 (Contrato Anidado + `combatRating`)
```bash
curl -i "http://localhost:3000/api/v2/heroes?minLevel=40"
```

### 4. Crear un héroe usando el contrato de la Versión 2 (`201 Created`)
```bash
curl -i -X POST http://localhost:3000/api/v2/heroes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sylvanas Sombraluna",
    "characterClass": "Nigromante",
    "level": 75,
    "guild": "Guardia Apotecaria",
    "stats": {
      "attack": 340,
      "defense": 160,
      "mana": 590,
      "critRate": 48
    }
  }'
```

### 5. Probar error de validación en v2 (`400 Bad Request`)
Enviar un payload con formato plano v1 al endpoint v2 dispara el validador de esquema v2:
```bash
curl -i -X POST http://localhost:3000/api/v2/heroes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Guerrero Incompleto",
    "characterClass": "Guerrero",
    "level": 10,
    "attackPower": 100
  }'
```
