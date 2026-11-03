import { createHash, randomUUID } from "node:crypto";
import path from "node:path";

const ALLOWED_TYPES = {
  ".glb": { kind: "modelo 3D", signature: [0x67, 0x6c, 0x54, 0x46] },
  ".obj": { kind: "modelo 3D" },
  ".stl": { kind: "modelo 3D" },
  ".png": { kind: "imagen", signature: [0x89, 0x50, 0x4e, 0x47] },
  ".jpg": { kind: "imagen", signature: [0xff, 0xd8, 0xff] },
};
const MAX_PROJECT_LENGTH = 60;

const uploads = [];
let nextId = 1;

function fail(status, message) {
  throw Object.assign(new Error(message), { status });
}

const safeName = (name) => name.split(/[\\/]/).pop().replace(/[^\w.\- ]/g, "_").replace(/^\.+/, "").slice(-100);

const listUploads = () => uploads;

function getUploadById(id) {
  if (!Number.isInteger(Number(id))) fail(400, "id debe ser numerico");

  const upload = uploads.find((u) => u.id === Number(id));
  if (!upload) fail(404, `Subida con id ${id} no encontrada`);

  return upload;
}

function registerUpload({ file, project }) {
  if (!file) fail(400, "Falta el archivo: envialo como multipart/form-data en el campo 'file'");
  if (typeof project !== "string" || !project.trim() || project.trim().length > MAX_PROJECT_LENGTH) fail(400, `project es obligatorio y admite hasta ${MAX_PROJECT_LENGTH} caracteres`);

  const originalName = safeName(file.originalname);
  const extension = path.extname(originalName).toLowerCase();
  const rule = ALLOWED_TYPES[extension];

  if (!rule) fail(415, `Extension no permitida. Usa: ${Object.keys(ALLOWED_TYPES).join(", ")}`);
  if (file.size === 0) fail(400, "El archivo esta vacio");
  if (rule.signature && !rule.signature.every((byte, index) => file.buffer[index] === byte)) fail(415, `El contenido no corresponde a un archivo ${extension}`);

  const sha256 = createHash("sha256").update(file.buffer).digest("hex");
  const duplicate = uploads.find((u) => u.project === project.trim() && u.sha256 === sha256);
  if (duplicate) fail(409, `El archivo ya fue subido a este proyecto (id ${duplicate.id})`);

  const upload = {
    id: nextId++,
    project: project.trim(),
    originalName,
    storageKey: `uploads/${randomUUID()}${extension}`,
    kind: rule.kind,
    sizeBytes: file.size,
    sha256,
    uploadedAt: new Date().toISOString(),
  };
  uploads.push(upload);
  return upload;
}

export { listUploads, getUploadById, registerUpload };
