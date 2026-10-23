const tattoos = [
  {
    id: 1,
    name: "Rosa tradicional",
    style: "tradicional",
    size: "mediano",
    artist: "Valentina"
  },
  {
    id: 2,
    name: "Dragón japonés",
    style: "japones",
    size: "grande",
    artist: "Marco"
  },
  {
    id: 3,
    name: "Luna minimalista",
    style: "minimalista",
    size: "pequeno",
    artist: "Sofia"
  },
  {
    id: 4,
    name: "Serpiente ornamental",
    style: "ornamental",
    size: "mediano",
    artist: "Diego"
  },
  {
    id: 5,
    name: "Calavera tradicional",
    style: "tradicional",
    size: "grande",
    artist: "Valentina"
  }
];

const findTattoos = ({ style, size }) => {
  let result = [...tattoos];

  if (style) {
    result = result.filter(
      (tattoo) => tattoo.style.toLowerCase() === style.toLowerCase()
    );
  }

  if (size) {
    result = result.filter(
      (tattoo) => tattoo.size.toLowerCase() === size.toLowerCase()
    );
  }

  return result;
};

const findTattooById = (id) => {
  return tattoos.find((tattoo) => tattoo.id === id);
};

module.exports = {
  findTattoos,
  findTattooById
};