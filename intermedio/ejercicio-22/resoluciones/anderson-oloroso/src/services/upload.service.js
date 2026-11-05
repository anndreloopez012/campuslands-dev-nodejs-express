const ALLOWED_EXTENSIONS = ['.obj', '.fbx', '.dwg', '.ifc'];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

let uploadedBlueprints = [];

export const processBlueprintUpload = ({ nombreArchivo, extension, tamanoBytes, autor }) => {
  const ext = extension ? extension.toLowerCase().trim() : '';
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    const err = new Error(`Formato de archivo no soportado: ${extension}. Extensiones válidas: ${ALLOWED_EXTENSIONS.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  if (tamanoBytes > MAX_FILE_SIZE_BYTES) {
    const err = new Error(`El archivo excede el límite máximo permitido de 50MB (Recibido: ${(tamanoBytes / (1024 * 1024)).toFixed(2)}MB).`);
    err.statusCode = 413; // Payload Too Large
    throw err;
  }

  const fileRecord = {
    id: `CAD-${Date.now()}`,
    nombreArchivo,
    extension: ext,
    tamanoMB: (tamanoBytes / (1024 * 1024)).toFixed(2),
    autor: autor || 'Arquitecto Principal',
    fechaCarga: new Date().toISOString(),
    hashSimulado: `sha256-${Math.random().toString(36).substring(2)}`
  };

  uploadedBlueprints.push(fileRecord);
  return fileRecord;
};

export const getUploadedBlueprints = () => uploadedBlueprints;
