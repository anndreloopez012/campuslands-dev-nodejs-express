const models = [
  {
    id: 1,
    name: "Casa Moderna",
    software: "Blender",
    type: "Residencial"
  },
  {
    id: 2,
    name: "Edificio Corporativo",
    software: "SketchUp",
    type: "Comercial"
  },
  {
    id: 3,
    name: "Museo Contemporáneo",
    software: "3ds Max",
    type: "Cultural"
  }
];

const getAllModels = () => {
  return models;
};

const findModelById = (id) => {
  return models.find((model) => model.id === id);
};

const addModel = ({ name, software, type }) => {
  const newModel = {
    id: models.length > 0 ? models[models.length - 1].id + 1 : 1,
    name,
    software,
    type
  };

  models.push(newModel);

  return newModel;
};

module.exports = {
  getAllModels,
  findModelById,
  addModel
};