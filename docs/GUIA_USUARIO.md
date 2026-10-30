# Guía del usuario — Motor TXT Universal

[Inicio](../README.md) · [Formato TXT](FORMATO_TXT.md) · [Preguntas frecuentes](PREGUNTAS_FRECUENTES.md)

## 1. Qué hace el motor

Convierte un archivo de equivalencias entre dos idiomas o escrituras en un traductor de texto **bidireccional**. Puede transformar caracteres, palabras o expresiones. No necesita iniciar sesión ni usar APIs externas.

**No reconoce automáticamente el significado de cualquier texto desconocido**: debes proporcionar correspondencias en el TXT.

## 2. Crear el primer idioma

Puedes descargar [la plantilla vacía](../plantilla_idioma.txt), editarla en el Bloc de notas o utilizar el editor integrado.

Contenido mínimo con una palabra:

```txt
ORIGEN: Español
IDIOMA: Ejemplo

[DICCIONARIO]
hola = saludo
```

Contenido mínimo con un alfabeto:

```txt
ORIGEN: Alfabeto de origen
IDIOMA: Alfabeto simbólico

[ALFABETO]
a = ⟁
b = ⧈
```

Estos ejemplos son únicamente de demostración. **No vienen cargados en la aplicación.** Guarda el TXT en UTF-8.

## 3. Cargar en Windows o Android

**Windows:** abre la página y arrastra `idioma.txt` al área de carga, o haz clic en ella y selecciónalo desde tu equipo. Comprueba el nombre del idioma y los contadores de caracteres y expresiones.

**Android:** abre la página, toca el área «Arrastra tu archivo .txt» y elige el TXT desde el selector de archivos. La interfaz se adapta a la pantalla.

Si no dispones de un TXT, abre la sección **Editor TXT integrado**, pega las reglas, pulsa **Validar TXT** y luego **Activar idioma**.

## 4. Traducir

Escribe texto en «Texto original» y pulsa **Traducir**. La aplicación también actualiza el resultado mientras escribes.

La dirección tiene tres opciones:

| Opción | Cuándo usarla |
| --- | --- |
| Detectar automáticamente | Cuando los dos conjuntos de escritura son fáciles de distinguir |
| Origen → Destino | Cuando sabes que tu texto utiliza el idioma de origen |
| Destino → Origen | Para recuperar texto transformado anteriormente |

Si no se puede distinguir el sentido de forma fiable, la aplicación solicita seleccionar una dirección. Usa **Invertir** para cambiar el sentido; el botón puede trasladar el resultado al campo de entrada.

Los signos de puntuación y espacios permanecen sin cambios. Si un fragmento no está definido en el TXT, puede aparecer sin traducir.

## 5. Validar y corregir el TXT

Pulsa **Validar TXT** antes de activarlo. Se muestra:

- Cantidad de equivalencias reconocidas.
- Cantidad de letras y expresiones.
- Avisos de claves duplicadas y destinos ambiguos.
- Mensajes cuando no existe ninguna correspondencia válida.

En un alfabeto, el lado izquierdo de una entrada debe ser **una letra**. Para varias letras o palabras usa `[DICCIONARIO]`.

Puedes editar el idioma activo mediante **Editar perfil actual** y aplicar los cambios pulsando **Activar idioma**. El editor no modifica el archivo físico original: exporta un TXT nuevo si quieres conservar los cambios.

## 6. Biblioteca local de idiomas

La sección **Biblioteca de idiomas** permite:

1. Cargar o activar un idioma.
2. Pulsar **Guardar perfil actual** para conservarlo en *este navegador*.
3. Seleccionar otro perfil guardado y pulsar **Restaurar**.
4. Eliminar una entrada con **Eliminar**.
5. Descargar una copia mediante **Exportar perfil .txt**.

El guardado es **voluntario**. No se guardan automáticamente los mensajes que escribes. Hay un máximo de **12 perfiles guardados**; el almacenamiento del navegador puede imponer una cuota menor o borrarse al limpiar los datos del sitio.

**Recomendación:** exporta el idioma a TXT para tener copia de seguridad. La biblioteca no sincroniza perfiles entre dispositivos.

## 7. Traducir un archivo TXT completo

Con un idioma cargado:

1. Selecciona el sentido de traducción en el traductor principal.
2. En «Traducir archivo completo», elige un TXT que contenga texto (no otro diccionario).
3. Pulsa **Traducir y descargar TXT**.
4. Se descarga `traducido_nombre.txt` con el resultado.

El archivo tiene un límite de 2 MB. Si la dirección automática es incierta o no hay ninguna coincidencia, se informa del problema y no se descarga una copia idéntica fingiendo una traducción.

## 8. Otras funciones

- **Buscar equivalencias:** abre «Ver equivalencias…» e introduce una letra o término para filtrar las filas.
- **Copiar resultado:** lleva la traducción al portapapeles.
- **Guardar traducción .txt:** descarga el campo de salida.
- **Usar entrada del TXT:** coloca algunas correspondencias del archivo como texto de prueba.
- **Ctrl+Enter:** ejecuta la traducción desde el cuadro de texto en un teclado físico.

## 9. Modo sin Internet

La aplicación base está embebida en `index.html` y funciona al abrir ese archivo localmente. Para conservar también las herramientas avanzadas, descarga el repositorio completo, no solo el HTML.

En GitHub Pages, tras visitar correctamente la web, el service worker puede almacenar los archivos estáticos para futuras visitas sin conexión. El caché depende de la configuración del navegador: no equivale a almacenamiento permanente garantizado.

## 10. Importante sobre privacidad

Un alfabeto de símbolos **no proporciona cifrado criptográfico**. Cualquier persona que obtenga las equivalencias puede invertirlo. El motor es un traductor por reglas, no una herramienta para enviar mensajes secretos de forma segura.

Siguiente lectura: [Formato TXT](FORMATO_TXT.md) y [Preguntas frecuentes](PREGUNTAS_FRECUENTES.md).
