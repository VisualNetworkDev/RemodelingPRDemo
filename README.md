# Atlas Remodeling PR

Demo premium para remodelacion, sellado de techos, galvalume, pintura, reparaciones y mantenimiento de propiedades en Puerto Rico.

## Estructura

- `index.html`: pagina publica redisenada con experiencia tipo app, menu movil, fotos por servicio, galeria y formulario.
- `admin.html`: panel operativo directo, sin PIN ni pantalla de acceso.
- `styles.css`: estilos responsive compartidos.
- `app.js`: interacciones de la pagina publica, validaciones, fotos y envio.
- `admin.js`: dashboard, filtros, detalle, estados, notas, cotizaciones con fotos y opciones de pago.
- `backend/Code.gs`: entradas `doGet`/`doPost`, rutas, validaciones y flujos principales.
- `backend/Sheets.gs`: lectura/escritura de Google Sheets, historial, normalizacion y datos demo.
- `backend/Messages.gs`: correos, plantillas HTML, fotos y carpeta de Drive.

## Configuracion usada

- Google Sheet ID: `1yNLhgb55tUbCMSUqtfM6RviAEN3lRYZsCuUsJRm8bto`
- Apps Script project ID: `1yGJdiLI3FzMowZiNcUTRHngO0HjzVdnEs1gTkaaiKq973xbpoYl91FOa`
- Web App URL creada: `https://script.google.com/macros/s/AKfycbzQOOwzme8kzglwPPBMFhdm-Kiaw4UA5VxF0JZBsiH4Ne5HGcf3pWWxHJSegbIBn83wyw/exec`

## Activacion

1. Abre `backend/Code.gs` para revisar configuracion y rutas. `Sheets.gs` y `Messages.gs` se suben juntos con `clasp`.
2. Confirma `SHEET_ID`, `ADMIN_EMAIL` y, si quieres una carpeta fija de Drive, `DRIVE_FOLDER_ID`.
3. Desde PowerShell:

```powershell
cd "C:\Users\2808j\Desktop\construccion\backend"
clasp push --force
clasp deploy --description "Atlas Remodeling PR web app"
```

4. En el editor de Apps Script, ejecuta `setupDemo()` una vez para autorizar permisos y preparar las hojas.
5. Verifica que el deployment este como `Execute as: Me` y `Who has access: Anyone`.
6. Sube `index.html`, `admin.html`, `styles.css`, `app.js` y `admin.js` a GitHub Pages o abre localmente para probar.

Si `/exec?action=ping` responde 403, falta autorizar permisos o confirmar el acceso publico del Web App en Apps Script.

## Hojas usadas

- `Solicitudes`
- `Cotizaciones`
- `Notas`
- `Historial`
- `Config`

`setupDemo()` es idempotente: crea encabezados faltantes y agrega datos demo sin duplicar los registros base.
La cotizacion demo `Q-ARPR-10001` incluye fotos del proyecto y opciones de pago para coordinar con la duena del negocio.

## Acciones principales

- `ping`
- `setupDemo`
- `getServices`
- `submitRequest`
- `listRequests`
- `getRequest`
- `getDashboardStats`
- `updateStatus`
- `addInternalNote`
- `getNotes`
- `getHistory`
- `createQuote`
- `updateQuote`
- `previewQuoteEmail`
- `sendQuoteEmail`
- `resendCustomerConfirmation`
