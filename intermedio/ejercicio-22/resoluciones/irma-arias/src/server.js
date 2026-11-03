import express from 'express';

const app = express();
app.use(express.json());
const uploads = [];
app.post('/api/models', (request, response) => {
  const { fileName, mimeType, size } = request.body ?? {};
  if (typeof fileName !== 'string' || !fileName.trim() || mimeType !== 'model/obj' || !Number.isInteger(size) || size < 1 || size > 5_000_000) {
    return response.status(400).json({ error: 'Se requiere nombre, archivo OBJ y tamaño de 1 a 5000000 bytes.' });
  }
  const upload = { id: uploads.length + 1, fileName: fileName.trim(), mimeType, size, status: 'simulado' };
  uploads.push(upload);
  return response.status(201).json({ data: upload });
});
app.listen(process.env.PORT || 3000, () => console.log('API de arquitectura disponible en el puerto 3000'));
