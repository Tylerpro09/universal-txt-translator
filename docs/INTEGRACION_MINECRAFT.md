# Integración prevista con Minecraft

[Inicio](../README.md) · [Formato TXT](FORMATO_TXT.md) · [API](API_JAVASCRIPT.md)

> **Estado:** propuesta técnica; **no se ha compilado ni publicado ningún mod Minecraft** en este repositorio.

## Objetivo

Reutilizar el mismo formato TXT de equivalencias para mostrar un mensaje traducido dentro de Minecraft. Se debe elegir explícitamente:

- Versión de Minecraft (ejemplo: Java Edition 1.20.1, 1.21.x u otra).
- Cargador (Fabric, Forge o NeoForge).
- Ámbito: solo cliente, servidor o ambos.
- Superficie: mensajes de chat, comandos propios, interfaz de usuario, libros, letreros u otras.

El resultado puede ser un mod de *traducción de chat* compatible con un perfil de idioma TXT, sin depender de IA externa.

## Contrato de datos

Un archivo TXT compartido debe tener el mismo formato documentado:

```txt
ORIGEN: Idioma origen
IDIOMA: Idioma destino
[DICCIONARIO]
hola = saludo
```

El JavaScript de la web **no puede ejecutarse automáticamente dentro del mod Java**. Debe trasladarse cuidadosamente el analizador y el motor de sustitución a Java o usar una API externa controlada. Se recomienda la implementación Java nativa para funcionamiento sin conexión.

## Arquitectura propuesta

```text
Minecraft → pantalla/comando del mod → perfil TXT
                        │
            validador + parser Java
                        │
           traductor bidireccional
                        │
               mensaje mostrado
```

Un diseño inicial podría utilizar comandos como:

- `/traductor idioma cargar <nombre>`: activa un TXT validado.
- `/traductor direccion <auto|origen|destino>`: selecciona el sentido.
- `/traductor estado`: muestra el perfil activo y errores.
- `/traductor traducir <texto>`: devuelve una traducción **sin modificar el chat original**.

Los nombres de comandos son **propuesta**, no funcionalidades existentes.

## Restricciones importantes

- En servidores, cargar archivos y cambiar configuración debe requerir permisos apropiados.
- No conviene traducir ni modificar indiscriminadamente comandos, mensajes firmados, direcciones, componentes JSON o datos de jugadores.
- La traducción debe ser *opt-in* en el chat, y permitir mostrar el original para evitar pérdida de información.
- Los perfiles compartidos deben validar tamaño, duplicados y símbolos. No ejecutar instrucciones ni scripts desde TXT.
- Un mod puramente cliente requiere menos integración de red que uno distribuido para todos los jugadores.
- Para mantener compatibilidad hay que probar la versión exacta de Minecraft y del cargador elegido.

## Próximos pasos

Crear un módulo Java con pruebas sobre el formato TXT, integrar una pantalla de selección de idioma y después conectar la traducción al chat de forma opcional. **Nada de esto debe presentarse como mod existente hasta compilarse y probarse.**
