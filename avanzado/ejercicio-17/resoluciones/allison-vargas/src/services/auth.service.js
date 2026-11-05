import { randomUUID } from 'node:crypto';
import { crear } from '../errores/index.js';
import { HASH_FALSO, comparar } from '../auth/contrasenas.js';
import { firmar, verificar } from '../auth/jwt.js';
import { validarLogin, validarRefresh } from '../validators/auth.js';

export const ACCESO = Object.freeze({ duracionS: 300, emisor: 'viajes-api', audiencia: 'viajes-app' });

export function crearServicioAuth({
  usuarios, reloj, secreto, sesiones, intentos,
}) {
  const opcionesJwt = { ...ACCESO, secreto, reloj };
  const porEmail = (email) => usuarios.find((u) => u.email === email);
  const porId = (id) => usuarios.find((u) => u.id === id);

  function emitirAcceso(usuario, familiaId) {
    return firmar({
      sub: usuario.id, rol: usuario.rol, sid: familiaId, jti: randomUUID(),
    }, opcionesJwt);
  }

  function respuesta(usuario, familiaId, refresh) {
    return {
      tokenType: 'Bearer',
      accessToken: emitirAcceso(usuario, familiaId),
      expiraEnS: ACCESO.duracionS,
      refreshToken: refresh.refreshToken,
      refreshVenceEn: refresh.venceEn,
      sesionId: familiaId,
    };
  }

  return {
    login(cuerpo, { agente, ip } = {}) {
      const { email, contrasena } = validarLogin(cuerpo);
      const bloqueo = intentos.bloqueadoHasta(email);
      if (bloqueo) {
        const segundos = Math.ceil((bloqueo - reloj().getTime()) / 1000);
        throw crear('LOGIN_BLOQUEADO', {}, { cabeceras: { 'Retry-After': String(segundos) } });
      }
      const usuario = porEmail(email);
      // se compara siempre, aunque el correo no exista, para no revelar por tiempo que cuentas hay
      const correcta = comparar(contrasena, usuario?.contrasenaHash ?? HASH_FALSO);
      if (!usuario || !correcta) {
        intentos.fallo(email);
        throw crear('CREDENCIALES_INVALIDAS');
      }
      intentos.exito(email);
      const sesion = sesiones.iniciar({ usuarioId: usuario.id, agente, ip });
      return respuesta(usuario, sesion.familiaId, sesion);
    },

    refrescar(cuerpo) {
      const { refreshToken } = validarRefresh(cuerpo);
      const rotado = sesiones.rotar(refreshToken);
      return respuesta(porId(rotado.usuarioId), rotado.familiaId, rotado);
    },

    autenticar(cabecera) {
      const [esquema, token, sobra] = (cabecera ?? '').split(' ');
      if (!cabecera) throw crear('NO_AUTENTICADO');
      if (esquema !== 'Bearer' || !token || sobra !== undefined) throw crear('TOKEN_INVALIDO', { motivo: 'esquema' });
      const datos = verificar(token, opcionesJwt);
      // el access token es corto y sin estado, pero se revisa la sesion para que cerrar sesion tenga efecto inmediato
      if (!sesiones.sesionActiva(datos.sid)) throw crear('SESION_REVOCADA');
      const usuario = porId(datos.sub);
      return {
        id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, sesionId: datos.sid,
      };
    },

    cerrarSesion: (usuario) => sesiones.revocar(usuario.sesionId, usuario.id),
    cerrarTodas: (usuario) => sesiones.revocarTodas(usuario.id),
    sesiones: (usuario) => sesiones.listar(usuario.id).map((s) => ({ ...s, actual: s.id === usuario.sesionId })),
    cerrarSesionPorId: (usuario, id) => sesiones.revocar(id, usuario.id, 'cerrada_desde_otra_sesion'),
  };
}
