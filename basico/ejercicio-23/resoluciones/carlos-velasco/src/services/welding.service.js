const weldings = [
  {
    id: 1,
    project: "Estructura metálica",
    technique: "MIG",
    material: "Acero"
  },
  {
    id: 2,
    project: "Puerta industrial",
    technique: "TIG",
    material: "Acero inoxidable"
  },
  {
    id: 3,
    project: "Soporte para maquinaria",
    technique: "Electrodo revestido",
    material: "Acero al carbono"
  }
];

const getAllWeldings = () => {
  return weldings;
};

const findWeldingById = (id) => {
  return weldings.find((welding) => welding.id === id);
};

const addWelding = ({ project, technique, material }) => {
  const newWelding = {
    id: weldings.length > 0
      ? weldings[weldings.length - 1].id + 1
      : 1,
    project,
    technique,
    material
  };

  weldings.push(newWelding);

  return newWelding;
};

const removeWelding = (id) => {
  const index = weldings.findIndex((welding) => welding.id === id);

  if (index === -1) {
    return null;
  }

  const [removedWelding] = weldings.splice(index, 1);

  return removedWelding;
};

module.exports = {
  getAllWeldings,
  findWeldingById,
  addWelding,
  removeWelding
};