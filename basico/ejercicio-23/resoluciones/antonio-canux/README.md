# Ejercicio 23 - Datos en Memoria (Soldadura)

**Alumno:** Antonio Canux  
**Tema:** Manejo y mutación de arreglos en memoria  
**Temática:** Soldadura industrial  
**Ruta:** http://localhost:3000/basico/ejercicio-23

## Enlaces Completos y Endpoints
- **Estado:** [http://localhost:3000/basico/ejercicio-23](http://localhost:3000/basico/ejercicio-23)
- **Listar Soldaduras:** [http://localhost:3000/basico/ejercicio-23/welds](http://localhost:3000/basico/ejercicio-23/welds)
- **Registrar Soldadura:** `POST` [http://localhost:3000/basico/ejercicio-23/welds](http://localhost:3000/basico/ejercicio-23/welds)
- **Eliminar Soldadura:** `DELETE` [http://localhost:3000/basico/ejercicio-23/welds/1](http://localhost:3000/basico/ejercicio-23/welds/1)

## Pruebas Rápidas con cURL
```bash
curl http://localhost:3000/basico/ejercicio-23
curl http://localhost:3000/basico/ejercicio-23/welds
curl -X POST http://localhost:3000/basico/ejercicio-23/welds -H "Content-Type: application/json" -d "{\"type\":\"TIG\",\"material\":\"Aluminio\",\"amperage\":140}"
curl -X DELETE http://localhost:3000/basico/ejercicio-23/welds/1
```
