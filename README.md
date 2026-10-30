# Motor TXT Universal

Sitio estático para **construir traductores bidireccionales** mediante archivos `.txt` con equivalencias. No incluye idiomas preinstalados ni ejemplos cargados automáticamente.

## Probar

Abre [el traductor en GitHub Pages](https://tylerpro09.github.io/universal-txt-translator/) o descarga `index.html` y ábrelo directamente en un navegador moderno. Funciona sin servidor, sin cuentas y sin enviar el archivo a Internet.

1. Crea un TXT en UTF-8 usando como base `plantilla_idioma.txt`.
2. Indica `ORIGEN:` y `IDIOMA:` si quieres mostrar los nombres.
3. Añade equivalencias en secciones `[ALFABETO]` y/o `[DICCIONARIO]`.
4. Carga el TXT en la aplicación y selecciona la dirección de traducción.

Ejemplo ilustrativo (no viene cargado en la web):

```txt
ORIGEN: Español
IDIOMA: Otro idioma

[DICCIONARIO]
hola = hi
adiós = bye
```

## Archivos

- `index.html`: aplicación completa, utilizable también sin conexión.
- `motor_idiomas.js`: API del motor reutilizable en JavaScript y Node.js.
- `plantilla_idioma.txt`: plantilla sin equivalencias reales.
- `test_motor.js`: pruebas locales del motor.
- `.nojekyll`: evita el procesamiento Jekyll de GitHub Pages.

## Desarrollo

```bash
node test_motor.js
```

Los diccionarios se procesan con JavaScript en el navegador, sin base de datos ni servidor. La detección automática depende de las equivalencias conocidas; no descifra idiomas desconocidos ni hace traducción neuronal o gramatical.

## Integración futura con Minecraft

El formato de diccionario puede compartirse con un mod o herramienta de Minecraft. La web **no contiene todavía un mod de Minecraft**: para compilar uno deben elegirse versión del juego y plataforma (Fabric, NeoForge o Forge).