import { artists, designs, sizeMultipliers } from "../data/studio.js";

function listArtists() {
    return artists;
}

function findArtist(id) {
    return artists.find((artist) => artist.id === id) ?? null;
}

function listDesignsByArtist(artistId, { style, maxPrice, sort, order, page, limit }) {
    let result = designs.filter((design) => design.artistId === artistId);

    if (style) result = result.filter((design) => design.style === style);
    if (maxPrice !== undefined) result = result.filter((design) => design.basePrice <= maxPrice);

    const direction = order === "desc" ? -1 : 1;
    result = [...result].sort((a, b) => (a[sort] > b[sort] ? direction : a[sort] < b[sort] ? -direction : 0));

    const total = result.length;
    const start = (page - 1) * limit;
    const items = result.slice(start, start + limit);

    return { items, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
}

function quoteDesign(designId, size) {
    const design = designs.find((item) => item.id === designId);
    if (!design) return null;

    const multiplier = sizeMultipliers[size];
    return { designId, name: design.name, size, price: Math.round(design.basePrice * multiplier) };
}

export { listArtists, findArtist, listDesignsByArtist, quoteDesign };
