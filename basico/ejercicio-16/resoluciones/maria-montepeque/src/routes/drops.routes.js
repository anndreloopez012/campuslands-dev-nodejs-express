const drops = [
    { id: 1, model: "Air Max 97", brand: "Nike", releaseDate: "2026-10-03", price: 180 },
    { id: 2, model: "Samba OG", brand: "Adidas", releaseDate: "2026-10-10", price: 110 },
    { id: 3, model: "Old Skool", brand: "Vans", releaseDate: "2026-10-17", price: 75 },
];

function dropsRoutes(app) {
    app.get("/drops", (req, res) => {
        res.json({ ok: true, count: drops.length, data: drops });
    });
}

export { dropsRoutes };