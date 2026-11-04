import { leerContexto } from '../services/contexto.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const obtener = catchAsync((req, res) => {
  const { requestIdEnService, headersParaServiciosExternos } = leerContexto();

  res.status(200).json({
    ok: true,
    data: {
      requestIdEnRequest: req.id,
      requestIdEnService,
      requestIdEnHeaderDeRespuesta: res.get('x-request-id'),
      coinciden: req.id === requestIdEnService && req.id === res.get('x-request-id'),
      headersParaServiciosExternos,
    },
  });
});
