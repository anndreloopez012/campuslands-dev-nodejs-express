# Resolución Ejercicio 01 - Node Runtime y Consola 

**Autor:** Jennifer López  
**Nivel:** Básico 01  

## Descripción
Mini API HTTP construida con Node.js y Express que retorna la información de estado básica de un personaje RPG para validar la ejecución del runtime y consola.

## Estructura
- `src/services/`: Lógica del dominio RPG.
- `src/controllers/`: Manejo de peticiones y respuestas HTTP.
- `src/routes/`: Definición de endpoints.

## Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Modo producción
npm start
```

## Ejemplo de uso

**Petición:**
`GET http://localhost:3000/api/v1/hero/status`

**Respuesta (200 OK):**
```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "Node runtime y consola",
  "data": {
    "name": "Guerrero de Eldoria",
    "level": 1,
    "health": 100,
    "mana": 50,
    "status": "Listo para la aventura"
  }
}
```