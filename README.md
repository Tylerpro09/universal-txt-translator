# Motor TXT Universal

**Versión 3.0 · Constructor de traductores bidireccionales basados en alfabetos, palabras y frases definidas en archivos TXT.** Sin idioma inventado precargado, sin API externa, sin registros y sin servidor de traducción.

**Abrir:** https://tylerpro09.github.io/universal-txt-translator/

> **Alcance real:** el archivo debe contener equivalencias entre dos escrituras o idiomas. El motor *no* descubre por sí solo el significado de un texto desconocido, no realiza traducción neuronal ni aplica gramáticas que no estén definidas en las equivalencias.

## Funcionalidades

| Función | Estado | Descripción |
| --- | --- | --- |
| Cargar un idioma desde TXT | Disponible | Mediante selector o arrastrar y soltar |
| Traducir en ambos sentidos | Disponible | Origen ⇄ destino, conservando signos y espacios |
| Detectar dirección | Disponible | Heurística basada en coincidencias; permite elegir manualmente |
| Alfabetos de símbolos Unicode | Disponible | Sustitución de caracteres, incluidos símbolos de varios caracteres |
| Diccionario de palabras y frases | Disponible | Coincidencias de palabra y frases completas; se priorizan las largas |
| Diccionarios mixtos | Disponible | Primero frases/palabras, luego caracteres restantes |
| Informe de cobertura | Disponible | Porcentaje aproximado de texto reconocido y lista de palabras pendientes |
| Completar diccionario | Disponible | Añadir equivalencias desde la web con un formulario rápido |
| Soporte Unicode NFC | Disponible | Reconoce formas compuestas de caracteres y secuencias de símbolos |
| Motor optimizado | Disponible | Diccionarios indexados y evaluación sin expresión regular gigante |
| Editor TXT integrado | Disponible | Pegar, validar, activar y corregir definiciones |
| Biblioteca de perfiles | Disponible | Guardado **opcional** en el almacenamiento local del navegador |
| Exportar el idioma | Disponible | Reconstruir un TXT del perfil cargado |
| Traducir archivos TXT completos | Disponible | Procesamiento local y descarga del resultado |
| Buscar equivalencias | Disponible | Filtra la tabla del idioma activo |
| Web adaptable | Disponible | Escritorio y teléfono |
| Uso sin conexión | Disponible | La aplicación base funciona abriendo el HTML; la web publicada guarda sus recursos después de una primera visita correcta |
| CLI Node.js | Disponible | Traduce textos y archivos desde la terminal, sin dependencias |
| API JavaScript | Disponible | `parseProfile`, `detectDirection`, `translate` |
| Pruebas con Node.js | Disponible | `npm test` |
| Mod de Minecraft | **No implementado** | Se documenta la integración prevista; falta escoger versión y cargador |

## Inicio rápido

