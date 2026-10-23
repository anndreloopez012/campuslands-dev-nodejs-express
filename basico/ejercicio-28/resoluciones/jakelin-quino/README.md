# Ejercicio 28 - configuracion por entorno

API de una sala de battle royale que obtiene puerto y nombre desde variables de entorno, con valores predeterminados.

## Uso

```bash
npm install
npm start
```

En PowerShell se puede cambiar la configuracion antes de iniciar:

```powershell
$env:PORT=4028
$env:LOBBY_NAME="Squad nocturno"
npm start
```

## Probar

```bash
curl http://localhost:3028/health
curl http://localhost:3028/lobby
```

La ruta `/lobby` presenta el nombre y la region configurados sin exponer valores secretos.