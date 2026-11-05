export function crearVentanaFija({ limite, ventanaMs }) {
  const registros = new Map();

  const resultado = (permitido, cuenta, reinicioMs) => ({
    permitido,
    limite,
    restantes: Math.max(limite - cuenta, 0),
    reinicioMs,
    reintentarMs: permitido ? 0 : reinicioMs,
  });

  return {
    tipo: 'ventana fija',
    limite,
    ventanaMs,
    consumir(clave, ahora = Date.now()) {
      let registro = registros.get(clave);
      if (!registro || registro.reinicio <= ahora) {
        registro = { cuenta: 0, reinicio: ahora + ventanaMs };
        registros.set(clave, registro);
      }
      if (registro.cuenta >= limite) return resultado(false, registro.cuenta, registro.reinicio - ahora);
      registro.cuenta += 1;
      return resultado(true, registro.cuenta, registro.reinicio - ahora);
    },
    estado(clave, ahora = Date.now()) {
      const registro = registros.get(clave);
      if (!registro || registro.reinicio <= ahora) return resultado(true, 0, ventanaMs);
      return resultado(registro.cuenta < limite, registro.cuenta, registro.reinicio - ahora);
    },
    purgar(ahora = Date.now()) {
      for (const [clave, registro] of registros) {
        if (registro.reinicio <= ahora) registros.delete(clave);
      }
    },
    tamano: () => registros.size,
  };
}

export function crearCubeta({ capacidad, recargaMs }) {
  const registros = new Map();

  const tokensActuales = (registro, ahora) =>
    registro ? Math.min(capacidad, registro.tokens + (ahora - registro.ultimo) / recargaMs) : capacidad;

  const resultado = (permitido, tokens) => ({
    permitido,
    limite: capacidad,
    restantes: Math.floor(tokens),
    reinicioMs: Math.ceil((capacidad - tokens) * recargaMs),
    reintentarMs: permitido ? 0 : Math.ceil((1 - tokens) * recargaMs),
  });

  return {
    tipo: 'cubeta de tokens',
    limite: capacidad,
    recargaMs,
    consumir(clave, ahora = Date.now()) {
      const tokens = tokensActuales(registros.get(clave), ahora);
      if (tokens < 1) {
        registros.set(clave, { tokens, ultimo: ahora });
        return resultado(false, tokens);
      }
      registros.set(clave, { tokens: tokens - 1, ultimo: ahora });
      return resultado(true, tokens - 1);
    },
    estado(clave, ahora = Date.now()) {
      const tokens = tokensActuales(registros.get(clave), ahora);
      return resultado(tokens >= 1, tokens);
    },
    purgar(ahora = Date.now()) {
      for (const [clave, registro] of registros) {
        if (tokensActuales(registro, ahora) >= capacidad) registros.delete(clave);
      }
    },
    tamano: () => registros.size,
  };
}
