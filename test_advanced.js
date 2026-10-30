'use strict';
const assert=require('node:assert/strict');
const engine=require('./motor_idiomas.js');

function profile(content){return engine.parseProfile(content,'prueba.txt');}
function eq(txt,p,dir,expected){
  const out=engine.translate(txt,p,dir);
  assert.equal(out.output,expected,JSON.stringify({txt,dir,out:out.output,expected}));
  assert.ok(out.matches>0);
  return out;
}

// Respeta limites de palabras, prioriza frases y conserva mayusculas.
const phrases=profile(`ORIGEN: Español
IDIOMA: Ejemplo
[DICCIONARIO]
gato = cat
gato negro = black cat
sol = sun
hola = hello
`);
eq('El gato negro, gato.',phrases,'encode','El black cat, cat.');
eq('GATO NEGRO',phrases,'encode','BLACK CAT');
eq('Hola, hola',phrases,'encode','Hello, hello');
eq('sol en sol',phrases,'encode','sun en sun');
const boundary=profile(`[DICCIONARIO]
el = the
`);
eq('el hotel',boundary,'encode','the hotel');

// Un mensaje parcialmente convertido se informa en el diagnostico.
const partial=profile(`[ALFABETO]
a = @
`);
const partialResult=eq('casa',partial,'encode','c@s@');
assert.equal(partialResult.stats.coverage,50);
assert.ok(partialResult.stats.untranslatedWords.includes('casa'));

// Compatibilidad Unicode, caracteres combinados y simbolos de varias unidades.
const accent=profile(`[DICCIONARIO]
café = coffee
`);
eq('cafe\u0301',accent,'encode','coffee');
const emoji=profile(`[ALFABETO]
a = 👩‍🚀
b = 🛰️
`);
eq('ab',emoji,'encode','👩‍🚀🛰️');
eq('👩‍🚀🛰️',emoji,'decode','ab');

// Solo se puede deshacer una asignacion cuando los destinos son unicos.
const duplicate=profile(`[DICCIONARIO]
hola = hello
saludo = hello
`);
assert.equal(duplicate.words.length,1);
assert.ok(duplicate.warnings.some(w=>w.includes('ambigua')));
assert.equal(engine.version,'3.0.0');
assert.deepEqual(engine.explain('sol',phrases,'encode').coverage,100);

// Deteccion manual y automatica, sin inventar resultados.
eq('hola',phrases,'auto','hello');
eq('hello',phrases,'auto','hola');
const unknown=engine.translate('no aparece',phrases,'auto');
assert.equal(unknown.direction,null);
assert.ok(unknown.warning);
const overlap=profile(`[ALFABETO]
a = b
b = a
`);
assert.equal(engine.translate('ab',overlap,'auto').direction,null);
eq('ab',overlap,'encode','ba');

// Unicode con mayusculas y texto de gran tamaño sin expresiones regulares gigantes.
const alpha=profile(`[ALFABETO]
a = ø
`);
eq('Aa',alpha,'encode','Øø');
const bulk='a'.repeat(100000);
const out=engine.translate(bulk,alpha,'encode');
assert.equal(out.output,'ø'.repeat(100000));
assert.equal(out.stats.coverage,100);
assert.equal(out.matches,100000);
assert.deepEqual(out.stats.untranslatedWords,[]);

console.log('OK: pruebas avanzadas Unicode, limites, estadisticas y texto largo.');
