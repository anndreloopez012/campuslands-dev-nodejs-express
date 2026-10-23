const { NotFoundError, ValidationError, ConflictError } = require('../errors/app-error');

const stories = [
  { id: 1, title: 'Colonia Kepler', author: 'A. Lombardi', year: 2074 },
  { id: 2, title: 'El Archivo Silencioso', author: 'R. Soto', year: 2150 },
];

const listStories = () => stories.map((story) => ({ ...story }));

function getStory(id) {
  const story = stories.find((item) => item.id === id);
  if (!story) throw new NotFoundError(`La historia con id ${id} no existe`);
  return { ...story };
}

function createStory(data) {
  const details = [];
  if (typeof data?.title !== 'string' || data.title.trim() === '') details.push('title es obligatorio');
  if (typeof data?.author !== 'string' || data.author.trim() === '') details.push('author es obligatorio');
  if (!Number.isInteger(data?.year)) details.push('year debe ser un entero');
  if (details.length > 0) throw new ValidationError(details);

  if (stories.some((story) => story.title.toLowerCase() === data.title.trim().toLowerCase())) {
    throw new ConflictError(`Ya existe una historia llamada "${data.title.trim()}"`);
  }
  const story = {
    id: stories.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    title: data.title.trim(),
    author: data.author.trim(),
    year: data.year,
  };
  stories.push(story);
  return story;
}

module.exports = { listStories, getStory, createStory };
