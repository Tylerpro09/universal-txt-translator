# Especificación del formato TXT — versión 2

[Inicio](../README.md) · [Guía de uso](GUIA_USUARIO.md) · [API](API_JAVASCRIPT.md)

## 1. Estructura

Un perfil es un archivo **.txt** con metadatos opcionales y una o varias equivalencias. Se recomienda codificación **UTF-8** y finales de línea LF o CRLF.

```txt
# Comentario
ORIGEN: Nombre del idioma de origen
IDIOMA: Nombre del idioma de destino

[ALFABETO]
a = ★
b = ☆

[DICCIONARIO]
hola = saludo
buenos días = saludo matinal
```

El motor no instala ni precarga ningún idioma.

## 2. Metadatos

| Campo | Obligatorio | Significado |
| --- | --- | --- |
| `ORIGEN:` | No | Etiqueta del idioma fuente |
| `IDIOMA:` | No | Etiqueta del idioma destino |
| `DESTINO:` | No | Alias de `IDIOMA:` |
| `IDIOMA_ORIGEN:` | No | Alias de `ORIGEN:` |
| `IDIOMA_DESTINO:` | No | Alias de `IDIOMA:` |
| `LENGUA_BASE:` | No | Alias de `ORIGEN:` |

Si no defines `IDIOMA`, el nombre se deduce del archivo. Si no defines `ORIGEN`, se muestra «Idioma de origen».

## 3. Secciones

| Encabezados aceptados | Tipo |
| --- | --- |
| `[ALFABETO]`, `LETRAS`, `SIMBOLOS`, `ALFABETO COMPLETO`, `MAPA DE LETRAS` | Alfabeto |
| `[DICCIONARIO]`, `VOCABULARIO`, `PALABRAS`, `TRADUCCIONES`, `FRASES` | Diccionario |
| `[REGLAS]`, `[NOTAS]`, `[EJEMPLOS]`, `[GRAMATICA]`, `[INSTRUCCIONES]` | Texto informativo, ignorado |

Las secciones pueden escribirse con corchetes, o como títulos solos. El modo sigue activo hasta el siguiente encabezado. Fuera de una sección, las entradas de una letra se consideran alfabeto y las demás diccionario.

Para mantener compatibilidad con textos antiguos, se reconocen encabezados y metadatos con mayúsculas/minúsculas indistintas; las tildes de los encabezados se normalizan.

## 4. Sintaxis de una equivalencia

Una línea válida contiene **origen + separador + destino**. Se aceptan:

```txt
a = ★
a | ★
a -> ★
a => ★
a → ★
a ↔ ★
```

También se aceptan nombres entre comillas. Se ignoran líneas vacías y comentarios que empiezan por `#`, `//` o `;`. **El comentario debe ocupar la línea completa**; no se admiten comentarios al final de una equivalencia.

No utilices `|`, `=` o los demás separadores dentro de las claves si se pueden confundir con el formato: el analizador no dispone de mecanismo de escape para separadores incrustados.

## 5. Diferencias entre alfabeto y diccionario

**Alfabeto:** una letra Unicode a la izquierda y un símbolo o secuencia a la derecha. El reemplazo ocurre carácter por carácter en los fragmentos no cubiertos por el diccionario. Ejemplo:

```txt
[ALFABETO]
a = ⟁
ñ = ⧉
```

**Diccionario:** una palabra, varias palabras o una frase breve. Se reemplazan coincidencias completas: una regla para `buenos días` tiene prioridad sobre una para `buenos`, si las dos compiten desde la misma posición.

```txt
[DICCIONARIO]
buenos días = saludo de mañana
buenos = buen
```

**Mixto:** el motor traduce primero expresiones completas del diccionario y aplica las equivalencias del alfabeto a las porciones restantes.

## 6. Reglas de coincidencia

- Las palabras del diccionario se comparan **sin distinguir mayúsculas/minúsculas**.
- Se intenta preservar mayúsculas iniciales y textos completamente en mayúsculas cuando el destino contiene letras.
- Las tildes **no se eliminan automáticamente** en las equivalencias. `a` y `á` pueden necesitar entradas propias.
- Al traducir alfabéticamente, varios símbolos Unicode consecutivos se reconocen siguiendo el mayor largo primero.
- Los límites de palabras consideran letras y números Unicode. Símbolos y signos en los extremos pueden formar parte de entradas especiales, pero conviene probarlos antes de usarlos en producción.
- El texto no reconocido queda en su forma original, para no inventar contenido.
- Para evitar inversiones ambiguas, las claves duplicadas y los destinos repetidos de un mismo tipo se omiten y producen avisos.
- La detección automática de sentido es heurística: ante duda, usa `encode` o `decode` manualmente.

## 7. Límites

| Límite | Valor |
| --- | --- |
| Tamaño de TXT en interfaz | 2 000 000 bytes |
| Longitud del contenido procesado como perfil | 2 000 000 caracteres UTF-16 |
| Equivalencias por perfil | 5000 |
| Longitud de cada lado de una equivalencia | 160 caracteres |
| Perfiles locales guardados | 12 (sujeto a cuota del navegador) |
| Archivo de texto traducido por lotes | 2 000 000 bytes |

El formato no define todavía plurales, conjugaciones, orden gramatical, fonemas, morfología, variables ni expresiones regulares configurables. Los títulos `REGLAS` o `GRAMATICA` se conservan como notas en el TXT, **pero no se ejecutan**.

## 8. Ejemplo mínimo de prueba

```txt
ORIGEN: Sistema A
IDIOMA: Sistema B
[DICCIONARIO]
sol = sun
luna = moon
```

`sol y luna` → `sun y moon`. La palabra `y` queda sin traducir porque no existe una equivalencia para ella.

## 9. Compatibilidad con un TXT antiguo

Archivos que contienen un título con `— ALFABETO`, seguido de líneas `A = símbolo`, suelen ser compatibles. Si no se detectan entradas, añade explícitamente `[ALFABETO]` o `[DICCIONARIO]` e intenta de nuevo.

Consulta la [API](API_JAVASCRIPT.md) para procesar el TXT por código.
