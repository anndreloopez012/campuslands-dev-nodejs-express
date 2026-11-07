/**
 * Datos en memoria del gremio: personaje del RPG.
 * El dominio vive en una sola version y las APIs (v1/v2) solo cambian
 * la forma de presentar la informacion, no de almacenarla.
 */
const characters = [
  {
    id: 1,
    name: "Aurelia la Vigia",
    className: "arquera",
    level: 42,
    stats: { strength: 14, dexterity: 27, intelligence: 12, vitality: 18 },
    guildTag: "Centinelas de Hierro",
    gold: 1540,
    updatedAt: "2026-05-02T10:00:00.000Z",
  },
  {
    id: 2,
    name: "Bromm Yunque",
    className: "guerrero",
    level: 37,
    stats: { strength: 29, dexterity: 10, intelligence: 8, vitality: 26 },
    guildTag: "Centinelas de Hierro",
    gold: 980,
    updatedAt: "2026-06-11T15:30:00.000Z",
  },
  {
    id: 3,
    name: "Nyra del Solsticio",
    className: "hechicera",
    level: 50,
    stats: { strength: 7, dexterity: 12, intelligence: 31, vitality: 14 },
    guildTag: "Corona Arcana",
    gold: 2210,
    updatedAt: "2026-07-20T08:45:00.000Z",
  },
];

module.exports = characters;
