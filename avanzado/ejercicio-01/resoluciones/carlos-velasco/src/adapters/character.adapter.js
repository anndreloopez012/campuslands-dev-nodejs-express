/**
 * Adaptadores de version: convierten el modelo de dominio en la forma
 * de respuesta que expone cada version de la API.
 */
function toV1(character) {
  return {
    id: character.id,
    nombre: character.name,
    clase: character.className,
    nivel: character.level,
    estadisticas: character.stats,
  };
}

function toV2(character, powerScore) {
  return {
    id: character.id,
    name: character.name,
    className: character.className,
    level: character.level,
    stats: character.stats,
    guild: { tag: character.guildTag },
    powerScore,
    _links: {
      self: `/api/v2/characters/${character.id}`,
      list: "/api/v2/characters",
    },
    lastUpdated: character.updatedAt,
  };
}

module.exports = { toV1, toV2 };
