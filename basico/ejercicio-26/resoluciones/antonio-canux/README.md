# Ejercicio 26 - Códigos de Estado (Shooters Competitivos)

**Alumno:** Antonio Canux  
**Tema:** Uso semántico de códigos de estado HTTP (200, 201, 204, 400, 404)  
**Temática:** Shooters Competitivos  
**Ruta:** http://localhost:3000/basico/ejercicio-26

## Enlaces Completos y Endpoints
- **Estado (200):** [http://localhost:3000/basico/ejercicio-26](http://localhost:3000/basico/ejercicio-26)
- **Listar Partidas (200):** [http://localhost:3000/basico/ejercicio-26/matches](http://localhost:3000/basico/ejercicio-26/matches)
- **Detalle de Partida (200 / 404):** [http://localhost:3000/basico/ejercicio-26/matches/1](http://localhost:3000/basico/ejercicio-26/matches/1)
- **Registrar Partida (201 / 400):** `POST` [http://localhost:3000/basico/ejercicio-26/matches](http://localhost:3000/basico/ejercicio-26/matches)
- **Eliminar Partida (204 / 404):** `DELETE` [http://localhost:3000/basico/ejercicio-26/matches/1](http://localhost:3000/basico/ejercicio-26/matches/1)

## Pruebas Rápidas con cURL
```bash
curl -i http://localhost:3000/basico/ejercicio-26
curl -i http://localhost:3000/basico/ejercicio-26/matches
curl -i -X POST http://localhost:3000/basico/ejercicio-26/matches -H "Content-Type: application/json" -d "{\"map\":\"Dust II\",\"teamA\":\"CT\",\"teamB\":\"T\",\"score\":\"16-12\"}"
curl -i -X DELETE http://localhost:3000/basico/ejercicio-26/matches/1
```
