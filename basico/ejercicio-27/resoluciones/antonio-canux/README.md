# Ejercicio 27 - Logs Simples (MOBA Esports)

**Alumno:** Antonio Canux  
**Tema:** Middleware de logging simple de peticiones  
**Temática:** MOBA Esports  
**Ruta:** http://localhost:3000/basico/ejercicio-27

## Enlaces Completos y Endpoints
- **Estado:** [http://localhost:3000/basico/ejercicio-27](http://localhost:3000/basico/ejercicio-27)
- **Listar Torneos:** [http://localhost:3000/basico/ejercicio-27/tournaments](http://localhost:3000/basico/ejercicio-27/tournaments)
- **Registrar Torneo:** `POST` [http://localhost:3000/basico/ejercicio-27/tournaments](http://localhost:3000/basico/ejercicio-27/tournaments)

## Pruebas Rápidas con cURL
```bash
curl http://localhost:3000/basico/ejercicio-27
curl http://localhost:3000/basico/ejercicio-27/tournaments
curl -X POST http://localhost:3000/basico/ejercicio-27/tournaments -H "Content-Type: application/json" -d "{\"name\":\"The International\",\"game\":\"Dota 2\",\"prizePoolUSD\":18000000}"
```
