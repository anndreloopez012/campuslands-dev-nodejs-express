import multer from "multer";

const MAX_FILE_MB = 5;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_MB * 1024 * 1024, files: 1, fields: 5, fieldSize: 1024 },
}).single("file");

function receiveFile(req, res, next) {
  upload(req, res, (error) => {
    if (!error) return next();

    const tooLarge = error.code === "LIMIT_FILE_SIZE";
    const message = tooLarge ? `El archivo supera el maximo de ${MAX_FILE_MB} MB` : `Subida invalida: ${error.message}`;
    next(Object.assign(new Error(message), { status: tooLarge ? 413 : 400 }));
  });
}

export { receiveFile };
