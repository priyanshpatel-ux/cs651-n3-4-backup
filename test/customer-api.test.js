const assert = require('node:assert/strict');
const { before, after, test } = require('node:test');
const app = require('../app');

let server;
let baseUrl;

before(async () => {
  server = await new Promise(resolve => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  baseUrl = 'http://127.0.0.1:' + server.address().port;
});

after(() => new Promise((resolve, reject) => {
  server.close(error => error ? reject(error) : resolve());
}));

function post(path, body, contentType = 'application/json') {
  return fetch(baseUrl + path, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  });
}

test('customer API returns the assignment JSON contract and is repeatable', async () => {
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await post('/api/customer', { name: 'Linn', email: 'linn@example.com' });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /application\/json/);
    assert.deepEqual(await response.json(), { message: 'Welcome Linn', email: 'linn@example.com' });
  }
});

test('customer API rejects missing, blank, and non-string fields', async () => {
  for (const body of [{}, [], { name: 'Linn' }, { name: '', email: 'a@example.com' },
    { name: '   ', email: 'a@example.com' }, { name: {}, email: 'a@example.com' },
    { name: 'Linn', email: null }, { name: 'Linn', email: ['a@example.com'] }]) {
    const response = await post('/api/customer', body);
    assert.equal(response.status, 400, JSON.stringify(body));
    assert.equal(typeof (await response.json()).error, 'string');
  }
});

test('customer API rejects form encoding with a JSON error', async () => {
  const response = await post('/api/customer', 'name=Linn&email=linn%40example.com', 'application/x-www-form-urlencoded');
  assert.equal(response.status, 415);
  assert.equal(typeof (await response.json()).error, 'string');
});

test('malformed and oversized JSON produce bounded JSON errors', async () => {
  for (const [body, status] of [['{"name":', 400], [JSON.stringify({ name: 'a'.repeat(110000), email: 'a@example.com' }), 413]]) {
    const response = await post('/api/customer', body);
    assert.equal(response.status, status);
    const data = await response.json();
    assert.equal(typeof data.error, 'string');
    assert.equal(data.stack, undefined);
  }
});

test('HTML-like text and Unicode remain plain JSON data', async () => {
  const name = '<img src=x onerror=alert(1)> မြန်မာ';
  const response = await post('/api/customer', { name, email: 'linn@example.com' });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { message: 'Welcome ' + name, email: 'linn@example.com' });
});

test('traditional customer submission still returns its original HTML response', async () => {
  const response = await post('/readCustomerInfoAndRespond', 'name=Linn&email=linn%40example.com', 'application/x-www-form-urlencoded');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.equal(await response.text(), 'Welcome,  Linn</br> We will reach you at: linn@example.com');
});

test('existing GET and POST name routes remain available', async () => {
  assert.equal(await (await fetch(baseUrl + '/readNameAndRespond?name=Linn')).text(), 'hello Linn');
  assert.equal(await (await fetch(baseUrl + '/read/Linn')).text(), 'hello Linn');
  const response = await post('/readNameAndRespond', 'name=Linn', 'application/x-www-form-urlencoded');
  assert.equal(await response.text(), 'hello now Linn');
});

test('home page exposes both submission models', async () => {
  const response = await fetch(baseUrl + '/');
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /action="\/readCustomerInfoAndRespond"/);
  assert.match(html, /id="customer-api-form"/);
  assert.match(html, /src="\/javascripts\/customer.js"/);
  const script = await fetch(baseUrl + '/javascripts/customer.js');
  assert.equal(script.status, 200);
  assert.match(script.headers.get('content-type'), /javascript/);
});
