# Utilizar Motor TXT Universal sin Wi-Fi

[Documentación web](index.html) · [Inicio](../README.md) · [Guía del usuario](GUIA_USUARIO.md)

## Resumen

La aplicación puede traducir sin conexión a Internet porque el motor no necesita un servidor: convierte textos mediante las equivalencias cargadas desde un archivo TXT local. **Es indispensable contar con el archivo de idioma y sus equivalencias antes de traducir.**

Existen dos formas de utilizarlo sin Wi-Fi:

1. **Como aplicación web instalable (PWA):** visita primero el sitio con Internet, guarda sus recursos en el dispositivo y luego abre la misma dirección o el acceso directo sin conexión.
2. **Como carpeta portátil:** descarga previamente el repositorio, descomprímelo y abre `index.html` desde la carpeta. Los archivos públicos necesarios quedan en tu dispositivo.

> Ninguno de los dos modos permite descargar nuevas versiones, páginas externas ni nuevos idiomas de Internet mientras estés desconectado.

## A. Preparar el modo web sin Wi-Fi

1. Conéctate a Internet al menos una vez.
2. Abre https://tylerpro09.github.io/universal-txt-translator/
3. En la sección **Modo sin Wi-Fi**, pulsa **Guardar para usar sin Wi-Fi**.
4. Comprueba el mensaje de confirmación que informa de que los recursos fueron guardados.
5. Carga un idioma TXT o activa uno desde el editor.
6. Si quieres conservar el perfil, pulsa **Guardar perfil actual** o **Exportar perfil .txt**.
7. Ahora desactiva el Wi-Fi y los datos móviles. Vuelve a abrir la misma dirección en el mismo navegador, o usa el acceso directo instalado.
8. Comprueba que puedes escribir una frase y obtener su traducción.

Si eliminas los datos del sitio, usas otro navegador, activas navegación privada o el sistema limpia el almacenamiento, puede que necesites repetir la preparación online.

### Android

En Chrome o Edge para Android, visita la web con conexión. Tras preparar el modo offline, puedes seleccionar **Instalar aplicación** si el navegador ofrece ese botón; en otros casos, utiliza el menú del navegador **Agregar a la pantalla de inicio**. Esto crea un acceso directo o aplicación web según la compatibilidad del dispositivo.

La instalación **no es requisito** para traducir offline si el navegador conserva los recursos en caché. Al instalar, verifica primero que aparece el mensaje de modo sin Wi-Fi preparado.

### Windows

En Chrome o Edge para Windows, puedes seguir usando la web abierta en el navegador o instalarla como aplicación cuando aparezca esa opción. Después de preparar la copia offline, no hace falta un servidor local, Node.js ni conexión para traducir textos con un perfil disponible.

## B. Descargar versión portátil

1. Con Internet, descarga el repositorio completo en un ZIP desde:
   https://github.com/Tylerpro09/universal-txt-translator/archive/refs/heads/main.zip
2. Descomprime el archivo.
3. Abre `index.html` desde la carpeta descomprimida.
4. Conserva en la misma estructura, como mínimo, `index.html`, `motor_idiomas.js`, `enhancements.js`, `offline.js` y `docs/`.
5. Selecciona un TXT local y traduce sin conexión.

La versión portátil funciona sin instalar una PWA ni depender de un service worker, que los navegadores no permiten en páginas `file://`. Algunas funciones de persistencia local pueden variar según la política del navegador al abrir archivos `file://`.

## ¿Qué funciona offline?

| Función | Sin Wi-Fi |
| --- | --- |
| Abrir el traductor ya guardado/instalado | Sí, si conserva sus recursos |
| Traducir con un perfil cargado | Sí |
| Crear y validar un idioma en el editor | Sí |
| Importar un TXT local | Sí |
| Exportar traducciones o perfiles | Sí |
| Biblioteca de perfiles guardados en el mismo navegador | Sí, si el navegador permite el almacenamiento y no se ha borrado |
| Centro de documentación básico | Sí, si se guardó con el sitio |
| Leer enlaces que van a GitHub | No, requieren conexión |
| Obtener actualizaciones | No, hasta recuperar conexión |
| Traducir un idioma sin equivalencias conocidas | No, ni siquiera con Internet |

## Solución de problemas

**«No se ha confirmado la copia sin conexión»**  
Abre el traductor en HTTPS, comprueba tu conexión y pulsa **Guardar para usar sin Wi-Fi**. Algunos navegadores privados bloquean los service workers o el almacenamiento.

**«Faltan recursos»**  
Algún archivo no se descargó completamente, posiblemente por un despliegue de GitHub Pages en curso. Vuelve a intentarlo con Internet.

**La web no abre después de activar modo avión**  
Comprueba que estás usando el mismo navegador y perfil donde la preparaste. Si no se abre, vuelve a conectarte y pulsa el botón de preparación; también puedes usar el ZIP portátil.

**Los perfiles desaparecieron**  
Las reglas guardadas en `localStorage` se eliminan cuando el navegador borra datos del sitio. Exporta los TXT originales como copia de seguridad.

**La traducción no cambia las palabras**  
La falta de Internet no impide traducir. Si una palabra se conserva, es porque el idioma activo no tiene una equivalencia para ella o se ha elegido la dirección incorrecta.

## Privacidad y almacenamiento

La precarga offline solo almacena **HTML, JavaScript, iconos y documentación pública** de la web. Los TXT y mensajes que selecciones no se envían al servidor ni se incluyen en la caché del service worker. Los perfiles que decides guardar se almacenan por separado en el navegador.

**Importante:** un sistema de sustitución de letras no equivale a cifrado seguro.

Para ampliar la información consulta [Privacidad y seguridad](PRIVACIDAD.md).
