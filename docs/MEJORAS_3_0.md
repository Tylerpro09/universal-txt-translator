# Motor TXT Universal 3.0 — Mejoras del traductor

[Inicio](../README.md) · [Guía](GUIA_USUARIO.md) · [API](API_JAVASCRIPT.md) · [Sin Wi-Fi](SIN_CONEXION.md)

## Qué cambió

La versión 3.0 conserva la estructura de los TXT: no hay idiomas precargados y un texto sin equivalencias no puede traducirse automáticamente. El motor se ejecuta en el dispositivo, sin API externa.

### 1. Coincidencias de palabras y frases

El sistema reconoce las frases completas antes que las palabras sueltas. Por ejemplo:

```txt
ORIGEN: Español
IDIOMA: Demostración
[DICCIONARIO]
gato = cat
gato negro = black cat
hola = hello
```

Entrada: `Hola, gato negro.`  
Salida: `Hello, black cat.`

Se conservan las palabras no incluidas en el diccionario y la puntuación. **No interpreta la gramática ni produce traducciones de palabras desconocidas por IA.**

### 2. Manejo de Unicode

- Normaliza formas equivalentes de caracteres con NFC, por ejemplo `café` y `cafe\u0301`.
- Reconoce símbolos y secuencias Unicode, incluidos emojis multicaracter.
- Conserva mayúsculas de las palabras cuando es posible.
- Evita reemplazar fragmentos dentro de otras palabras del diccionario (límites de palabra).

**Limitación:** en alfabetos convertidos a símbolos, no siempre es posible reconstruir mayúsculas originales al descifrar.

### 3. Cobertura y diagnóstico

Debajo del traductor aparece **«Calidad y mejora del idioma»**. Muestra:
- Cobertura aproximada de los caracteres no vacíos con equivalencia.
- Número de coincidencias aplicadas.
- Palabras que contienen partes sin traducir.
- Botón para exportar un diagnóstico como TXT.

La cobertura **no representa una puntuación de exactitud**. Una traducción puede tener alta cobertura y ser semánticamente incorrecta si el diccionario es incorrecto.

### 4. Añadir palabras desde el resultado

1. Carga o crea un idioma TXT.
2. Escribe un texto de prueba en el traductor.
3. Selecciona una palabra pendiente en el panel.
4. Escribe su equivalencia y pulsa **Añadir equivalencia al idioma**.
5. Comprueba la traducción actualizada.
6. Pulsa **Guardar perfil actual** o **Exportar perfil .txt** si deseas conservar el cambio.

Las equivalencias deben ser explícitas. Los duplicados o ambigüedades en la traducción inversa se detectan durante la validación del perfil.

### 5. Rendimiento

Se utilizan índices de reglas por carácter inicial en lugar de comprobar todas las reglas en cada posición del texto. Se limita la muestra de texto usada para estimar la dirección automática, evitando realizar el análisis de ambos sentidos sobre documentos enormes.

El límite actual sigue siendo **5000 equivalencias** y **2 MB** para los archivos TXT cargados en la web.

### 6. Continúa funcionando sin Wi-Fi

Los recursos `quality.js`, `offline.js` y el traductor están incluidos en los archivos guardados por el modo offline. Debes pulsar **Guardar para usar sin Wi-Fi** mientras estés conectado y comprobar que se hayan guardado los 12 recursos necesarios.

La aplicación puede funcionar localmente en un navegador moderno. El botón de descarga de informe crea el TXT en tu dispositivo; no envía el contenido a un servidor.

## API 3.0

```js
const motor = require('./motor_idiomas.js');
const perfil = motor.parseProfile(`ORIGEN: Español
IDIOMA: Demostración
[DICCIONARIO]
hola = hello
`);
const resultado = motor.translate('hola mundo', perfil, 'encode');
console.log(resultado.output);                    // hello mundo
console.log(resultado.stats.coverage);             // cobertura aproximada
console.log(resultado.stats.untranslatedWords);    // ['mundo']
console.log(motor.explain('hola mundo',perfil,'encode')); // estadísticas
```

El objeto `resultado.stats` incluye `coverage`, `matchedCharacters`, `totalCharacters` y `untranslatedWords`.

## Comprobaciones

```bash
npm run check
```

El comando comprueba la sintaxis de los scripts del proyecto y ejecuta las pruebas del motor, CLI y los escenarios avanzados (Unicode, frases, cobertura, detección y textos extensos).

## Precauciones

- No es un sistema de cifrado: un idioma basado en sustitución puede analizarse e invertirse.
- No crea automáticamente significados que no aparezcan en el TXT.
- El sentido automático puede ser ambiguo. Elige origen → destino o destino → origen si la detección falla.
- La cobertura es una métrica de coincidencia, no de calidad semántica.
- No hay sincronización entre equipos: exporta los perfiles que quieras conservar.
