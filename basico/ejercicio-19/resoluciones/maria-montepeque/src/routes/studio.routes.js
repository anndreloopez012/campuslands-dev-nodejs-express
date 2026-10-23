import { getArtists, getArtist, getArtistDesigns, getQuote } from "../controllers/studio.controller.js";

function studioRoutes(router) {
    router.get("/artists", getArtists);
    router.get("/artists/:artistId", getArtist);
    router.get("/artists/:artistId/designs", getArtistDesigns);
    router.get("/designs/:designId/quote/:size", getQuote);
}

export { studioRoutes };
