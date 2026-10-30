# Registro de cambios

## 2.2.0 — 2026-10-30

- Preparación del modo sin Wi-Fi mediante botón y verificación de archivos esenciales.
- Caché offline con respuesta inmediata y actualización posterior de recursos públicos.
- Aplicación web instalable (PWA) con iconos PNG 192 y 512.
- Estado visible de disponibilidad sin Wi-Fi y acceso al manual offline.
- Funciona como carpeta local portátil sin servicio de red.

## 2.1.0 — 2026-10-30

- Se conserva el motor de traducción bidireccional por TXT, sin idiomas precargados.
- CLI con Node.js para traducir textos y archivos desde la terminal.
- Editor TXT integrado para pegar, validar, activar y editar un perfil.
- Biblioteca opcional de perfiles en el almacenamiento local del navegador (máximo 12).
- Exportación del perfil activo como TXT.
- Traducción de archivos TXT completos sin subirlos a un servidor.
- Filtro de búsqueda para la tabla de equivalencias.
- Acceso a guías técnicas y documentación desde la aplicación.
- Manifest, icono y caché offline de recursos estáticos.
- README y documentación de usuario, especificación TXT, API, arquitectura, FAQ, privacidad e integración futura Minecraft.

## 2.0.0 — 2026-10-30

- Motor TXT con reglas de alfabeto, diccionario y frases.
- Traducción origen/destino, dirección automática heurística.
- Interfaz web responsiva, carga con arrastrar/soltar y descarga.
- Suite de pruebas con Node.js y flujo de GitHub Actions.

## Limitaciones pendientes

- El motor no realiza traducción neuronal ni infiere idiomas a partir de texto libre.
- Sin reglas gramaticales parametrizadas.
- Sin mod Minecraft compilado.
- GitHub Actions puede bloquear runners por restricciones de cuenta; ejecutar `npm test` localmente cuando corresponda.
