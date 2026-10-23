// Servicio: se encarga de leer informacion del runtime de Node.js
// y traducirla al contexto RPG (el estado del mundo).

function obtenerEstadoDelMundo() {
  const estado = {
    version_node: process.version,
    plataforma: process.platform,
    arquitectura: process.arch,
    tiempo_encendido_segundos: Number(process.uptime().toFixed(2)),
  };

  return estado;
}

function mostrarEstadoDelMundo() {
  const estado = obtenerEstadoDelMundo();

  console.log('Estado del mundo (runtime de Node.js):');
  console.table(estado);

  return estado;
}

module.exports = {
  obtenerEstadoDelMundo,
  mostrarEstadoDelMundo,
};
