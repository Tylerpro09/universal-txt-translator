# Interfaz de línea de comandos (CLI)

[Inicio](../README.md) · [API](API_JAVASCRIPT.md)

El motor también puede usarse desde una terminal con **Node.js 22+**, sin instalar paquetes ni conectarse a Internet.

## Requisitos

Clona el repositorio y entra en él:

```bash
git clone https://github.com/Tylerpro09/universal-txt-translator.git
cd universal-txt-translator
node --version
```

## Traducir texto directamente

```bash
node cli.js --profile mi_idioma.txt --text "hola" --direction encode
```

`--profile` es el TXT que define las equivalencias. **No hay un idioma precargado**: primero crea tu archivo mediante la [especificación](FORMATO_TXT.md).

## Recuperar un texto

```bash
node cli.js --profile mi_idioma.txt --text "saludo" --direction decode
```

## Traducir un archivo completo

```bash
node cli.js --profile mi_idioma.txt --input mensaje.txt --output traducido.txt --direction encode
```

Si omites `--output`, el resultado se imprime en la terminal (`stdout`).

## Opciones

| Opción | Alias | Propósito |
| --- | --- | --- |
| `--profile` | `-p` | Archivo de equivalencias TXT (obligatorio) |
| `--text` | `-t` | Texto literal a traducir |
| `--input` | `-i` | Archivo TXT con el texto de entrada |
| `--output` | `-o` | Archivo donde guardar la traducción |
| `--direction` | `-d` | `encode`, `decode` o `auto` |
| `--help` | `-h` | Mostrar ayuda |

Debes indicar exactamente uno de `--text` o `--input`. La dirección predeterminada es `auto` y puede resultar ambigua. En ese caso, debes especificar manualmente `-d encode` o `-d decode`.

## Salidas de error

La CLI escribe errores y advertencias en `stderr`. Termina con código `0` cuando la ejecución concluye y `1` cuando no puede completar la traducción, por ejemplo porque no existe el perfil o hay ambigüedad en modo automático.

Los archivos se leen estrictamente como UTF-8. Para archivos ANSI/Windows-1252, guárdalos en UTF-8 antes de usarlos en CLI. El límite es de **2 MB** por archivo.

## Automatización

Puedes usar la CLI desde un script o un proceso local, capturar `stdout` y comprobar el código de salida. Los comandos no ejecutan instrucciones encontradas dentro del TXT; solo leen reglas de equivalencia.

Este componente no es un servicio HTTP ni implementa un mod de Minecraft.
