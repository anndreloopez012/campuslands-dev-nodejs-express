const MB = 1024 * 1024;

export const LIMITES_POR_CATEGORIA = {
  modelo: 200 * MB,
  plano: 50 * MB,
  textura: 25 * MB,
};

export const EXTENSIONES = {
  '.obj': { categoria: 'modelo', mimes: ['model/obj', 'text/plain', 'application/octet-stream'] },
  '.fbx': { categoria: 'modelo', mimes: ['application/octet-stream'] },
  '.glb': { categoria: 'modelo', mimes: ['model/gltf-binary', 'application/octet-stream'] },
  '.gltf': { categoria: 'modelo', mimes: ['model/gltf+json', 'application/json'] },
  '.stl': { categoria: 'modelo', mimes: ['model/stl', 'application/sla', 'application/octet-stream'] },
  '.ifc': { categoria: 'modelo', mimes: ['application/x-step', 'application/octet-stream'] },
  '.dwg': { categoria: 'plano', mimes: ['application/acad', 'image/vnd.dwg', 'application/octet-stream'] },
  '.dxf': { categoria: 'plano', mimes: ['image/vnd.dxf', 'application/dxf', 'application/octet-stream'] },
  '.pdf': { categoria: 'plano', mimes: ['application/pdf'] },
  '.png': { categoria: 'textura', mimes: ['image/png'] },
  '.jpg': { categoria: 'textura', mimes: ['image/jpeg'] },
  '.jpeg': { categoria: 'textura', mimes: ['image/jpeg'] },
  '.webp': { categoria: 'textura', mimes: ['image/webp'] },
};

export const CATEGORIAS = Object.keys(LIMITES_POR_CATEGORIA);

export const EXTENSIONES_BLOQUEADAS = ['exe', 'bat', 'cmd', 'sh', 'js', 'php', 'ps1', 'msi', 'com', 'scr'];

export const ESTADOS_PROYECTO = ['activo', 'archivado'];
