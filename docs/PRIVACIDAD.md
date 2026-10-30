# Privacidad y seguridad

[Inicio](../README.md) · [Arquitectura](ARQUITECTURA.md)

## Qué se procesa

La web lee los archivos TXT seleccionados en el navegador. Las reglas de equivalencia se analizan con JavaScript y la traducción se realiza localmente. **No usa servicios externos de traducción ni carga los contenidos de los TXT a un servidor.**

## Qué se guarda

Por defecto, los perfiles no se guardan de forma persistente. Si pulsas **Guardar perfil actual**, la definición del idioma se almacena en `localStorage` de ese navegador para poder restaurarla. La aplicación **no guarda automáticamente textos de entrada ni resultados de traducción**.

Las traducciones descargadas se escriben a archivos locales cuando solicitas la descarga. Borrar perfiles locales no borra archivos TXT descargados.

## Qué puede conocer el proveedor de alojamiento

GitHub Pages sirve el HTML, JavaScript y otros recursos públicos de la página, por lo que su infraestructura y el navegador pueden registrar solicitudes técnicas normales de acceso al sitio (por ejemplo, conexión, dirección IP y recursos solicitados). **Esto es distinto de enviar a GitHub los archivos de idioma o los textos traducidos**.

Al abrir enlaces a GitHub o documentación, visitas esa web de forma ordinaria y aplica su propia política de privacidad.

## Caché offline

Un service worker almacena **recursos estáticos públicos del sitio**. No intercepta para enviar ni guarda en el caché archivos TXT locales seleccionados por el usuario, ni contenido de mensajes.

## Riesgos

- `localStorage` no debe considerarse almacenamiento cifrado. Otras personas con acceso a tu perfil de navegador podrían recuperar definiciones guardadas.
- Los nombres y símbolos pueden ser privados para ti, pero un cifrado de sustitución **no es confidencialidad fuerte**.
- Un archivo TXT es contenido no confiable: la aplicación lo analiza como datos y no ejecuta instrucciones del archivo. Aun así, evita importar archivos enormes de fuentes no fiables.
- No uses el motor como sustituto de cifrado extremo a extremo para conversaciones sensibles.

## Eliminar información

En la interfaz, selecciona un perfil y pulsa **Eliminar**. Para eliminar todas las definiciones guardadas, también puedes borrar los datos de almacenamiento de este sitio en la configuración de tu navegador.

Para eliminar textos guardados con **Descargar**, borra sus archivos en tu dispositivo.

## Ausencias deliberadas

No existe cuenta de usuario, telemetría incorporada, sincronización entre dispositivos, integración con servicios de analítica ni API pública para cargar mensajes.
