const assert = require('assert');
const m = require('./motor_idiomas.js');
const profile = m.parseProfile(`ORIGEN: Español
IDIOMA: Inglés
[DICCIONARIO]
hola = hello
adiós = goodbye
buenos días = good morning
`, 'es-en.txt');
assert.equal(profile.name, 'Inglés');
assert.equal(profile.sourceLanguage, 'Español');
assert.equal(profile.entries, 3);
assert.equal(m.translate('Hola, buenos días!', profile, 'encode').output, 'Hello, good morning!');
assert.equal(m.translate('Hello, good morning!', profile, 'decode').output, 'Hola, buenos días!');
assert.equal(m.translate('hola', profile, 'auto').direction, 'encode');
assert.equal(m.translate('hello', profile, 'auto').direction, 'decode');
const cipher = m.parseProfile(`IDIOMA: Otro alfabeto
[ALFABETO]
a = @
b = #
c = $
`);
assert.equal(m.translate('cab', cipher, 'encode').output, '$@#');
assert.equal(m.translate('$@#', cipher, 'decode').output, 'cab');
assert.throws(() => m.parseProfile(`IDIOMA: Sin datos
[ALFABETO]
# nada`), /No hay equivalencias/);
console.log('OK: pruebas del motor completadas.');
