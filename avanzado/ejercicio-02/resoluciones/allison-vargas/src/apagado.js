export function instalarApagado({
  servidor,
  antes = () => {},
  despues = async () => {},
  logger,
  proceso = process,
  tiempoMaximoMs = 10000,
  senales = ['SIGTERM', 'SIGINT'],
}) {
  let enCurso = null;

  function apagar(senal) {
    if (enCurso) return enCurso;
    logger.info('apagado_iniciado', { senal });
    let forzado = false;

    enCurso = new Promise((resolver) => {
      const limite = setTimeout(() => {
        forzado = true;
        logger.warn('apagado_forzado', { tiempoMaximoMs });
        servidor.closeAllConnections();
      }, tiempoMaximoMs);
      limite.unref();

      const terminar = async (errorAlCerrar) => {
        clearTimeout(limite);
        let falloDespues = false;
        try {
          await despues();
        } catch (error) {
          falloDespues = true;
          logger.error('apagado_con_error', { error: error.message });
        }
        const codigo = errorAlCerrar || forzado || falloDespues ? 1 : 0;
        logger.info('apagado_completo', { codigo });
        proceso.exit(codigo);
        resolver(codigo);
      };

      antes();
      servidor.close(terminar);
      servidor.closeIdleConnections();
    });
    return enCurso;
  }

  for (const senal of senales) proceso.on(senal, () => apagar(senal));
  return apagar;
}
