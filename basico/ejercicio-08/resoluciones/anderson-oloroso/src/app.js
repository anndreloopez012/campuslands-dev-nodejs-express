// Básico 08: variables de entorno (Hiperdeportivos)
import { config, validateConfig } from './config/env.js';

function main() {
  console.log('=== SISTEMA DE TELEMETRÍA DE HIPERDEPORTIVOS ===');

  try {
    const validConfig = validateConfig();
    console.log('\nConfiguración cargada desde variables de entorno:');
    console.table([
      {
        Entorno: validConfig.env,
        Puerto: validConfig.port,
        Circuito: validConfig.pista,
        'Velocidad Máx (km/h)': validConfig.limiteVelocidadKmH,
        'Modo Debug': validConfig.debug ? 'ACTIVO' : 'INACTIVO'
      }
    ]);
  } catch (error) {
    console.error(`\n[ERROR CONFIGURACIÓN ENV]: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
