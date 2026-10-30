# Arquitectura y desarrollo

[Inicio](../README.md) · [API](API_JAVASCRIPT.md) · [Formato TXT](FORMATO_TXT.md)

## Propósito

Motor TXT Universal implementa una traducción **determinista** a partir de reglas proporcionadas por el usuario. No dispone de redes neuronales, modelos lingüísticos, servicio de traducción ni un corpus de idiomas preinstalado.

## Capas

```text
                    ┌──────────────────────────────┐
                    │ Archivo .txt / Editor local  │
                    └──────────────┬───────────────┘
                                   │
                         parseProfile(raw)
                                   │
                    ┌──────────────▼───────────────┐
                    │ Perfil validado               │
                    │ - origen, destino             │
                    │ - alfabeto [{from,to}]        │
                    │ - diccionario [{from,to}]     │
                    │ - warnings                    │
                    └──────────────┬───────────────┘
                                   │
                         detectDirection()
                                   │
                         translate(text, p)
                                   │
                   ┌───────────────▼────────────────┐
                   │ 1) frases/palabras completas   │
                   │ 2) sustitución alfabética      │
                   │ 3) partes sin regla: preservar │
                   └───────────────┬────────────────┘
                                   │
                    salida / copia / descarga local
```

## Módulos

**`motor_idiomas.js`**: analizador y funciones `parseProfile`, `detectDirection`, `translate`. API CommonJS/UMD. No necesita DOM.

**`index.html`**: web responsiva; contiene un núcleo embebido para permitir traducir desde un HTML aislado.

**`enhancements.js`**: editor de perfiles, validación, biblioteca local voluntaria, exportación de perfiles, traducción de TXT completos, búsqueda en tabla y registro del service worker.

**`sw.js`**: caché de recursos estáticos del sitio; no almacena TXT ni mensajes del usuario.

**`manifest.webmanifest` / `icon.svg`**: metadatos y recursos visuales para experiencia web.

**`test_motor.js`** y **`package.json`**: suite de regresión sin bibliotecas externas.

## Orden de sustitución

1. Se buscan frases y palabras mediante coincidencias de palabra completa (priorizando expresiones largas).
2. Los fragmentos restantes pasan por el sustituidor alfabético.
3. Para descifrar, las equivalencias se invierten. Los símbolos de varias unidades se comprueban antes que los más cortos.
4. Los segmentos desconocidos se copian sin inventar contenidos.

La salida no se normaliza gramaticalmente ni se intenta reconstruir el contexto de las palabras.

## Detección de idioma

El motor puntúa coincidencias del diccionario y cobertura del alfabeto en los dos sentidos. Los símbolos que no son letras o números aportan evidencia extra para descifrado. Si las puntuaciones son similares, se indica **ambiguous**; si no hay señales, **unknown**.

La confianza se expresa como `alta`, `media`, `baja` o `ninguna`, de modo cualitativo; **no es una probabilidad calibrada**.

## Persistencia y privacidad

Los archivos se leen con `File.arrayBuffer()`, `TextDecoder` y JavaScript local. No existe código de envío de TXT o mensajes a servidores. Los perfiles solo se guardan si la persona lo pide con **Guardar perfil actual**; se utilizan claves en `localStorage`.

El almacenamiento del navegador no es cifrado, no sincroniza y puede borrarse. Para compartir un idioma, exporta el perfil TXT.

## Publicación

La web está servida por GitHub Pages desde `main:/`. GitHub Pages sirve archivos estáticos: **no hay backend**.

El caché del service worker puede permitir uso sin conexión tras una primera visita; el navegador puede purgarlo. El HTML principal funciona también como archivo local, pero para las herramientas adicionales se requiere tener `enhancements.js` junto al HTML.

## Pruebas y calidad

```bash
npm test
node --check motor_idiomas.js
node --check enhancements.js
```

La web está diseñada para navegadores modernos con soporte de `Unicode property escapes`, `TextDecoder`, `File API` y `localStorage`. Algunas opciones podrían no funcionar en navegadores antiguos.

La acción de GitHub se encuentra en `.github/workflows/test.yml`. Si GitHub no permite iniciar runners por restricciones de cuenta/facturación, la comprobación debe realizarse localmente y no se debe anunciar un CI verde sin evidencia.

## Prioridades para el futuro

- Pruebas de interfaz en navegadores y Android.
- Soporte de frases parametrizadas y gramáticas explícitas (requiere nueva especificación, no está implementado).
- Compatibilidad de importación/exportación de perfiles versionados.
- Integración Java con Minecraft según versión, cargador y permisos elegidos.
- Medición de rendimiento con archivos grandes y casos Unicode complejos.

## Contribuir

Antes de cambiar el formato TXT, documenta las compatibilidades y añade pruebas de regresión. Mantén el proyecto libre de telemetría y evita guardar sin consentimiento los textos del usuario.
