# Ejercicio 25 - Respuestas HTTP Correctas (Videojuegos RPG)

**Alumno:** Antonio Canux  
**Tema:** Formato estandarizado y coherente de respuestas HTTP  
**Temática:** Videojuegos RPG  
**Ruta:** http://localhost:3000/basico/ejercicio-25

## Enlaces Completos y Endpoints
- **Estado:** [http://localhost:3000/basico/ejercicio-25](http://localhost:3000/basico/ejercicio-25)
- **Listar Personajes:** [http://localhost:3000/basico/ejercicio-25/characters](http://localhost:3000/basico/ejercicio-25/characters)
- **Detalle de Personaje:** [http://localhost:3000/basico/ejercicio-25/characters/1](http://localhost:3000/basico/ejercicio-25/characters/1)
- **Crear Personaje:** `POST` [http://localhost:3000/basico/ejercicio-25/characters](http://localhost:3000/basico/ejercicio-25/characters)

## Pruebas Rápidas con cURL
```bash
curl http://localhost:3000/basico/ejercicio-25
curl http://localhost:3000/basico/ejercicio-25/characters
curl http://localhost:3000/basico/ejercicio-25/characters/1
curl -X POST http://localhost:3000/basico/ejercicio-25/characters -H "Content-Type: application/json" -d "{\"name\":\"Aragorn\",\"classType\":\"Guerrero\",\"level\":15}"
```
