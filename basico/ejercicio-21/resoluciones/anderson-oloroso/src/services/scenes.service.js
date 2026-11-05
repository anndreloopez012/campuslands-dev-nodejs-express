const scenes = [
  { id: 1, nombre: 'Apertura Forestal', duracionFrames: 240, fps: 24, renderEngine: 'Blender Cycles', estado: 'Renderizado' },
  { id: 2, nombre: 'Vuelo Panorámico', duracionFrames: 480, fps: 30, renderEngine: 'Unreal Nanite', estado: 'En progreso' },
  { id: 3, nombre: 'Plano Final Explosión', duracionFrames: 120, fps: 60, renderEngine: 'Blender EEVEE', estado: 'Pendiente' }
];

export const getAllScenes = () => scenes;

export const getSceneById = (id) => {
  const scene = scenes.find(s => s.id === Number(id));
  if (!scene) {
    const err = new Error(`Escena con ID ${id} no encontrada en el proyecto.`);
    err.statusCode = 404;
    throw err;
  }
  return scene;
};
