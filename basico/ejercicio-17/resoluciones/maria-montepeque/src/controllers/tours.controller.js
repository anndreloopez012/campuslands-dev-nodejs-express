import { json } from "../core/response.js";
import { listTours, findTour, listCountries, searchTours } from "../services/tours.service.js";

function getTours(req, res) {
    const data = listTours(req.query);
    json(res, 200, { ok: true, filters: req.query, count: data.length, data });
}

function getTour(req, res) {
    const tour = findTour(req.params.slug);
    if (!tour) return json(res, 404, { ok: false, message: `No existe el tour '${req.params.slug}'` });
    json(res, 200, { ok: true, data: tour });
}

function getItinerary(req, res) {
    const tour = findTour(req.params.slug);
    if (!tour) return json(res, 404, { ok: false, message: `No existe el tour '${req.params.slug}'` });

    const itinerary = tour.itinerary.map((activity, i) => ({ day: i + 1, activity }));
    json(res, 200, { ok: true, tour: tour.name, days: tour.days, itinerary });
}

function getCountries(req, res) {
    const data = listCountries();
    json(res, 200, { ok: true, count: data.length, data });
}

function search(req, res) {
    const { q } = req.query;
    if (!q || !q.trim()) return json(res, 400, { ok: false, message: "El parametro q es obligatorio" });

    const data = searchTours(q.trim());
    json(res, 200, { ok: true, query: q, count: data.length, data });
}

export { getTours, getTour, getItinerary, getCountries, search };