# Registro fotográfico de folios

Aplicación frontend para organizar folios y sus fotografías. Cada folio guarda tipo, cargo, año, ubicación y número. Los datos y las imágenes se conservan en este navegador mediante IndexedDB.

## Archivos

```
index.html     Formulario, galería y vista previa
estilos.css    Diseño adaptable
Db.js          Almacenamiento local de folios y fotos Blob
Exportar.js    Generación del documento Word
app.js         Interfaz, cámara, validaciones y eventos
```

La aplicación actualiza la base IndexedDB existente y conserva las fotos guardadas al migrar registros anteriores.

## Ejecutar

Abre la carpeta en Visual Studio Code y usa Live Server desde `index.html`, o abre el archivo en un navegador reciente. Para usar la cámara web se requiere `localhost` o HTTPS y permiso del navegador.

En celulares, **Tomar foto** puede abrir la cámara posterior. Para agregar imágenes existentes, usa **Agregar imágenes**.

## Uso

1. Crea un folio e ingresa tipo, cargo, año, ubicación y número.
2. Guarda el folio.
3. Toma o agrega fotos. Cada foto puede tener una descripción y fecha de incorporación.
4. Ordena las fotos y genera el Word cuando todas tengan descripción.

Cada folio conserva su propia galería. Eliminar un folio también elimina sus fotos. Las fotos se reducen a un máximo de 1600 px por lado y se guardan como JPEG.

## Documento Word

El anexo incluye los cinco datos del folio y las fotos numeradas con sus descripciones. Mantiene el formato A4 vertical, la tabla continua y dos fotografías por página. La librería `docx` se carga desde CDN, por lo que se necesita conexión a Internet para generar el archivo.

## Límites del almacenamiento

Los datos pertenecen al navegador y perfil donde se registraron. No se sincronizan con otros equipos; borrar los datos del sitio o usar modo privado puede eliminarlos. La fecha mostrada es cuando se incorporó la foto a la aplicación y no certifica cuándo se tomó originalmente.
