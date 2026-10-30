#!/usr/bin/env node
/* CLI para el motor TXT. Sin dependencias ni llamadas de red. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const engine = require('./motor_idiomas.js');

const HELP = `Motor TXT Universal — CLI

Uso:
  node cli.js --profile <idioma.txt> --text "mensaje" [--direction encode|decode|auto]
  node cli.js --profile <idioma.txt> --input <texto.txt> [--output <salida.txt>] [--direction ...]
  node cli.js --help

Opciones:
  -p, --profile     TXT con las equivalencias (obligatorio)
  -t, --text        Texto a traducir; alternativamente --input
  -i, --input       Archivo TXT a traducir; alternativamente --text
  -o, --output      Archivo para la traducción. Si no se indica, escribe a stdout
  -d, --direction   encode, decode o auto (por defecto auto)
  -h, --help        Mostrar ayuda

Nota: auto puede ser ambiguo. Usa -d encode o -d decode para forzar el sentido.
`;

function parseArgs(argv) {
  const names = new Map([
    ['-p','profile'],['--profile','profile'],
    ['-t','text'],['--text','text'],
    ['-i','input'],['--input','input'],
    ['-o','output'],['--output','output'],
    ['-d','direction'],['--direction','direction']
  ]);
  const options = {direction:'auto'};
  for (let i=0; i<argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') { options.help = true; return options; }
    const key = names.get(arg);
    if (!key) throw new Error('Opción desconocida: ' + arg);
    if (!argv[i+1]) throw new Error('Falta un valor para: ' + arg);
    if (Object.hasOwn(options,key)) throw new Error('Opción repetida: ' + arg);
    options[key] = argv[++i];
  }
  if (!options.profile) throw new Error('Falta --profile <archivo.txt>.');
  if (options.text !== undefined && options.input) throw new Error('Utiliza --text o --input, no ambos.');
  if (options.text === undefined && !options.input) throw new Error('Especifica --text o --input.');
  if (!['encode','decode','auto'].includes(options.direction)) throw new Error('Dirección inválida: ' + options.direction);
  return options;
}
function readTXT(filename) {
  const data = fs.readFileSync(filename);
  if (data.byteLength > 2_000_000) throw new Error('TXT demasiado grande (máximo 2 MB): ' + filename);
  const text = new TextDecoder('utf-8',{fatal:true}).decode(data);
  return text.replace(/^\uFEFF/u, '');
}
function run(argv, io = {stdout:process.stdout, stderr:process.stderr}) {
  let args;
  try {
    args = parseArgs(argv);
    if (args.help) { io.stdout.write(HELP); return 0; }
    const raw = readTXT(args.profile);
    const profile = engine.parseProfile(raw, path.basename(args.profile));
    if (profile.warnings.length) io.stderr.write('Avisos del perfil:\n' + profile.warnings.join('\n') + '\n');
    const source = args.input ? readTXT(args.input) : args.text;
    const result = engine.translate(source, profile, args.direction);
    if (result.direction === null) throw new Error(result.warning);
    if (result.warning) io.stderr.write('Aviso: ' + result.warning + '\n');
    if (args.output) {
      fs.writeFileSync(args.output, result.output, 'utf8');
      io.stderr.write('Traducción guardada en: ' + args.output + '\n');
    } else {
      io.stdout.write(result.output + (result.output.endsWith('\n') ? '' : '\n'));
    }
    return 0;
  } catch(error) {
    io.stderr.write('Error: ' + error.message + '\nUsa --help para ver las opciones.\n');
    return 1;
  }
}
if (require.main === module) process.exitCode = run(process.argv.slice(2));
module.exports = {parseArgs, readTXT, run};
