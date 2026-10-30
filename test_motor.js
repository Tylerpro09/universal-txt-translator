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


const cli = require('./cli.js');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
assert.equal(cli.parseArgs(['-p','idioma.txt','-t','hola']).direction, 'auto');
assert.equal(cli.parseArgs(['-p','idioma.txt','-t','hola','-d','decode']).direction, 'decode');
assert.throws(() => cli.parseArgs(['-p','idioma.txt','-t','hola','-d','invalida']), /Dirección inválida/);
assert.throws(() => cli.parseArgs(['-p','idioma.txt','-t','hola','--input','x.txt']), /no ambos/);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'motor-txt-test-'));
try {
  const profilePath = path.join(tmp, 'idioma.txt');
  const inputPath = path.join(tmp, 'mensaje.txt');
  const outputPath = path.join(tmp, 'traducido.txt');
  fs.writeFileSync(profilePath, 'ORIGEN: A\nIDIOMA: B\n[DICCIONARIO]\nhola = hello\n');
  fs.writeFileSync(inputPath, 'hola');
  let proc = spawnSync(process.execPath, ['cli.js', '-p', profilePath, '-t', 'hola', '-d', 'encode'], {cwd:__dirname, encoding:'utf8'});
  assert.equal(proc.status, 0, proc.stderr);
  assert.equal(proc.stdout.trim(), 'hello');
  proc = spawnSync(process.execPath, ['cli.js', '-p', profilePath, '-i', inputPath, '-o', outputPath, '-d', 'encode'], {cwd:__dirname, encoding:'utf8'});
  assert.equal(proc.status, 0, proc.stderr);
  assert.equal(fs.readFileSync(outputPath, 'utf8'), 'hello');
  proc = spawnSync(process.execPath, ['cli.js', '-p', profilePath, '-t', 'hola', '-d', 'invalida'], {cwd:__dirname, encoding:'utf8'});
  assert.equal(proc.status, 1);
} finally {
  fs.rmSync(tmp, {recursive:true, force:true});
}
console.log('OK: pruebas de la CLI completadas.');
