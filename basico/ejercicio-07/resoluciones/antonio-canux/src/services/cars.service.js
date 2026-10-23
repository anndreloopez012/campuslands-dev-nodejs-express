// Base de datos en memoria para el ejercicio
const cars = [
    { id: 1, brand: 'Porsche', model: '911 GT3', year: 2026 },
    { id: 2, brand: 'Ferrari', model: 'SF90 Stradale', year: 2025 }
];

export const getCars = () => cars;

export const addCar = (brand, model, year) => {
    const newCar = { 
        id: cars.length + 1, 
        brand, 
        model, 
        year: parseInt(year) 
    };
    cars.push(newCar);
    return newCar;
};