# Ejercicio 24 - CRUD Básico (Fórmulas Químicas)

**Alumno:** Antonio Canux  
**Tema:** Implementación de CRUD completo en Express  
**Temática:** Fórmulas Químicas  
**Ruta:** http://localhost:3000/basico/ejercicio-24

## Enlaces Completos y Endpoints
- **Estado:** [http://localhost:3000/basico/ejercicio-24](http://localhost:3000/basico/ejercicio-24)
- **Listar Compuestos:** [http://localhost:3000/basico/ejercicio-24/compounds](http://localhost:3000/basico/ejercicio-24/compounds)
- **Detalle de Compuesto:** [http://localhost:3000/basico/ejercicio-24/compounds/1](http://localhost:3000/basico/ejercicio-24/compounds/1)
- **Crear:** `POST` [http://localhost:3000/basico/ejercicio-24/compounds](http://localhost:3000/basico/ejercicio-24/compounds)
- **Actualizar:** `PUT` [http://localhost:3000/basico/ejercicio-24/compounds/1](http://localhost:3000/basico/ejercicio-24/compounds/1)
- **Eliminar:** `DELETE` [http://localhost:3000/basico/ejercicio-24/compounds/1](http://localhost:3000/basico/ejercicio-24/compounds/1)

## Pruebas Rápidas con cURL
```bash
curl http://localhost:3000/basico/ejercicio-24
curl http://localhost:3000/basico/ejercicio-24/compounds
curl -X POST http://localhost:3000/basico/ejercicio-24/compounds -H "Content-Type: application/json" -d "{\"name\":\"Ácido Clorhídrico\",\"formula\":\"HCl\",\"molarMass\":36.46}"
curl -X PUT http://localhost:3000/basico/ejercicio-24/compounds/1 -H "Content-Type: application/json" -d "{\"name\":\"Agua Destilada\",\"formula\":\"H2O\",\"molarMass\":18.015}"
curl -X DELETE http://localhost:3000/basico/ejercicio-24/compounds/1
```
