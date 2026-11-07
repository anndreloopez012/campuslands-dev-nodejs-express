/**
 * Almacen en memoria de modelos 3D.
 * Separa la coleccion del servicio para poder cambiarlo por una
 * tabla o bucket real mas adelante.
 */
const modelos = [
  { id: 1, nombre: 'Casa Eco', formato: 'gltf', estado: 'completado', bytes_recibidos: 4096, tamano_bytes: 4096, url_simulada: 'mem://modelos/1/casa-eco.gltf' },
  { id: 2, nombre: 'Torre Mirador', formato: 'obj', estado: 'esperando_chunks', bytes_recibidos: 0 }
];

let contador = modelos.length;

function listar() {
  return modelos;
}

function obtener(id) {
  return modelos.find((actual) => actual.id === id) || null;
}

function guardar(modelo) {
  modelos.push(modelo);
}

function siguienteId() {
  contador += 1;
  return contador;
}

module.exports = { listar, obtener, guardar, siguienteId };
