const maxMb = Number(process.env.MAX_FILE_SIZE_MB) || 50;

export const uploadConfig = Object.freeze({
  maxFileSizeMb: maxMb,
  maxFileSizeBytes: maxMb * 1024 * 1024,
  storageBucketUrl: (process.env.STORAGE_BUCKET_URL || "https://cdn.bim-arch3d.studio/models").trim(),
  allowedExtensions: Object.freeze([".ifc", ".rvt", ".dwg", ".obj", ".fbx"]),
  allowedMimeTypes: Object.freeze([
    "application/x-step",
    "application/octet-stream",
    "image/vnd.dwg",
    "model/obj"
  ])
});
