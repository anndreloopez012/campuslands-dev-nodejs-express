import { tours } from "../data/tours.js";

function listTours({ country, maxDays } = {}) {
    return tours.filter((tour) => {
        const byCountry = !country || tour.country.toLowerCase() === country.toLowerCase();
        const byDays = !maxDays || tour.days <= Number(maxDays);
        return byCountry && byDays;
    });
}

function findTour(slug) {
    return tours.find((tour) => tour.slug === slug) ?? null;
}

function listCountries() {
    return [...new Set(tours.map((tour) => tour.country))].sort();
}

function searchTours(term) {
    const needle = term.toLowerCase();
    return tours.filter((tour) => tour.name.toLowerCase().includes(needle) || tour.country.toLowerCase().includes(needle));
}

export { listTours, findTour, listCountries, searchTours };