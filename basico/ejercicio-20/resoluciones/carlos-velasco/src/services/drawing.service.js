const drawings = [
  {
    id: 1,
    title: "Paisaje espacial",
    technique: "pintura digital",
    software: "Krita"
  },
  {
    id: 2,
    title: "Retrato fantástico",
    technique: "ilustración digital",
    software: "Photoshop"
  }
];

const getAllDrawings = () => {
  return drawings;
};

const createDrawing = ({ title, technique, software }) => {
  const newDrawing = {
    id: drawings.length + 1,
    title,
    technique,
    software
  };

  drawings.push(newDrawing);

  return newDrawing;
};

module.exports = {
  getAllDrawings,
  createDrawing
};