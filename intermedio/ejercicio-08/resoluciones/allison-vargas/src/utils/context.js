import { AsyncLocalStorage } from 'node:async_hooks';

const almacen = new AsyncLocalStorage();

export const ejecutarConContexto = (requestId, callback) => almacen.run({ requestId }, callback);

export const obtenerRequestId = () => almacen.getStore()?.requestId;
