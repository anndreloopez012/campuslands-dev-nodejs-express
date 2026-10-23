# Ejercicio 21 - Estructura src routes controllers (Animación 3D)

**Alumno:** Antonio Canux  
**Tema:** Arquitectura modular con src, routes y controllers  
**Temática:** Animación 3D  
**Ruta:** http://localhost:3000/basico/ejercicio-21

## Enlaces Completos y Endpoints
- **Estado:** [http://localhost:3000/basico/ejercicio-21](http://localhost:3000/basico/ejercicio-21)
- **Modelos 3D:** [http://localhost:3000/basico/ejercicio-21/models](http://localhost:3000/basico/ejercicio-21/models)
- **Detalle de Modelo:** [http://localhost:3000/basico/ejercicio-21/models/1](http://localhost:3000/basico/ejercicio-21/models/1)
- **Crear Modelo:** `POST` [http://localhost:3000/basico/ejercicio-21/models](http://localhost:3000/basico/ejercicio-21/models)

## Pruebas Rápidas con cURL
```bash
curl http://localhost:3000/basico/ejercicio-21
curl http://localhost:3000/basico/ejercicio-21/models
curl http://localhost:3000/basico/ejercicio-21/models/1
curl -X POST http://localhost:3000/basico/ejercicio-21/models -H "Content-Type: application/json" -d "{\"name\":\"Mech Warrior\",\"polygons\":85000,\"rigged\":true}"
```
