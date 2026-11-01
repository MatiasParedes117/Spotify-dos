# Spotify Clone — Proyecto RA2 (ULagos)

Réplica visual e interactiva del **Spotify Web Player**, desarrollada como proyecto académico (RA2) con HTML, Tailwind CSS 4 y JavaScript vanilla. No usa backend ni la API oficial de Spotify: la reproducción es simulada y el estado del reproductor se guarda en `localStorage`.

## Páginas

| Archivo | Sección |
| --- | --- |
| `index.html` | Inicio (recomendaciones, tendencias, artistas) |
| `buscar.html` | Búsqueda con filtros y resultados |
| `biblioteca.html` | Biblioteca y playlists del usuario |
| `explorar.html` | Explorar géneros, moods y novedades |
| `acerca.html` | Acerca del proyecto y documentación |
| `detalle.html` | Detalle de álbum, artista, playlist o género (`?tipo=&id=`) |
| `premium.html` | Planes Premium simulados |
| `cuenta.html` | Cuenta y preferencias |

## Requisitos

- Node.js 18+ (solo para compilar Tailwind CSS).
- Navegador moderno (Chrome, Firefox, Safari, Edge).
- Servidor estático cualquiera (no se necesita backend).

## Desarrollo

Instalar dependencias:

```bash
npm install
```

Compilar Tailwind CSS 4 (genera `assets/css/tailwind.css`):

```bash
npm run build:css
```

Modo observador (recompila al guardar):

```bash
npm run watch:css
```

Servir localmente (puerto 8080):

```bash
npm run serve
```

O con Python:

```bash
python3 -m http.server 8080
```

## Despliegue

El proyecto es 100 % estático. Basta con subir todos los archivos (incluyendo `assets/css/tailwind.css` ya compilado y la carpeta `assets/img/`) a cualquier hosting estático (GitHub Pages, Netlify, Vercel, Cloudflare Pages, Apache/Nginx).

Antes de desplegar, ejecuta:

```bash
npm run build:css
```

para asegurarte de que `assets/css/tailwind.css` esté actualizado con los cambios de `assets/css/input.css` y las clases usadas en HTML/JS.

## Estructura

```
assets/
  css/        input.css (Tailwind), style.css (componentes), tailwind.css (generado)
  img/        imágenes locales (artistas, álbumes, playlists)
  js/         data.js, store.js, audio.js, cards.js, views.js, shell.js, script.js, icons.js
```

## Notas técnicas

- `style.css` se envuelve en `@layer components` para que las utilidades de Tailwind puedan sobrescribirlas.
- El reproductor es simulado: no hay audio real. El estado persiste en `localStorage` bajo la clave `sp2_playerState`.
- Las playlists creadas por el usuario se guardan en `sp2_userPlaylists`.
- Diseño responsive verificado en 375 px, 768 px y 1440 px sin desbordamiento horizontal.