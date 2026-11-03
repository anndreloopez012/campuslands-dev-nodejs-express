const [title, author, pagesText] = process.argv.slice(2);
const pages = Number(pagesText);

const errors = [];
if (!title || title.trim().length < 3) {
  errors.push('El titulo debe tener al menos 3 caracteres.');
}
if (!author || author.trim().length < 3) {
  errors.push('El autor debe tener al menos 3 caracteres.');
}
if (!Number.isInteger(pages) || pages <= 0) {
  errors.push('Las paginas deben ser un numero entero positivo.');
}

if (errors.length > 0) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ok: true, book: { title, author, pages } }, null, 2));
}