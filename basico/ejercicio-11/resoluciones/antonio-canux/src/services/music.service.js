// Catálogo en memoria
const catalog = [
    { id: 1, artist: 'Twenty One Pilots', topSong: 'Stressed Out', monthlyListeners: '30M' },
    { id: 2, artist: 'Nightwish', topSong: 'Nemo', monthlyListeners: '3M' },
    { id: 3, artist: 'Malacates Trébol Shop', topSong: 'Morena', monthlyListeners: '1M' },
    { id: 4, artist: "The X's", topSong: 'Desconocido', monthlyListeners: '500k' }
];

export const searchArtist = (artistName) => {
    // Retornamos una Promesa explícita
    return new Promise((resolve, reject) => {
        
        // Simulamos un retraso de base de datos de 1.5 segundos
        setTimeout(() => {
            const found = catalog.find(
                item => item.artist.toLowerCase() === artistName.toLowerCase()
            );

            if (found) {
                // Si encontramos al artista, la promesa se cumple (resolve)
                resolve(found);
            } else {
                // Si no, la promesa es rechazada (reject) con un error
                reject(new Error(`El artista '${artistName}' no se encuentra en el catálogo.`));
            }
        }, 1500);
        
    });
};