const paquetes = [
  { id: 1, destino: 'Cafayate', dias: 3, precio_usd: 320, cupos: 10 },
  { id: 2, destino: 'Machu Picchu', dias: 5, precio_usd: 780, cupos: 6 },
  { id: 3, destino: 'Uyuni Express', dias: 2, precio_usd: 210, cupos: 0 }
];

const reservas = [
  { id: 1, paqueteId: 1, titular: 'turista.mia', estado: 'confirmada' },
  { id: 2, paqueteId: 2, titular: 'turista.dan', estado: 'pendiente' }
];

const usuarios = [
  { id: 1, usuario: 'turista.mia', contrasena: 'viajo1', rol: 'turista' },
  { id: 2, usuario: 'turista.dan', contrasena: 'viajo2', rol: 'turista' },
  { id: 3, usuario: 'agente.sol', contrasena: 'agente9', rol: 'agente' },
  { id: 4, usuario: 'admin.tur', contrasena: 'raiz24', rol: 'admin' }
];

const sesiones = [];

function login(usuario, contrasena) {
  if (!usuario || typeof usuario !== 'string' || !contrasena || typeof contrasena !== 'string') {
    return { error: 'Los campos "usuario" y "contrasena" son obligatorios', codigo: 400 };
  }
  const found = usuarios.find((u) => u.usuario === usuario && u.contrasena === contrasena);
  if (!found) return { error: 'Credenciales invalidas', codigo: 401 };

  const token = `tk-${found.id}-${Math.random().toString(36).slice(2, 10)}`;
  const sesion = { token, usuario: found.usuario, rol: found.rol };
  sesiones.push(sesion);
  return { data: sesion };
}

function sesionPorToken(token) {
  return sesiones.find((s) => s.token === token) || null;
}

function listarPaquetes() {
  return paquetes.map((paquete) => ({ ...paquete, disponible: paquete.cupos > 0 }));
}

function crearReserva(sesion, paqueteId) {
  const paquete = paquetes.find((p) => p.id === paqueteId);
  if (!paquete) return { error: 'Paquete no encontrado', codigo: 404 };
  if (paquete.cupos <= 0) return { error: `El paquete ${paqueteId} no tiene cupos disponibles`, codigo: 409 };

  paquete.cupos -= 1;
  const reserva = { id: reservas.length + 1, paqueteId, titular: sesion.usuario, estado: 'confirmada' };
  reservas.push(reserva);
  return { data: reserva };
}

/**
 * Visualiza reservas segun el permiso ya resuelto:
 * - `verTodas` viene de la matriz de permisos, no de un rol hardcodeado.
 * - Sin el permiso, el titular solo ve las suyas.
 */
function listarReservas(sesion, verTodas) {
  if (verTodas) return { data: reservas };
  return { data: reservas.filter((reserva) => reserva.titular === sesion.usuario) };
}

/**
 * Cancela con permiso resuelto fuera del servicio:
 * - puedeCualquiera: false -> solo el titular puede cancelar.
 * - El cupo del paquete se devuelve al inventario.
 */
function cancelarReserva(sesion, reservaId, puedeCualquiera) {
  const reserva = reservas.find((r) => r.id === reservaId);
  if (!reserva) return { error: 'Reserva no encontrada', codigo: 404 };

  if (!puedeCualquiera && reserva.titular !== sesion.usuario) {
    return { error: 'Solo puedes cancelar tus propias reservas', codigo: 403 };
  }
  if (reserva.estado === 'cancelada') {
    return { error: 'La reserva ya esta cancelada', codigo: 409 };
  }

  reserva.estado = 'cancelada';
  const paquete = paquetes.find((p) => p.id === reserva.paqueteId);
  if (paquete) paquete.cupos += 1;
  return { data: reserva };
}

module.exports = { login, sesionPorToken, listarPaquetes, crearReserva, listarReservas, cancelarReserva };
