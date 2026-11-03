import { z } from "zod";

// todos los schemas importan z desde aqui
// asi la configuracion (mensajes en espanol) se aplica una sola vez
z.config(z.locales.es());

export { z };
