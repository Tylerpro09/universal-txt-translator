# Preguntas frecuentes y solución de problemas

[Inicio](../README.md) · [Guía del usuario](GUIA_USUARIO.md)

### ¿Por qué no reconoce mi archivo?

El TXT debe contener líneas de equivalencia: `origen = destino`, normalmente bajo `[ALFABETO]` o `[DICCIONARIO]`. Un texto narrativo sin correspondencias no permite construir un traductor.

### ¿Puede aprender el significado de un idioma desconocido solo con un libro?

No. Este motor no es un modelo de IA ni un descifrador estadístico. Necesita correspondencias explícitas. Una versión capaz de aprender de corpus comparables sería un proyecto distinto.

### ¿Por qué «Detección automática» dice que es ambiguo?

Porque la escritura de origen y destino comparten letras o palabras y las puntuaciones de coincidencia son similares. Escoge **Origen → Destino** o **Destino → Origen** manualmente.

### ¿Por qué parte del texto no cambia?

Solo se sustituyen expresiones/ letras incluidas en las reglas. Lo desconocido permanece intacto para evitar inventar equivalencias.

### ¿Por qué «á» y «a» no siempre producen lo mismo?

El motor **no elimina las tildes automáticamente** de los caracteres del alfabeto. Define reglas separadas cuando corresponda.

### ¿Puedo cargar emojis y símbolos?

Sí, el destino de una regla de alfabeto puede ser un símbolo o una secuencia Unicode. Comprueba que los símbolos sean únicos para permitir traducción inversa. Se recomienda probar también caracteres combinados y emojis compuestos.

### ¿Acepta documentos Word, PDF o imágenes?

No. Admite **TXT**. Convierte otros formatos a texto UTF-8 antes de cargarlos. Tampoco extrae significados desde imágenes o capturas.

### ¿Por qué aparece «entrada duplicada»?

Hay dos reglas con la misma clave en la misma categoría. El motor conserva una y omite la duplicada. Revisa el TXT y deja una sola equivalencia para cada clave.

### ¿Por qué aparece «traducción inversa ambigua»?

Dos claves distintas se traducen al mismo destino en la misma categoría. Al intentar descifrar no habría manera inequívoca de saber cuál era el original. El motor omite la segunda equivalencia.

### ¿Cómo uso mis propios idiomas?

No existe un idioma preinstalado. Crea el TXT, valida el contenido en el editor y activa el perfil. Si quieres volver a usarlo, pulsa **Guardar perfil actual** o **Exportar perfil .txt**.

### ¿Por qué desaparecieron mis perfiles guardados?

`localStorage` pertenece a cada navegador y origen web. Se pierde si borras datos, cambias de navegador, usas modo privado o la cuota se purga. Exporta siempre los TXT importantes.

### ¿La traducción funciona sin Wi-Fi?

Sí, si conservas los archivos locales necesarios, o si el navegador tiene correctamente cacheada la web después de la primera visita. No se necesita conexión a una API.

### ¿Qué pasa si cargo el TXT en mi teléfono?

El procesamiento se realiza en el navegador del móvil. La página y sus recursos se sirven desde GitHub Pages, pero el contenido del TXT no se envía a GitHub por la aplicación.

### ¿Puede usarse como cifrado seguro?

No. Un alfabeto simbólico y un diccionario de sustitución pueden recuperarse si se dispone del esquema o se analiza suficiente texto. Para privacidad real usa cifrado criptográfico estándar.

### ¿Hay una API REST?

No. La API que existe actualmente es una biblioteca JavaScript. Consulta [API JavaScript](API_JAVASCRIPT.md).

### ¿Ya incluye un mod de Minecraft?

No. La integración está propuesta y documentada, pero debe definirse la versión del juego, el cargador y si se traduce chat, interfaces o ambos. Consulta [Integración con Minecraft](INTEGRACION_MINECRAFT.md).

### ¿Por qué GitHub Actions aparece fallido?

Puede fallar una prueba del código o no iniciarse el runner por una restricción de la cuenta. Revisa los detalles del run; si indica un bloqueo de facturación, no equivale a prueba fallida del motor. Ejecuta `npm test` localmente.
