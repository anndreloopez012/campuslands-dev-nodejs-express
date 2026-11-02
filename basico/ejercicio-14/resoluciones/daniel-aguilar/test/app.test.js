const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

let server;
let base;

before(
  () =>
    new Promise((resolve) => {
      server = app.listen(0, () => {
        base = `http://localhost:${server.address().port}`;
        resolve();
      });
    })
);
after(() => server.close());

const get = (path) => fetch(base + path);
const send = (method, path, body) =>
  fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const { validateBook, validateListQuery } = require('../src/validators/book.validator');

const valid = { title: ' Dune ', author: 'Frank Herbert', year: 1965, pages: 412 };

test('GET /basico/ejercicio-14', async () => {
  const body = await (await get('/basico/ejercicio-14')).json();
  assert.equal(body.topic, 'validacion de entrada');
});

test('validateBook acepta datos validos, limpia y descarta campos extra', () => {
  const { value, errors } = validateBook({ ...valid, isbn: '978-0-441-17271-9', tags: [' Epica '], admin: true });
  assert.deepEqual(errors, []);
  assert.equal(value.title, 'Dune');
  assert.equal(value.isbn, '9780441172719');
  assert.deepEqual(value.tags, ['epica']);
  assert.equal('admin' in value, false);
});

test('validateBook reporta todos los errores a la vez', () => {
  const { errors } = validateBook({ title: '', author: 'A', year: '1965', pages: 0, isbn: '123', tags: 'x' });
  assert.deepEqual(errors.map((e) => e.field), ['title', 'author', 'year', 'pages', 'isbn', 'tags']);
});

test('validateBook rechaza cuerpos que no son objetos', () => {
  for (const body of [null, [], 'texto', 42, undefined]) {
    assert.equal(validateBook(body).errors[0].field, 'body');
  }
});

test('validateListQuery usa valores por defecto y valida rangos', () => {
  assert.deepEqual(validateListQuery({}).value, { page: 1, limit: 10, q: '' });
  assert.equal(validateListQuery({ page: '0' }).errors.length, 1);
  assert.equal(validateListQuery({ limit: '100' }).errors.length, 1);
  assert.equal(validateListQuery({ page: 'abc', limit: '2.5' }).errors.length, 2);
});

test('POST /books responde 201 con datos validos y 400 con invalidos', async () => {
  const ok = await send('POST', '/books', valid);
  assert.equal(ok.status, 201);
  assert.equal((await ok.json()).book.title, 'Dune');

  const bad = await send('POST', '/books', { title: 'x' });
  const body = await bad.json();
  assert.equal(bad.status, 400);
  assert.equal(body.errors.length, 3);
});

test('GET /books pagina y busca', async () => {
  const body = await (await get('/books?limit=2&page=2')).json();
  assert.equal(body.books.length, 2);
  assert.equal(body.total, 4);
  const search = await (await get('/books?q=asimov')).json();
  assert.equal(search.total, 1);
  assert.equal((await get('/books?page=-1')).status, 400);
});

test('GET /books/:id valida el id', async () => {
  assert.equal((await get('/books/1')).status, 200);
  assert.equal((await get('/books/999')).status, 404);
  assert.equal((await get('/books/uno')).status, 400);
});
