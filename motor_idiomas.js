/* Motor universal TXT de alfabetos y diccionarios — funciona sin red ni dependencias.
   Exposición: window.MotorIdiomasTXT / require('./motor_idiomas.js') */
(function (root, factory) {
  const engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  root.MotorIdiomasTXT = engine;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const MAX_ENTRIES = 5000;
  const MAX_TEXT = 2_000_000;
  const trimQuotes = v => v.trim().replace(/^["'“”‘’]+|["'“”‘’]+$/gu, '').trim();
  const foldHeader = v => v.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase().trim();
  // El motor no presupone la ortografía de ningún idioma: las tildes son distintas.
  const foldLetter = v => v.toLocaleLowerCase();
  const escRe = v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startsWithAt = (str, token, pos, ignoreCase) => ignoreCase
    ? str.slice(pos, pos + token.length).toLocaleLowerCase() === token.toLocaleLowerCase()
    : str.startsWith(token, pos);

  function parseProfile(raw, filename = 'idioma.txt') {
    if (typeof raw !== 'string' || !raw.trim()) throw new Error('El TXT está vacío.');
    if (raw.length > MAX_TEXT) throw new Error('El archivo es demasiado grande (máximo 2 millones de caracteres).');
    const text = raw.replace(/^\uFEFF/u, '').replace(/\r\n?/gu, '\n');
    const lines = text.split('\n');
    const defaultName = filename.replace(/\.txt$/iu, '').replace(/[_-]+/gu, ' ').trim() || 'Idioma personalizado';
    let name = defaultName;
    let sourceLanguage = 'Idioma de origen';
    let mode = 'auto';
    const alphabet = [];
    const words = [];
    const warnings = [];
    const alphabetKeys = new Set();
    const wordKeys = new Set();
    const alphabetValues = new Map();
    const wordValues = new Map();
    let parsed = 0;

    for (let i = 0; i < lines.length; i++) {
      const original = lines[i];
      const line = original.trim();
      if (!line || /^(?:#|\/\/|;)/u.test(line)) continue;

      const explicit = line.match(/^(?:IDIOMA|DESTINO|IDIOMA_DESTINO)\s*[:=]\s*(.{1,100})$/iu);
      if (explicit) { name = explicit[1].trim(); continue; }
      const origin = line.match(/^(?:ORIGEN|IDIOMA_ORIGEN|LENGUA_BASE)\s*[:=]\s*(.{1,100})$/iu);
      if (origin) { sourceLanguage = origin[1].trim(); continue; }
      if (i < 4) {
        const title = line.match(/^(.{2,65}?)\s+[—–-]\s+(?:ALFABETO|DICCIONARIO|VOCABULARIO|IDIOMA)\b/iu);
        if (title) { name = title[1].trim(); continue; }
      }
      const header = foldHeader(line.replace(/^\[(.*)\]$/u, '$1').replace(/:$/u, ''));
      if (/^(?:ALFABETO|ALFABETO COMPLETO|LETRAS|SIMBOLOS|MAPA DE LETRAS)$/u.test(header)) {
        mode = 'alphabet'; continue;
      }
      if (/^(?:DICCIONARIO|VOCABULARIO|PALABRAS|TRADUCCIONES|FRASES)$/u.test(header)) {
        mode = 'words'; continue;
      }
      if (/^(?:REGLAS|EJEMPLOS|COMO DESCIFRAR|COMO USAR|INSTRUCCIONES|NOTAS|DESCRIPCION|GRAMATICA)$/u.test(header)) {
        mode = 'ignore'; continue;
      }
      if (/^(?:[-=_\s]){3,}$/u.test(line)) continue;
      if (mode === 'ignore') continue;

      // Formatos admitidos: a = valor, a | valor, palabra -> traducción.
      const match = line.match(/^(.+?)\s*(?:=>|->|=|→|↔|\|)\s*(.+)$/u);
      if (!match) continue;
      const left = trimQuotes(match[1]);
      const right = trimQuotes(match[2]);
      if (!left || !right || left.length > 160 || right.length > 160) continue;
      if (/^(?:LETRA|SIMBOLO|ESPANOL|IDIOMA|PALABRA)$/iu.test(left) &&
          /^(?:SIMBOLO|LETRA|TRADUCCION|IDIOMA|ESPANOL)$/iu.test(right)) continue;

      const isLetter = [...left].length === 1 && /\p{L}/u.test(left);
      const type = mode === 'words' ? 'words' : mode === 'alphabet' ? 'alphabet' : (isLetter ? 'alphabet' : 'words');
      if (type === 'alphabet' && !isLetter) {
        warnings.push(`Línea ${i + 1}: una entrada de alfabeto debe tener una sola letra a la izquierda.`);
        continue;
      }
      const normalizedKey = type === 'alphabet' ? foldLetter(left) : left.toLocaleLowerCase();
      const ownKeys = type === 'alphabet' ? alphabetKeys : wordKeys;
      const ownValues = type === 'alphabet' ? alphabetValues : wordValues;
      if (ownKeys.has(normalizedKey)) { warnings.push(`Línea ${i + 1}: entrada duplicada «${left}», omitida.`); continue; }
      if (ownValues.has(right.toLocaleLowerCase())) {
        warnings.push(`Línea ${i + 1}: «${right}» ya corresponde a «${ownValues.get(right.toLocaleLowerCase())}». La traducción inversa sería ambigua; se omitió.`);
        continue;
      }
      ownKeys.add(normalizedKey);
      ownValues.set(right.toLocaleLowerCase(), left);
      (type === 'alphabet' ? alphabet : words).push({ from: left, to: right });
      parsed++;
      if (parsed > MAX_ENTRIES) throw new Error('Demasiadas entradas. Máximo: 5000.');
    }
    if (!alphabet.length && !words.length) {
      throw new Error('No hay equivalencias reconocibles. Añade una sección [ALFABETO] con A = símbolo o [DICCIONARIO] con hola = palabra.');
    }
    return { name, sourceLanguage, filename, alphabet, words, warnings, entries: parsed };
  }

  function buildWordRegex(pairs, direction) {
    const items = pairs.map(p => direction === 'encode' ? p.from : p.to);
    if (!items.length) return null;
    const sorted = [...new Set(items)].sort((a, b) => b.length - a.length);
    try {
      return new RegExp(`(?<![\\p{L}\\p{N}])(?:${sorted.map(escRe).join('|')})(?![\\p{L}\\p{N}])`, 'giu');
    } catch (_) {
      // Compatibilidad con motores JS que carecen de lookbehind Unicode.
      return new RegExp(`(^|[^\\p{L}\\p{N}])(${sorted.map(escRe).join('|')})(?=$|[^\\p{L}\\p{N}])`, 'giu');
    }
  }

  function lookupWordMap(pairs, direction) {
    const map = new Map();
    for (const p of pairs) {
      const src = direction === 'encode' ? p.from : p.to;
      const dst = direction === 'encode' ? p.to : p.from;
      map.set(src.toLocaleLowerCase(), dst);
    }
    return map;
  }

  function matchCount(text, pairs, direction) {
    const regex = buildWordRegex(pairs, direction);
    if (!regex) return 0;
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }

  function characterCoverage(text, entries, direction) {
    if (!entries.length) return 0;
    const keys = entries.map(p => direction === 'encode' ? p.from : p.to).sort((a, b) => b.length - a.length);
    let total = 0;
    for (let i = 0; i < text.length;) {
      let matched = false;
      for (const key of keys) {
        if (direction === 'encode' && key.length === 1) {
          const char = String.fromCodePoint(text.codePointAt(i));
          if (foldLetter(char) === foldLetter(key)) {
            total += 1; i += char.length; matched = true; break;
          }
        } else if (startsWithAt(text, key, i, direction === 'encode')) {
          total += [...key].length; i += key.length; matched = true; break;
        }
      }
      if (!matched) i += String.fromCodePoint(text.codePointAt(i)).length;
    }
    return total;
  }

  function detectDirection(text, profile) {
    if (!text.trim()) return { direction: 'unknown', confidence: 'ninguna', reason: 'Introduce un texto.' };
    const eWords = matchCount(text, profile.words, 'encode');
    const dWords = matchCount(text, profile.words, 'decode');
    const eAlpha = characterCoverage(text, profile.alphabet, 'encode');
    const dAlpha = characterCoverage(text, profile.alphabet, 'decode');
    let encodeScore = eWords * 10 + eAlpha;
    let decodeScore = dWords * 10 + dAlpha;
    // Los caracteres propios de un alfabeto no latino son evidencia fuerte.
    const targetSpecial = profile.alphabet.filter(p => /[^\p{L}\p{N}\s]/u.test(p.to));
    if (targetSpecial.some(p => text.includes(p.to))) decodeScore += 7;
    if (!encodeScore && !decodeScore) {
      return { direction: 'unknown', confidence: 'ninguna', reason: 'El texto no coincide con el alfabeto ni el diccionario cargados.' };
    }
    if (encodeScore > 0 && decodeScore > 0) {
      const difference = Math.abs(encodeScore - decodeScore);
      if (difference <= 2 || Math.max(encodeScore, decodeScore) / Math.min(encodeScore, decodeScore) < 1.3) {
        return { direction: 'ambiguous', confidence: 'baja', reason: 'El texto contiene elementos de ambas escrituras. Selecciona la dirección manualmente.' };
      }
    }
    const direction = encodeScore > decodeScore ? 'encode' : 'decode';
    return {
      direction,
      confidence: Math.max(encodeScore, decodeScore) >= 5 ? 'alta' : 'media',
      reason: direction === 'encode' ? `Se reconoce texto de ${profile.sourceLanguage}.` : `Se reconoce texto de ${profile.name}.`
    };
  }

  function substituteAlphabet(text, alphabet, direction) {
    if (!alphabet.length || !text) return { value: text, matches: 0 };
    const pairs = alphabet.map(p => direction === 'encode' ?
      { key: p.from, value: p.to } : { key: p.to, value: p.from.toLocaleLowerCase() });
    pairs.sort((a, b) => b.key.length - a.key.length);
    let out = '', matches = 0;
    for (let i = 0; i < text.length;) {
      let found = false;
      for (const p of pairs) {
        const char = String.fromCodePoint(text.codePointAt(i));
        if (direction === 'encode' && [...p.key].length === 1 && foldLetter(char) === foldLetter(p.key)) {
          out += p.value; i += char.length; matches++; found = true; break;
        }
        if (startsWithAt(text, p.key, i, direction === 'encode')) {
          out += p.value; i += p.key.length; matches++; found = true; break;
        }
      }
      if (!found) {
        const char = String.fromCodePoint(text.codePointAt(i));
        out += char; i += char.length;
      }
    }
    return { value: out, matches };
  }

  function preserveWordCase(source, result) {
    if (!/[\p{L}]/u.test(result)) return result;
    if (source.length > 1 && source === source.toLocaleUpperCase() &&
        source !== source.toLocaleLowerCase()) return result.toLocaleUpperCase();
    if (source[0] === source[0].toLocaleUpperCase() &&
        source[0] !== source[0].toLocaleLowerCase()) {
      return result[0].toLocaleUpperCase() + result.slice(1);
    }
    return result;
  }

  function translate(text, profile, requestedDirection = 'auto') {
    if (!profile || !Array.isArray(profile.alphabet) || !Array.isArray(profile.words)) {
      throw new Error('Primero carga un perfil TXT válido.');
    }
    if (typeof text !== 'string') throw new Error('El texto debe ser una cadena.');
    const detection = detectDirection(text, profile);
    let direction = requestedDirection;
    if (direction === 'auto') {
      if (detection.direction === 'unknown' || detection.direction === 'ambiguous') {
        return { output: '', direction: null, detection, matches: 0,
          warning: detection.reason + ' Usa la dirección manual.' };
      }
      direction = detection.direction;
    }
    if (direction !== 'encode' && direction !== 'decode') throw new Error('Dirección desconocida.');
    let result = '';
    let pos = 0;
    let matches = 0;
    const words = lookupWordMap(profile.words, direction);
    const regex = buildWordRegex(profile.words, direction);
    if (regex) {
      let m;
      while ((m = regex.exec(text)) !== null) {
        // En modo fallback, el primer grupo puede contener un separador.
        const token = m[2] && m.index !== undefined && m[0] !== m[2] ? m[2] : m[0];
        const tokenStart = m.index + m[0].indexOf(token);
        if (tokenStart < pos) continue;
        const prior = substituteAlphabet(text.slice(pos, tokenStart), profile.alphabet, direction);
        result += prior.value; matches += prior.matches;
        const replacement = words.get(token.toLocaleLowerCase());
        result += replacement == null ? token : preserveWordCase(token, replacement);
        if (replacement != null) matches++;
        pos = tokenStart + token.length;
      }
    }
    const tail = substituteAlphabet(text.slice(pos), profile.alphabet, direction);
    result += tail.value; matches += tail.matches;
    return { output: result, direction, detection, matches, warning: matches ? '' : 'No se encontraron equivalencias para este texto.' };
  }

  return { parseProfile, detectDirection, translate };
});
