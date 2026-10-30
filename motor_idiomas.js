/* Motor TXT Universal 3.0: equivalencias Unicode, frases, alfabetos y diagnostico.
   Sin dependencias, Internet ni telemetria. CommonJS y navegador. */
(function(root, factory) {
  const engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  root.MotorIdiomasTXT = engine;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const MAX_ENTRIES = 5000;
  const MAX_TEXT = 2_000_000;
  const MAX_PAIR = 160;
  const WORD_CHAR = /[\p{L}\p{N}\p{M}_]/u;
  const SOURCE_WORD = /[\p{L}\p{N}\p{M}_]+/gu;
  const cache = new WeakMap();
  const lower = s => s.toLocaleLowerCase();
  const cp = (s, i) => i < 0 || i >= s.length ? '' : String.fromCodePoint(s.codePointAt(i));
  const prevCP = (s, i) => {
    if (i <= 0) return '';
    const p = i > 1 && s.charCodeAt(i-1) >= 0xDC00 && s.charCodeAt(i-1) <= 0xDFFF ? i-2 : i-1;
    return cp(s, p);
  };
  const foldHeading = s => s.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase().trim();
  const trimQuotes = s => s.trim().replace(/^["'“”‘’]+|["'“”‘’]+$/gu, '').trim();
  const meaningful = s => [...s].filter(ch => !/\s/u.test(ch)).length;

  function parseProfile(raw, filename='idioma.txt') {
    if (typeof raw !== 'string' || !raw.trim()) throw new Error('El TXT está vacío.');
    if (raw.length > MAX_TEXT) throw new Error('El archivo es demasiado grande (máximo 2 millones de caracteres).');
    const lines = raw.replace(/^\uFEFF/u,'').replace(/\r\n?/gu,'\n').split('\n');
    let name = filename.replace(/\.txt$/iu,'').replace(/[_-]+/gu,' ').trim() || 'Idioma personalizado';
    let sourceLanguage = 'Idioma de origen';
    let mode = 'auto', entries=0;
    const alphabet=[], words=[], warnings=[];
    const keys = {alphabet:new Set(),words:new Set()};
    const values = {alphabet:new Map(),words:new Map()};
    for(let i=0;i<lines.length;i++) {
      const line = lines[i].trim();
      if(!line || /^(?:#|\/\/|;)/u.test(line))continue;
      const explicit = line.match(/^(?:IDIOMA|DESTINO|IDIOMA_DESTINO)\s*[:=]\s*(.{1,100})$/iu);
      if(explicit){name=explicit[1].trim();continue;}
      const source = line.match(/^(?:ORIGEN|IDIOMA_ORIGEN|LENGUA_BASE)\s*[:=]\s*(.{1,100})$/iu);
      if(source){sourceLanguage=source[1].trim();continue;}
      if(i<4){
        const title=line.match(/^(.{2,65}?)\s+[—–-]\s+(?:ALFABETO|DICCIONARIO|VOCABULARIO|IDIOMA)\b/iu);
        if(title){name=title[1].trim();continue;}
      }
      const header=foldHeading(line.replace(/^\[(.*)\]$/u,'$1').replace(/:$/u,''));
      if(/^(?:ALFABETO|ALFABETO COMPLETO|LETRAS|SIMBOLOS|MAPA DE LETRAS)$/u.test(header)){mode='alphabet';continue;}
      if(/^(?:DICCIONARIO|VOCABULARIO|PALABRAS|TRADUCCIONES|FRASES|EXPRESIONES)$/u.test(header)){mode='words';continue;}
      if(/^(?:REGLAS|EJEMPLOS|COMO DESCIFRAR|COMO USAR|INSTRUCCIONES|NOTAS|DESCRIPCION|GRAMATICA)$/u.test(header)){mode='ignore';continue;}
      if(/^(?:[-=_\s]){3,}$/u.test(line)||mode==='ignore')continue;
      const match=line.match(/^(.+?)\s*(?:=>|->|=|→|↔|\|)\s*(.+)$/u);
      if(!match)continue;
      const from=trimQuotes(match[1]).normalize('NFC');
      const to=trimQuotes(match[2]).normalize('NFC');
      if(!from||!to){warnings.push(`Línea ${i+1}: equivalencia vacía.`);continue;}
      if(from.length>MAX_PAIR||to.length>MAX_PAIR){warnings.push(`Línea ${i+1}: máximo ${MAX_PAIR} caracteres por lado.`);continue;}
      if(/^(?:LETRA|SIMBOLO|ESPANOL|IDIOMA|PALABRA)$/iu.test(from) &&
         /^(?:SIMBOLO|LETRA|TRADUCCION|IDIOMA|ESPANOL)$/iu.test(to))continue;
      const single=[...from].length===1 && /\p{L}/u.test(from);
      const type=mode==='words'?'words':mode==='alphabet'?'alphabet':single?'alphabet':'words';
      if(type==='alphabet'&&!single){warnings.push(`Línea ${i+1}: el alfabeto requiere una sola letra a la izquierda; usa [DICCIONARIO] para frases.`);continue;}
      const key=lower(from), value=lower(to);
      if(keys[type].has(key)){warnings.push(`Línea ${i+1}: entrada duplicada «${from}», omitida.`);continue;}
      if(values[type].has(value)){warnings.push(`Línea ${i+1}: «${to}» ya corresponde a «${values[type].get(value)}»; la inversión es ambigua y se omitió.`);continue;}
      keys[type].add(key);values[type].set(value,from);
      (type==='alphabet'?alphabet:words).push({from,to});
      entries++;
      if(entries>MAX_ENTRIES)throw new Error('Demasiadas entradas. Máximo: 5000.');
    }
    if(!entries)throw new Error('No hay equivalencias reconocibles. Añade [ALFABETO] con a = símbolo o [DICCIONARIO] con hola = palabra.');
    const profile={name,sourceLanguage,filename,alphabet,words,warnings,entries};
    return profile;
  }

  function buckets(pairs, direction) {
    const result=new Map();
    for(const pair of pairs) {
      const key=direction==='encode'?pair.from:pair.to;
      const value=direction==='encode'?pair.to:pair.from;
      const item={key,value,folded:lower(key)};
      const first=cp(item.folded,0);
      if(!result.has(first)) result.set(first,[]);
      result.get(first).push(item);
    }
    for(const group of result.values())group.sort((a,b)=>b.key.length-a.key.length);
    return result;
  }
  function compile(profile) {
    if(!profile || !Array.isArray(profile.alphabet)||!Array.isArray(profile.words)) {
      throw new Error('Primero carga un perfil TXT válido.');
    }
    if(cache.has(profile))return cache.get(profile);
    const compiled={encode:{word:buckets(profile.words,'encode'),alpha:buckets(profile.alphabet,'encode')},
                    decode:{word:buckets(profile.words,'decode'),alpha:buckets(profile.alphabet,'decode')}};
    cache.set(profile,compiled);
    return compiled;
  }
  function findMatch(text,i,table,boundaries) {
    const key=lower(cp(text,i));
    const group=table.get(key);
    if(!group)return null;
    for(const item of group) {
      const segment=text.slice(i,i+item.key.length);
      if(lower(segment)!==item.folded)continue;
      if(boundaries) {
        // Una frase solo requiere limites cuando empieza/termina con letras o numeros.
        const before=prevCP(text,i), after=cp(text,i+item.key.length);
        if(WORD_CHAR.test(cp(item.key,0)) && before && WORD_CHAR.test(before))continue;
        if(WORD_CHAR.test(prevCP(item.key,item.key.length))&&after&&WORD_CHAR.test(after))continue;
      }
      return item;
    }
    return null;
  }
  function preserveCase(input,replacement) {
    if(!/\p{L}/u.test(replacement)||!/\p{L}/u.test(input))return replacement;
    if(input===input.toLocaleUpperCase()&&input!==input.toLocaleLowerCase()) {
      return replacement.toLocaleUpperCase();
    }
    const first=cp(input,0);
    if(first===first.toLocaleUpperCase()&&first!==first.toLocaleLowerCase()) {
      const firstOut=cp(replacement,0);
      return firstOut.toLocaleUpperCase()+replacement.slice(firstOut.length);
    }
    return replacement;
  }
  function scan(text,compiled,direction,keepOutput=true) {
    const tables=compiled[direction];
    let output='',matches=0,matchedCharacters=0;
    const spans=keepOutput?[]:null;
    for(let i=0;i<text.length;) {
      let found=findMatch(text,i,tables.word,true);
      if(!found)found=findMatch(text,i,tables.alpha,false);
      if(found) {
        const original=text.slice(i,i+found.key.length);
        const changed=preserveCase(original,found.value);
        if(keepOutput)output+=changed;
        const end=i+found.key.length;
        if(keepOutput)spans.push([i,end]);
        matchedCharacters+=meaningful(original);
        matches++;
        i=end;
      } else {
        const char=cp(text,i);
        if(keepOutput)output+=char;
        i+=char.length;
      }
    }
    return {output,matches,matchedCharacters,spans};
  }
  function detectDirection(text,profile) {
    if(typeof text!=='string'||!text.trim())return {direction:'unknown',confidence:'ninguna',reason:'Introduce un texto.'};
    const compiled=compile(profile);
    const normalized=text.normalize('NFC');
    const e=scan(normalized,compiled,'encode',false);
    const d=scan(normalized,compiled,'decode',false);
    const targetSpecial=profile.alphabet.filter(p=>/[^\p{L}\p{N}\p{M}\s]/u.test(p.to));
    let eScore=e.matches*4+e.matchedCharacters;
    let dScore=d.matches*4+d.matchedCharacters;
    if(targetSpecial.some(p=>normalized.includes(p.to)))dScore+=7;
    if(!eScore&&!dScore)return {direction:'unknown',confidence:'ninguna',reason:'El texto no coincide con las equivalencias del TXT cargado.'};
    if(eScore>0&&dScore>0&&(Math.abs(eScore-dScore)<=2||Math.max(eScore,dScore)/Math.min(eScore,dScore)<1.3)) {
      return {direction:'ambiguous',confidence:'baja',reason:'El texto coincide con ambas escrituras. Selecciona la dirección manualmente.'};
    }
    const direction=eScore>dScore?'encode':'decode';
    return {direction,confidence:Math.max(eScore,dScore)>=7?'alta':'media',
      reason:direction==='encode'? `Coincidencias de ${profile.sourceLanguage}.` : `Coincidencias de ${profile.name}.`};
  }
  function explain(text,profile,direction='auto') {
    const result=translate(text,profile,direction);
    return result.stats;
  }
  function translate(text,profile,requestedDirection='auto') {
    if(typeof text!=='string')throw new Error('El texto debe ser una cadena.');
    if(text.length>MAX_TEXT)throw new Error('Texto demasiado largo (máximo 2 millones de caracteres).');
    const compiled=compile(profile);
    const normalized=text.normalize('NFC');
    const detection=detectDirection(normalized,profile);
    let direction=requestedDirection;
    if(direction==='auto') {
      if(detection.direction==='unknown'||detection.direction==='ambiguous') {
        return {output:'',direction:null,detection,matches:0,warning:detection.reason+' Usa la dirección manual.',
          stats:{coverage:0,matchedCharacters:0,totalCharacters:meaningful(normalized),untranslatedWords:[]}};
      }
      direction=detection.direction;
    }
    if(direction!=='encode'&&direction!=='decode')throw new Error('Dirección desconocida.');
    const scanResult=scan(normalized,compiled,direction);
    const totalCharacters=meaningful(normalized);
    const untranslatedWords=[],seen=new Set();
    let spanIndex=0;
    for(const m of normalized.matchAll(SOURCE_WORD)) {
      const start=m.index,end=start+m[0].length;
      while(spanIndex<scanResult.spans.length&&scanResult.spans[spanIndex][1]<=start)spanIndex++;
      let cursor=start, scanIndex=spanIndex;
      while(scanIndex<scanResult.spans.length && scanResult.spans[scanIndex][0]<end) {
        const span=scanResult.spans[scanIndex];
        if(span[0]>cursor)break;
        cursor=Math.max(cursor,span[1]);
        scanIndex++;
      }
      if(cursor>=end)continue;
      const word=lower(m[0]);
      if(!seen.has(word)&&untranslatedWords.length<20){seen.add(word);untranslatedWords.push(m[0]);}
    }
    const stats={coverage:totalCharacters?Math.min(100,Math.round(100*scanResult.matchedCharacters/totalCharacters)):0,
      matchedCharacters:scanResult.matchedCharacters,totalCharacters,untranslatedWords};
    return {output:scanResult.output,direction,detection,matches:scanResult.matches,stats,
      warning:scanResult.matches?'':'No se encontraron equivalencias para este texto.'};
  }
  return {parseProfile,detectDirection,translate,explain,version:'3.0.0'};
});