1. Abre el [sitio web](https://tylerpro09.github.io/universal-txt-translator/).
2. Descarga `plantilla_idioma.txt` o abre el **editor TXT integrado**.
3. Escribe la equivalencia entre el idioma de origen y el destino.
4. Carga el archivo o selecciona **Activar idioma**.
5. Escribe el mensaje y pulsa **Traducir**; elige dirección manual si la automática resulta ambigua.

Ejemplo ilustrativo que **no se carga automáticamente**:

```txt
ORIGEN: Español
IDIOMA: Idioma de ejemplo

[ALFABETO]
a = ⟁
b = ⧈

[DICCIONARIO]
hola = saludo
buenos días = saludo matinal
```

Los idiomas y traducciones del ejemplo son demostrativos: añade tus propias reglas en un TXT para utilizarlos.

## Documentación completa

- [Uso sin Wi-Fi (Android y Windows)](docs/SIN_CONEXION.md): instalar, preparar recursos offline y utilizar la versión portátil.
- [Novedades de la versión 3.0](docs/MEJORAS_3_0.md): métricas, mejoras del motor y ejemplos.
- [Guía del usuario](docs/GUIA_USUARIO.md): cargar, editar, traducir, guardar perfiles y traducir archivos.
- [Especificación del formato TXT](docs/FORMATO_TXT.md): gramática del archivo, límites, validación, conflictos y codificación.
- [CLI para terminal](docs/CLI.md): traducir texto y archivos desde Node.js.
- [API JavaScript](docs/API_JAVASCRIPT.md): integración con navegador y Node.js, resultados y errores.
- [Arquitectura y desarrollo](docs/ARQUITECTURA.md): flujo interno, estructura del código, privacidad y pruebas.
- [Preguntas frecuentes y soluciones](docs/PREGUNTAS_FRECUENTES.md): errores comunes, compatibilidad y traducción automática.
- [Privacidad y seguridad](docs/PRIVACIDAD.md): procesamiento, almacenamiento y límites de protección.
- [Integración futura con Minecraft](docs/INTEGRACION_MINECRAFT.md): contrato de datos y propuesta técnica, **no es un mod compilado**.
- [Registro de cambios](CHANGELOG.md).

## Estructura del proyecto

```text
/
├── index.html                  # Interfaz principal y núcleo embebido de respaldo
├── motor_idiomas.js            # Motor reutilizable (CommonJS + navegador)
├── enhancements.js             # Editor, biblioteca local y traducción de TXT
├── quality.js                  # Cobertura y mejoras rápidas del idioma
├── plantilla_idioma.txt        # Formato vacío; sin idioma precargado
├── cli.js                      # Terminal: traducir textos y archivos
├── test_motor.js               # Pruebas automáticas Node.js
├── test_advanced.js            # Unicode, rendimiento y análisis
├── package.json                # npm test
node cli.js --help
├── manifest.webmanifest        # Metadatos de la aplicación web
├── sw.js                       # Caché offline de recursos estáticos
├── icon.svg                    # Icono de la aplicación
├── .nojekyll                   # Publicación estática en GitHub Pages
├── .github/workflows/test.yml  # CI para ejecutar npm test
├── CHANGELOG.md
└── docs/                       # Manuales técnicos y para usuarios
```

## Preparar uso sin Wi-Fi

Con Internet, abre [el traductor](https://tylerpro09.github.io/universal-txt-translator/) y pulsa **Guardar para usar sin Wi-Fi**. Espera al mensaje **Preparación completada**. Tus recursos web quedarán almacenados en este navegador y podrás volver a abrir el traductor sin Wi-Fi ni datos móviles, mientras el navegador conserve su caché. Debes guardar tus archivos TXT o perfiles de idioma por separado.

Como alternativa, [descarga el repositorio en ZIP](https://github.com/Tylerpro09/universal-txt-translator/archive/refs/heads/main.zip), descomprímelo y abre `index.html` directamente desde el disco.

Consulta la [guía offline](docs/SIN_CONEXION.md) para instrucciones en Android y Windows.

## Mejoras de precisión (3.0.1)

Las frases del diccionario aceptan espacios múltiples y saltos de línea, sin crear variantes individuales. Si los símbolos del alfabeto comparten prefijos, el traductor advierte de que la inversión puede perder información. Se añadieron pruebas de Unicode, cobertura, límites y rendimiento.
## Desarrollo y pruebas

Requiere **Node.js 22 o superior** para ejecutar la suite incluida (el motor también puede funcionar en navegadores modernos sin Node).

```bash
git clone https://github.com/Tylerpro09/universal-txt-translator.git
cd universal-txt-translator
npm test
```

Para probar la web, abre `index.html` con un navegador moderno. Al abrir exclusivamente `index.html` desde una carpeta sin los demás archivos, el traductor base funciona, pero las mejoras de `enhancements.js` no estarán disponibles.

### Despliegue

GitHub Pages publica la carpeta raíz `/` de la rama `main`. La web no necesita pasos de compilación. Los cambios pueden tardar en aparecer mientras GitHub Pages actualiza el sitio.

La suite añade casos con Unicode, límites de palabras y entradas largas. La cobertura es una estimación de caracteres cubiertos por reglas, **no** una certificación de calidad de traducción ni una evaluación semántica.

**Nota de CI:** GitHub Actions puede quedar bloqueado por restricciones de facturación de la cuenta. En ese caso, la falta de ejecución de la acción no significa que las pruebas hayan fallado; ejecútalas localmente con `npm test`.

## Limitaciones conocidas

- No existe inferencia lingüística a partir de un TXT sin pares de traducción.
- Es una tabla de correspondencias, **no** un sistema de cifrado seguro ni una IA traductora.
- La traducción automática del sentido puede ser ambigua: usa la selección manual.
- Un diccionario incompleto deja parte del texto original sin traducir.
- Máximo 2 MB por TXT, 5000 equivalencias y 160 caracteres por lado de equivalencia.
- La aplicación no incluye todavía el mod de Minecraft.

## Privacidad

El TXT y el texto a traducir se procesan en el dispositivo. No se utiliza ninguna API remota de traducción. La biblioteca opcional guarda **solo definiciones de idioma** en `localStorage`; no guarda automáticamente textos introducidos o traducciones. Consulta [Privacidad y seguridad](docs/PRIVACIDAD.md).

---
Proyecto de código disponible públicamente en GitHub. La visibilidad pública de un repositorio no otorga por sí sola una licencia de reutilización; el titular puede establecer una licencia más adelante.
