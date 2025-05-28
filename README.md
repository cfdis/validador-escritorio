# validador_cfdi

A minimal Electron application with TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Build Migrations
- Execute this command to build Kysely migrations before running the project for the first time:

```bash
$ npm run build:migrations
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

### Distribución para Windows
>AppX Package Code Signing
>- If the AppX package is meant for enterprise or self-made distribution (manually install the app without using the Store for testing or for enterprise distribution), it must be signed.
>- If the AppX package is meant for Windows Store distribution, no need to sign the package with any certificate. The Windows Store will take care of signing it with a Microsoft certificate during the submission process.

Para distribuir la app por medio de Microsoft Store es necesario generar un archivo .msix sin firma a partir del .msi generado en el build anterior utilizando la herramienta [MSIX Packaging Tool](https://learn.microsoft.com/en-us/windows/msix/packaging-tool/tool-overview).

Si se decide no distribuir a travez de la playstore, es necesario firmar la app "por fuera", siguiendo los siguientes pasos:

#### Requisitor previos
- Se requiere el SDK de windows 10 descargable aquí: https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/

- Instalar el CLI electron-windows-store 

```bash
$ npm install -g electron-windows-store
```

- Configurar PowerShell

```bash
$ Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
```

- El build para windows ya debe estar generado.

- Ejecutar electron-windows-store para convertir win-unpacked en un paquete AppX

```bash
$ electron-windows-store `
    --input-directory D:\Proyectos\Electron\validador_cfdi\dist\win-unpacked `
    --output-directory C:\output\validador_cfdi `
    --package-version 1.0.0.0 `
    --package-name ValidadorCfdi `
    --package-display-name "ValidadorCfdi" `
    --publisher-display-name "Facturabilidad" `
    --identity-name 1845facturablablabla.blabla `
    --assets D:\Proyectos\Electron\validador_cfdi\resources
```


## Uso de marca y logotipo

Este software cliente es de código abierto bajo la licencia [Apache 2.0].

**Sin embargo, queda estrictamente prohibido:**
- Usar el nombre comercial “Facturabilidad”, el logotipo, colores distintivos o cualquier material de marca asociado sin consentimiento por escrito del titular de los derechos.
- Presentar versiones modificadas del software como si fueran versiones oficiales, esto para evitar confusión al usuario final o competencia desleal.

El uso del logotipo o marca solo está autorizado para instancias que utilizan el backend oficial operado por Facturabilidad SAS, y no para instancias que utilizan su propio backend o instancias no oficiales.
