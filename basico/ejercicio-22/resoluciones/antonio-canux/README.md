# Ejercicio 22 - Servicios Simples (Arquitectura 3D)

**Alumno:** Antonio Canux  
**Tema:** Separación de capa de servicios  
**Temática:** Arquitectura 3D  
**Ruta:** http://localhost:3000/basico/ejercicio-22

## Enlaces Completos y Endpoints
- **Estado:** [http://localhost:3000/basico/ejercicio-22](http://localhost:3000/basico/ejercicio-22)
- **Planos 3D:** [http://localhost:3000/basico/ejercicio-22/blueprints](http://localhost:3000/basico/ejercicio-22/blueprints)
- **Detalle de Plano:** [http://localhost:3000/basico/ejercicio-22/blueprints/1](http://localhost:3000/basico/ejercicio-22/blueprints/1)
- **Crear Plano:** `POST` [http://localhost:3000/basico/ejercicio-22/blueprints](http://localhost:3000/basico/ejercicio-22/blueprints)

## Pruebas Rápidas con cURL
```bash
curl http://localhost:3000/basico/ejercicio-22
curl http://localhost:3000/basico/ejercicio-22/blueprints
curl http://localhost:3000/basico/ejercicio-22/blueprints/1
curl -X POST http://localhost:3000/basico/ejercicio-22/blueprints -H "Content-Type: application/json" -d "{\"title\":\"Torre Residencial\",\"areaM2\":1500,\"floors\":25}"
```
