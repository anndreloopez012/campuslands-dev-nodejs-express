# Ejercicio 08 - variables de entorno

Practica de configuracion mediante variables de entorno usando solo Node.JS.

## Uso

Ubicarse en:
```bash
basico/ejercicio-08/resoluciones/jakelin-quino/
```

El programa lee `SHOWROOM`, `REGION` y `PORT`, y usa valores predeterminados cuando no se definen. Probar en PowerShell:
```powershell
$env:SHOWROOM="Elite Motors"
$env:REGION="Medellin"
$env:PORT="8080"
npm start
```
Resultado:
```json
{
  "showroom": "Elite Motors",
  "region": "Medellin",
  "port": 8080
}
```

No se incluye ningun archivo `.env` ni secretos en el proyecto.