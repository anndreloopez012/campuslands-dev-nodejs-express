const destinations = [
  {
    id: 1,
    name: "Antigua Guatemala",
    country: "Guatemala",
    type: "historical"
  },
  {
    id: 2,
    name: "Lake Atitlan",
    country: "Guatemala",
    type: "nature"
  },
  {
    id: 3,
    name: "Paris",
    country: "France",
    type: "city"
  },
  {
    id: 4,
    name: "Tokyo",
    country: "Japan",
    type: "city"
  }
];

function getAllDestinations(country) {
  if (!country) {
    return destinations;
  }

  return destinations.filter(
    (destination) =>
      destination.country.toLowerCase() === country.toLowerCase()
  );
}

function getDestinationById(id) {
  return destinations.find((destination) => destination.id === id);
}

module.exports = {
  getAllDestinations,
  getDestinationById
};