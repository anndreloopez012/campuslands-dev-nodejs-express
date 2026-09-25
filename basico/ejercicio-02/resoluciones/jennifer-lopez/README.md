# Resolución Ejercicio 02 - npm scripts y package.json 

**Autor:** Jennifer López  
**Nivel:** Básico 02  

## Descripción
API HTTP con Node.js y Express tematizada en shooters competitivos para consultar las estadísticas de partida y practicar la automatización de comandos usando `npm scripts`.

## Estructura
- `src/services/`: Cálculo de estadísticas y validación de reglas de negocio.
- `src/controllers/`: Manejo de respuestas y código de estado HTTP (200 OK y 400 Bad Request).
- `src/routes/`: Definición de endpoints.

## Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Modo desarrollo (con autorecarga node --watch)
npm run dev

# Modo producción
npm start
```

## Ejemplos de Petición

### 1. Caso Exitoso (Caso Feliz)
**Petición:** `GET http://localhost:3000/api/v1/match/stats?mode=ranked`  
**Respuesta (200 OK):**
```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "npm scripts y package.json",
  "data": {
    "game": "Valorant / CS:GO Competitive",
    "mode": "ranked",
    "stats": {
      "kills": 24,
      "deaths": 12,
      "assists": 8,
      "kdRatio": 2,
      "mvpCount": 4,
      "result": "Victory"
    }
  }
}
```

### 2. Caso con Error de Validación
**Petición:** 
`GET http://localhost:3000/api/v1/match/stats`  
**Respuesta (400 Bad Request):**
```json
{
  "ok": false,
  "message": "Error en la solicitud de estadísticas",
  "error": "Modo de juego inválido. Usa 'ranked' o 'casual'."
}
```