import { teamRepository } from '../repositories/team.repository.js';

export const listAllTeams = async (modalidad) => {
  return await teamRepository.findAll(modalidad ? { modalidad } : {});
};

export const getTeam = async (id) => {
  const team = await teamRepository.findById(id);
  if (!team) {
    const error = new Error(`Equipo con ID ${id} no encontrado en la federación.`);
    error.statusCode = 404;
    throw error;
  }
  return team;
};

export const registerTeam = async ({ nombre, modalidad, estadio, titulosLiga = 0, jugadoresRegistrados = 11 }) => {
  const modalidadesValidas = ['fútbol 11', 'futsal'];
  if (!modalidadesValidas.includes(modalidad.toLowerCase())) {
    const error = new Error('Modalidad inválida. Debe ser "Fútbol 11" o "Futsal".');
    error.statusCode = 400;
    throw error;
  }

  return await teamRepository.create({
    nombre: nombre.trim(),
    modalidad: modalidad.toLowerCase() === 'futsal' ? 'Futsal' : 'Fútbol 11',
    estadio: estadio ? estadio.trim() : 'Estadio Comunal',
    titulosLiga: Number(titulosLiga),
    jugadoresRegistrados: Number(jugadoresRegistrados)
  });
};

export const modifyTeam = async (id, updateFields) => {
  await getTeam(id); // Valida si existe
  return await teamRepository.update(id, updateFields);
};

export const removeTeam = async (id) => {
  await getTeam(id); // Valida existencia previa
  return await teamRepository.delete(id);
};
