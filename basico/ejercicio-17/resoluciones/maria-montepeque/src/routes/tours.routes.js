import { getTours, getTour, getItinerary, getCountries, search } from "../controllers/tours.controller.js";

function toursRoutes(router) {
    router.get("/tours", getTours);
    router.get("/tours/:slug", getTour);
    router.get("/tours/:slug/itinerary", getItinerary);
    router.get("/countries", getCountries);
    router.get("/search", search);
}

export { toursRoutes };