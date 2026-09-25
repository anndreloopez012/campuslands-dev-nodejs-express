let drawings = [
    {
      id: 1,
      titulo: "Paisaje Digital",
      artista: "Laura Martinez",
      software: "Photoshop",
      categoria: "Paisaje",
      completado: true
    },
    {
      id: 2,
      titulo: "Personaje Fantasia",
      artista: "Carlos Lopez",
      software: "Krita",
      categoria: "Personaje",
      completado: true
    },
    {
      id: 3,
      titulo: "Ciudad Futurista",
      artista: "Ana Garcia",
      software: "Procreate",
      categoria: "Concept Art",
      completado: false
    }
  ];
  
  function getAllDrawings() {
    return drawings;
  }
  
  function createDrawing(drawingData) {
    const newDrawing = {
      id: drawings.length > 0 ? drawings[drawings.length - 1].id + 1 : 1,
      ...drawingData
    };
  
    drawings.push(newDrawing);
  
    return newDrawing;
  }
  
  module.exports = {
    getAllDrawings,
    createDrawing
  };