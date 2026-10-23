const artists = [
    { id: 1, name: "Valeria Ink", styles: ["blackwork", "geometrico"], yearsActive: 8 },
    { id: 2, name: "Tomas Aguja", styles: ["realismo", "acuarela"], yearsActive: 12 },
    { id: 3, name: "Nina Trazo", styles: ["minimalista", "fineline"], yearsActive: 4 },
];

const designs = [
    { id: 101, artistId: 1, name: "Mandala lunar", style: "geometrico", basePrice: 180 },
    { id: 102, artistId: 1, name: "Cuervo en tinta", style: "blackwork", basePrice: 220 },
    { id: 103, artistId: 1, name: "Brujula nordica", style: "blackwork", basePrice: 150 },
    { id: 104, artistId: 2, name: "Retrato de leon", style: "realismo", basePrice: 400 },
    { id: 105, artistId: 2, name: "Colibri en acuarela", style: "acuarela", basePrice: 260 },
    { id: 106, artistId: 3, name: "Ola en linea fina", style: "fineline", basePrice: 90 },
    { id: 107, artistId: 3, name: "Constelacion", style: "minimalista", basePrice: 70 },
];

const sizeMultipliers = { small: 1, medium: 1.5, large: 2.25 };

export { artists, designs, sizeMultipliers };
