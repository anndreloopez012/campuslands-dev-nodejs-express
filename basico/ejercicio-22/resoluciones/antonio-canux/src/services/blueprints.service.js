const blueprints = [
  { id: 1, title: "Museo Moderno", areaM2: 2400, floors: 3 },
  { id: 2, title: "Villa Minimalista", areaM2: 380, floors: 2 }
];

export const getAll = () => blueprints;
export const getById = (id) => blueprints.find(b => b.id === id);
export const create = ({ title, areaM2, floors }) => {
  const item = { id: blueprints.length + 1, title: title.trim(), areaM2: Number(areaM2), floors: Number(floors) };
  blueprints.push(item);
  return item;
};
