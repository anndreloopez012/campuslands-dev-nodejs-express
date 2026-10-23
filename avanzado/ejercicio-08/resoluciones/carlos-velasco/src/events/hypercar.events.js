const EventEmitter = require('node:events');

const hypercarEmitter = new EventEmitter();

hypercarEmitter.on('hypercar.created', (hypercar) => {
  console.log(
    `[EVENT] Hiperdeportivo registrado: ${hypercar.brand} ${hypercar.model}`
  );
});

hypercarEmitter.on('hypercar.created', (hypercar) => {
  console.log(
    `[EVENT] Evento procesado para el hiperdeportivo con id: ${hypercar.id}`
  );
});

module.exports = hypercarEmitter;