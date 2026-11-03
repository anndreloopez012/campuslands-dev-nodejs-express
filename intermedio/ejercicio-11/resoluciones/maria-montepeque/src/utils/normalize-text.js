// paso todo a minusculas y le quito las tildes
// asi "cancion" encuentra "Canción"
function normalizeText(texto) {
    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .trim();
}

export default normalizeText;
