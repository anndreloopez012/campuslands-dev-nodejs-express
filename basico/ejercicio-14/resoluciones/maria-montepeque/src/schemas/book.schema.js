const GENRES = ["novela", "poesia", "ensayo", "cuento", "biografia"];

const bookSchema = {
    title: { rules: { required: true, string: true, minLength: 2 } },
    author: { rules: { required: true, string: true, minLength: 3 } },
    isbn: { rules: { required: true, pattern: /^\d{13}$/ } },
    pages: { rules: { required: true, integer: true, min: 1, max: 5000 }, cast: Number },
    genre: { rules: { required: true, oneOf: GENRES } },
};

export { bookSchema, GENRES };