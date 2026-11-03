import path from "node:path";
import multer from "multer";
import config from "../config.js";
import AppError from "../utils/app-error.js";

// tipos permitidos: extension => mimetypes que acepto para esa extension
// los .glb casi nunca llegan con su mimetype real, por eso acepto octet-stream
const TIPOS_PERMITIDOS = {
    ".pdf": ["application/pdf"],
    ".png": ["image/png"],
    ".jpg": ["image/jpeg"],
    ".jpeg": ["image/jpeg"],
    ".glb": ["model/gltf-binary", "application/octet-stream"]
};

// memoryStorage: el archivo queda en req.files[i].buffer y no se escribe en disco
// por eso la subida es "simulada", en un proyecto real iria a disco o a S3
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: config.maxArchivoMb * 1024 * 1024,
        files: config.maxArchivosPorSubida
    },
    fileFilter(req, file, callback) {
        const extension = path.extname(file.originalname).toLowerCase();
        const mimetypes = TIPOS_PERMITIDOS[extension];

        // reviso que la extension y el mimetype coincidan
        if (!mimetypes || !mimetypes.includes(file.mimetype)) {
            const permitidas = Object.keys(TIPOS_PERMITIDOS).join(", ");
            return callback(new AppError(415, `Tipo de archivo no permitido: ${file.originalname} (${file.mimetype}). Se aceptan ${permitidas}`));
        }

        callback(null, true);
    }
});

// paso los errores de multer a mensajes en espanol con el status correcto
function subirArchivos(req, res, next) {
    upload.array("archivos", config.maxArchivosPorSubida)(req, res, (error) => {
        if (!error) return next();

        if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") {
                return next(new AppError(413, `Un archivo pasa el maximo de ${config.maxArchivoMb} MB`));
            }
            if (error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE") {
                return next(new AppError(400, `Manda hasta ${config.maxArchivosPorSubida} archivos en el campo "archivos"`));
            }
            return next(new AppError(400, `Error al subir: ${error.message}`));
        }

        next(error);
    });
}

export { subirArchivos, TIPOS_PERMITIDOS };
