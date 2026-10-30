# API JavaScript de Motor TXT Universal

[Inicio](../README.md) · [Formato TXT](FORMATO_TXT.md) · [Arquitectura](ARQUITECTURA.md)

La API principal reside en `motor_idiomas.js`. Es **JavaScript sin dependencias** y expone el objeto `MotorIdiomasTXT` en un navegador clásico, o las funciones mediante CommonJS en Node.js.

## 1. Importar

### Node.js

```js
const motor = require('./motor_idiomas.js');
```

### Navegador

```html
<script src="./motor_idiomas.js"></script>
<script>
  const motor = window.MotorIdiomasTXT;
</script>
```

La página `index.html` contiene una copia embebida del núcleo para que la traducción básica siga funcionando incluso si se abre el HTML aislado.

## 2. `parseProfile(raw, filename?)`

Analiza una definición TXT y devuelve un perfil normalizado. **No consulta Internet.**

```js
const txt = `ORIGEN: Español
IDIOMA: Ejemplo
[DICCIONARIO]
hola = saludo
`;
const p = motor.parseProfile(txt, 'perfil.txt');
console.log(p.name);         // Ejemplo
console.log(p.sourceLanguage); // Español
console.log(p.entries);      // 1
```

### Perfil retornado

```ts
type Pair = { from: string; to: string };
type Profile = {
  name: string;
  sourceLanguage: string;
  filename: string;
  alphabet: Pair[];
  words: Pair[];
  warnings: string[];
  entries: number;
};
```

Errores: el método lanza `Error` si el texto está vacío, excede límites o no contiene ninguna correspondencia válida. Las equivalencias duplicadas o ambiguas pueden producir avisos no fatales en `warnings`.

## 3. `translate(text, profile, requestedDirection?)`

Transforma texto con un perfil. Direcciones permitidas:

- `'encode'`: origen → destino.
- `'decode'`: destino → origen.
- `'auto'`: escoger con detección heurística.

```js
const profile = motor.parseProfile(`ORIGEN: A
IDIOMA: B
[DICCIONARIO]
hola = hello
`);
console.log(motor.translate('hola', profile, 'encode').output); // hello
console.log(motor.translate('hello', profile, 'decode').output); // hola
```

### Resultado

```ts
type TranslationResult = {
  output: string;
  direction: 'encode' | 'decode' | null;
  detection: {
    direction: 'encode' | 'decode' | 'unknown' | 'ambiguous';
    confidence: 'alta' | 'media' | 'baja' | 'ninguna';
    reason: string;
  };
  matches: number;
  warning: string;
};
```

Si pides `auto` y no hay evidencia suficiente o hay ambigüedad, devuelve `direction: null`, `output: ''` y un aviso. **No debe interpretarse como traducción exitosa**.

`matches` es el número de sustituciones encontradas, no una puntuación de calidad ni una certeza sobre el idioma.

## 4. `detectDirection(text, profile)`

Evalúa coincidencias en ambos sentidos para sugerir la dirección.

```js
const detection = motor.detectDirection('hello', profile);
console.log(detection.direction); // decode (en el ejemplo anterior)
console.log(detection.reason);
```

Los símbolos únicos del destino aportan evidencia adicional. La detección no es un clasificador lingüístico entrenado.

## 5. Manejo de errores recomendado

```js
try {
  const profile = motor.parseProfile(fileContent, 'archivo.txt');
  if (profile.warnings.length) console.warn(profile.warnings.join('\n'));
  const result = motor.translate('un texto', profile, 'encode');
  if (result.warning) console.warn(result.warning);
  else console.log(result.output);
} catch (error) {
  console.error('TXT inválido:', error.message);
}
```

## 6. Procesar un archivo en Node.js

```js
const fs = require('node:fs');
const motor = require('./motor_idiomas.js');
const txt = fs.readFileSync('./mi_idioma.txt', 'utf8');
const profile = motor.parseProfile(txt, 'mi_idioma.txt');
const result = motor.translate('frase de prueba', profile, 'encode');
fs.writeFileSync('resultado.txt', result.output, 'utf8');
```

## 7. Restricciones y seguridad

La API no evalúa JavaScript desde el TXT: solo extrae equivalencias. El motor debe considerarse un **transformador de reglas**, no una solución de traducción general. Limita el tamaño de las entradas que provengan de terceros y no ejecutes código arbitrario incluido en archivos adjuntos.

Pruebas:

```bash
npm test
```

Este proyecto no expone actualmente un endpoint HTTP, API REST ni SDK Java; para Minecraft hay que implementar un adaptador propio. Consulta [Integración con Minecraft](INTEGRACION_MINECRAFT.md).
