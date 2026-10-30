'use strict';
const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');
const motor = require('./motor_idiomas.js');

function profile(source) { return motor.parseProfile(source,'avanzado.txt'); }
function same(input,p,dir,expected) {
  const r=motor.translate(input,p,dir);
  assert.equal(r.output,expected,input+' ('+dir+')');
  return r;
}
const words=profile('ORIGEN: Español\nIDIOMA: Demo\n[DICCIONARIO]\nsol = sun\nbuenos días = good morning\nhola = hi\n');
same('El sol brilla.',words,'encode','El sun brilla.');
same('soltar',words,'encode','soltar');
same('BUENOS DÍAS, HOLA',words,'encode','GOOD MORNING, HI');
same('good morning',words,'decode','buenos días');
assert.ok(words.warnings.length===0);
const mix=profile('ORIGEN: Base\nIDIOMA: Símbolos\n[ALFABETO]\na = ⟁\nb = ⧈\n[DICCIONARIO]\naba = ⭐\n');
same('aba ab',mix,'encode','⭐ ⟁⧈');
same('⭐ ⟁⧈',mix,'decode','aba ab');
assert.ok(motor.translate('aba x',mix,'encode').stats.coverage>0);
assert.ok(motor.translate('aba x',mix,'encode').stats.untranslatedWords.includes('x'));
const composed=profile('IDIOMA: Latín\n[ALFABETO]\né = ㊁\nñ = ㊂\n');
same('e\u0301ñ',composed,'encode','㊁㊂');
same('㊁㊂',composed,'decode','éñ');
const multi=profile('IDIOMA: Simbólico\n[ALFABETO]\na = ⧫\nb = ⧫⧫\n');
same('b',multi,'encode','⧫⧫');
same('⧫⧫',multi,'decode','b');
assert.ok(multi.warnings.some(w=>/prefij|ambigu/i.test(w)), 'Debe avisar si símbolos tienen prefijos compartidos');
assert.equal(motor.translate('???',words,'auto').direction,null);
assert.equal(motor.translate('hi',words,'auto').direction,'decode');
const space=profile('ORIGEN: Español\nIDIOMA: Otro\n[DICCIONARIO]\nbuenos días = good morning\n');
same('buenos   días',space,'encode','good morning');
same('buenos\n  días',space,'encode','good morning');
same('good  morning',space,'decode','buenos días');
const many=Array.from({length:4000},(_,i)=>'palabra'+i+' = simbolo'+i).join('\n');
const big=profile('ORIGEN: A\nIDIOMA: B\n[DICCIONARIO]\n'+many);
const start=performance.now();
const translated=motor.translate('palabra3000 palabra12',big,'encode');
assert.equal(translated.output,'simbolo3000 simbolo12');
assert.ok(performance.now()-start<5000,'La traducción con 4000 pares tardó demasiado');
console.log('OK: suite avanzada del motor: unicode, prefijos, diccionario, diagnostico, rendimiento y espacios.');
