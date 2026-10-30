# Mejoras del traductor — Versión 3.0

[Volver al inicio](../README.md) · [Traductor web](https://tylerpro09.github.io/universal-txt-translator/) · [Guía de usuario](GUIA_USUARIO.md)

## ¿Qué ha cambiado?

La versión 3.0 mejora el **motor de correspondencias TXT** y añade una herramienta de **diagnóstico interactivo** para detectar qué necesita cada idioma personalizado. Continúa sin ningún idioma predeterminado y sin enviar textos a servidores externos.

## 1. Traducción más precisa

### Frases antes que letras

Si defines:

```txt
ORIGEN: Español
IDIOMA: Ejemplo

[DICCIONARIO]
gato = cat
gato negro = black cat
```

Al traducir `gato negro`, el motor utiliza la expresión larga `black cat` en vez de producir dos conversiones parciales.

### Evita alterar el interior de otras palabras

Una regla `el = the` no cambia las letras finales de `hotel`; se aplica a la palabra completa `el`.

### Unicode NFC

Se reconocen letras con acentos compuestos o combinados, y se permiten secuencias de símbolos Unicode como destinos de las letras del alfabeto.

### Mayúsculas

El motor intenta conservar mayúsculas en conversiones de palabras y letras. Esto no equivale a transliteración fonética ni a reconstrucción gramatical.

## 2. Panel de cobertura

Después de cargar un idioma, escribe un texto y selecciona la dirección de traducción.

El panel muestra:

- **Porcentaje de cobertura**: fracción de los caracteres no blancos incluidos en reglas aplicadas.
- **Coincidencias**: cantidad de reemplazos realizados.
- **Palabras pendientes**: hasta 20 palabras que tienen segmentos sin equivalencia.
- **Diagnóstico TXT**: descarga un informe con la entrada, la salida y las métricas.

Si aparece `92 %`, significa que un 92 % aproximadamente de los caracteres no blancos fueron cubiertos por una regla. **No significa** una calidad de traducción del 92 %.

## 3. Completar un idioma sin editar archivos manualmente

1. Escribe una frase usando tu idioma activo.
2. Revisa las palabras en el panel de calidad.
3. Toca una palabra para rellenar el campo **Texto original**.
4. Introduce su traducción.
5. Pulsa **Añadir equivalencia al idioma**.
6. Comprueba que cambia el resultado y la cobertura.
7. Pulsa **Exportar perfil .txt** o **Guardar perfil actual** para conservar el vocabulario añadido.

El botón no utiliza ningún servicio de IA: requiere que definas cada equivalencia.

## 4. ¿Mejora también el uso sin Wi-Fi?

Sí. La nueva interfaz se incluye dentro del caché de la aplicación. Con Internet, pulsa **Guardar para usar sin Wi-Fi** y comprueba la confirmación de **12 recursos guardados**.

Después puedes apagar Wi-Fi y datos móviles y seguir creando idiomas, traduciendo y consultando el diagnóstico. Consulta [Modo offline](SIN_CONEXION.md) para instalar la PWA o descargar la carpeta portátil.

## 5. Pruebas y compatibilidad

La versión 3.0 incorpora pruebas automatizadas para:

- Frases solapadas y prioridad de expresiones.
- Límites de palabra.
- Mayúsculas y puntuación.
- Tildes combinadas y símbolos Unicode compuestos.
- Detección ambigua de la dirección.
- Textos parcialmente traducidos.
- Entrada de 100 000 caracteres.
- Uso desde Node.js.

Ejecuta:

```bash
npm run check
```

En el navegador también se verificaron el panel de cobertura, la adición de reglas, la visualización móvil y la traducción sin conexión simulando modo avión.

## 6. Limitaciones importantes

- Necesitas equivalencias entre origen y destino: no puede descifrar automáticamente un idioma desconocido sin referencias.
- No aplica orden gramatical, conjugaciones o significado por contexto salvo que el TXT defina expresiones concretas.
- Un diccionario incompleto puede dejar palabras originales sin traducir.
- El porcentaje de cobertura mide coincidencias, no corrección lingüística.
- Un idioma de símbolos no constituye cifrado seguro.
- No hay mod Minecraft compilado en el repositorio.

Para desarrolladores: [Referencia de API](API_JAVASCRIPT.md) y [Arquitectura](ARQUITECTURA.md).
