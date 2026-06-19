# Atlas Remodeling PR

Interfaz publica y panel operativo para servicios de remodelacion, sellado de techos, galvalume, pintura, reparaciones y mantenimiento de propiedades en Puerto Rico.

## Publicacion

Este repositorio publica solamente los archivos frontend de GitHub Pages:

- `index.html`
- `admin.html`
- `styles.css`
- `app.js`
- `admin.js`
- `tests/smoke.js`

La carpeta `backend/` no pertenece a este repositorio publicado. El backend se mantiene fuera de GitHub y se despliega por Apps Script con `clasp` desde la carpeta fuente local.

## Funciones incluidas

- Pagina publica tipo app con menu movil y secciones separadas.
- Formulario de evaluacion con fotos optimizadas antes de enviar.
- Seguimiento por codigo de proyecto.
- Aprobacion de propuesta y seleccion de metodo de pago.
- Galeria administrable y fotos por proyecto.
- Panel admin con consultas, cotizaciones, agenda, reportes, pagos, correos, usuarios y ajustes.
- Generacion de PDF de cotizacion desde el panel.

## Validacion

```powershell
node --check app.js
node --check admin.js
node --check tests\smoke.js
node tests\smoke.js
```
