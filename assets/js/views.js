/* =====================================================================
 * Spotify-dos — Vistas (renderizado de páginas)
 * Cada función devuelve el contenido de #sp2-view. El <main> vive en el
 * esqueleto HTML de cada página, por lo que aquí no se anida otro <main>.
 * ================================================================== */

/* ═══════════════════════════════════════════════════
   HOME
═══════════════════════════════════════════════════ */
function renderHome() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  // Accesos rápidos (últimos reproducidos)
  const recentItems = DB.homeSections[0]?.items || [];
  const quickGrid = recentItems.slice(0, 6).map(it => {
    let obj, lnk, bg;
    if (it.type === "album")         { obj = DB.album(it.id);    lnk = `album/${it.id}`;    bg = coverBg(obj, "album"); }
    else if (it.type === "playlist") { obj = DB.playlist(it.id); lnk = `playlist/${it.id}`; bg = coverBg(obj, "playlist"); }
    else                             { obj = DB.artist(it.id);   lnk = `artist/${it.id}`;   bg = coverBg(obj, "artist"); }
    if (!obj) return "";
    const name = esc(it.type === "album" ? obj.title : obj.name);
    const isActive = Player.context.id === it.id;
    return `
<article class="sp2-quick-card group relative flex items-center gap-3 overflow-hidden rounded-md bg-white/[0.07] transition-all hover:bg-white/[0.12] ${isActive ? "ring-1 ring-[#1ed760]/40" : ""}">
  <a class="absolute inset-0 z-0" href="${routeUrl(lnk)}" aria-label="Ir a ${name}"></a>
  <span class="relative z-10 h-16 w-16 shrink-0 bg-cover bg-center pointer-events-none" style="${bg}"></span>
  <span class="relative z-10 min-w-0 flex-1 truncate pr-2 text-sm font-bold leading-tight text-white pointer-events-none">${name}</span>
  <button class="sp2-quick-play relative z-20 mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-xl transition-transform hover:scale-105"
    data-collection-play="${it.type}:${it.id}" aria-label="Reproducir ${name}">
    <span class="ml-0.5 flex h-5 w-5 items-center justify-center text-[18px]">${icon(isActive && Player.playing ? "pause" : "play")}</span>
  </button>
</article>`;
  }).join("");

  // Canciones del momento
  const trendSongs = (DB.homeTrending?.songIds || []).slice(0, 6).map((sid, i) => {
    const song = DB.song(sid); if (!song) return "";
    const album = DB.album(song.albumId);
    const artist = DB.artist(song.artistId);
    const isActive = Player.song?.id === sid;
    return `
<div class="sp2-trend-row group flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-white/[0.07] cursor-pointer ${isActive ? "bg-white/[0.05]" : ""}"
  data-play-song="${sid}" data-queue-type="playlist" data-queue-id="pl-topglobal" tabindex="0" role="button"
  aria-label="Reproducir ${esc(song.title)} de ${esc(artist?.name || "")}">
  <span class="w-6 shrink-0 text-center text-sm tabular-nums ${isActive ? "text-[#1ed760]" : "text-[#a7a7a7]"}">${isActive && Player.playing ? `<span class="text-[14px]">${icon("volume-low")}</span>` : i + 1}</span>
  <span class="h-11 w-11 shrink-0 rounded bg-cover bg-center shadow-sm" style="${coverBg(album || {}, "album")}"></span>
  <div class="min-w-0 flex-1">
    <p class="truncate text-sm font-semibold leading-tight ${isActive ? "text-[#1ed760]" : "text-white"}">${esc(song.title)}</p>
    <p class="truncate text-xs text-[#a7a7a7]">${esc(artist?.name || "")}</p>
  </div>
  <span class="ml-2 hidden text-xs tabular-nums text-[#a7a7a7] sm:block">${fmtTime(song.duration)}</span>
  <button class="sp2-row-like ml-1 transition ${Player.liked.has(sid) ? "!opacity-100 text-[#1ed760]" : "text-[#a7a7a7] hover:text-white"}" data-like="${sid}" aria-label="Me gusta ${esc(song.title)}">
    <span class="text-[15px]">${icon(Player.liked.has(sid) ? "heart" : "heart-outline")}</span>
  </button>
</div>`;
  }).join("");

  // Secciones de tarjetas
  const sections = DB.homeSections.slice(1).map(sec => {
    const cards = sec.items.slice(0, 6).map(it => {
      let obj, sub;
      if (it.type === "artist")        { obj = DB.artist(it.id);   sub = "Artista"; }
      else if (it.type === "album")    { obj = DB.album(it.id);    sub = `Álbum · ${DB.artist(obj?.artistId)?.name || ""}`; }
      else                             { obj = DB.playlist(it.id); sub = obj?.desc?.substring(0, 50) || "Playlist"; }
      if (!obj) return "";
      return cardHtml({ type: it.type, item: obj, subtext: sub, round: it.type === "artist" });
    }).join("");
    return `<section class="mb-9">
      ${sectionHeader(sec.title)}
      ${cardGrid(cards)}
    </section>`;
  }).join("");

  return `
<div class="sp2-page px-4 pb-12 sm:px-6 lg:px-8">
  <div class="flex flex-col gap-4 pt-6 pb-5 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p class="sp2-eyebrow">Tu música</p>
      <h1 class="text-2xl font-black text-white sm:text-3xl">${greeting}</h1>
    </div>
    <a href="explorar.html" class="sp2-ghost-link self-start sm:self-auto">
      ${icon("globe")} Explorar novedades
    </a>
  </div>

  <div class="mb-9 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
    ${quickGrid || `<p class="text-sm text-[#a7a7a7]">Empieza a reproducir algo para ver tus accesos rápidos.</p>`}
  </div>

  <section class="mb-9 grid grid-cols-1 gap-6 lg:grid-cols-2">
    <div>
      ${sectionHeader("Canciones del momento", "playlist/pl-topglobal")}
      <div class="flex flex-col gap-1">${trendSongs}</div>
    </div>
    <div>
      ${sectionHeader("Géneros populares", "explore")}
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
        ${DB.genres.slice(0, 6).map(g => `
<a href="${routeUrl(`genre/${g.id}`)}" class="sp2-genre-tile" style="--genre-color:${g.color}" aria-label="Explorar ${esc(g.name)}">
  <span class="sp2-genre-tile-media" style="background-image:url('${g.img}')"></span>
  <span class="sp2-genre-tile-name">${esc(g.name)}</span>
</a>`).join("")}
      </div>
    </div>
  </section>

  ${sections}
</div>`;
}

/* ═══════════════════════════════════════════════════
   SEARCH
═══════════════════════════════════════════════════ */
const searchState = { query: "", filter: "all" };

const SEARCH_FILTERS = [
  ["all", "Todo"],
  ["songs", "Canciones"],
  ["artists", "Artistas"],
  ["albums", "Álbumes"],
  ["playlists", "Playlists"],
];

function searchChipsHtml(filter) {
  return SEARCH_FILTERS.map(([value, label]) => {
    const on = filter === value;
    return `<button type="button" class="sp2-filter-chip ${on ? "active" : ""}" data-search-filter="${value}"
      aria-pressed="${on}">${label}</button>`;
  }).join("");
}

function searchDiscoveryHtml() {
  return `
<section class="mt-8">
  ${sectionHeader("Busca por categoría")}
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
    ${DB.genres.map(g => `
<a href="${routeUrl(`genre/${g.id}`)}" class="sp2-genre-tile sp2-genre-tile--lg" style="--genre-color:${g.color}" aria-label="Explorar ${esc(g.name)}">
  <span class="sp2-genre-tile-media" style="background-image:url('${g.img}')"></span>
  <span class="sp2-genre-tile-name">${esc(g.name)}</span>
</a>`).join("")}
  </div>
</section>

<section class="mt-10">
  ${sectionHeader("Artistas para empezar", "explore")}
  ${cardGrid(DB.artists.slice(0, 6).map(a => cardHtml({ type: "artist", item: a, subtext: "Artista", round: true })).join(""))}
</section>`;
}

function searchTopResultHtml(q) {
  const results = DB.search(q);
  const first = results.artists[0] || results.albums[0] || results.playlists[0];
  if (!first) return "";
  const type = results.artists[0] === first ? "artist" : results.albums[0] === first ? "album" : "playlist";
  const name = type === "album" ? first.title : first.name;
  const sub = type === "artist"
    ? "Artista"
    : type === "album"
      ? `Álbum · ${DB.artist(first.artistId)?.name || ""}`
      : "Playlist";
  return `
<article class="sp2-top-result group relative overflow-hidden rounded-2xl bg-white/[0.07] p-5 transition-colors hover:bg-white/[0.12]">
  <a class="absolute inset-0 z-0 rounded-2xl" href="${routeUrl(`${type}/${first.id}`)}" aria-label="Ver ${esc(name)}"></a>
  <div class="relative z-10 flex flex-col gap-4 pointer-events-none sm:flex-row sm:items-end">
    <div class="h-28 w-28 shrink-0 overflow-hidden ${type === "artist" ? "rounded-full" : "rounded-lg"} shadow-2xl">
      <div class="h-full w-full" style="${coverBg(first, type)}"></div>
    </div>
    <div class="min-w-0">
      <p class="text-[11px] font-bold uppercase tracking-wider text-[#a7a7a7]">Resultado principal</p>
      <p class="mt-1 text-2xl font-black leading-tight text-white">${esc(name)}</p>
      <p class="mt-1 text-sm text-[#a7a7a7]">${esc(sub)}</p>
    </div>
  </div>
  <button class="sp2-top-play absolute bottom-4 right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-xl transition-transform hover:scale-105"
    data-collection-play="${type}:${first.id}" aria-label="Reproducir ${esc(name)}">
    <span class="ml-0.5 flex h-5 w-5 items-center justify-center text-[20px]">${icon("play")}</span>
  </button>
</article>`;
}

function searchResultsHtml(q, filter = "all") {
  const term = (q || "").trim();
  if (!term) return searchDiscoveryHtml();

  const results = DB.search(term);
  const total = results.artists.length + results.albums.length + results.playlists.length + results.songs.length;

  if (!total) {
    return `<div class="flex flex-col items-center justify-center py-20 text-center">
      <span class="mb-4 text-6xl">${icon("search")}</span>
      <h2 class="text-2xl font-black text-white">Sin resultados para “${esc(term)}”</h2>
      <p class="mt-2 max-w-md text-sm text-[#a7a7a7]">Revisa la ortografía o prueba con otro artista, canción, álbum o playlist.</p>
      <a href="explorar.html" class="mt-6 rounded-full bg-white px-6 py-3 text-sm font-black text-black transition hover:bg-white/90">Explorar categorías</a>
    </div>`;
  }

  const resultSection = (title, content) => content
    ? `<section class="mb-8">${sectionHeader(title)}${content}</section>`
    : "";

  const songRows = results.songs
    .slice(0, filter === "songs" ? 30 : 6)
    .map((s, i) => songRowHtml(s, i, { showAlbum: true, queueType: "search", queueId: "search" }))
    .join("");

  const artistCards = results.artists
    .map(a => cardHtml({ type: "artist", item: a, subtext: "Artista", round: true }))
    .join("");
  const albumCards = results.albums
    .map(a => cardHtml({ type: "album", item: a, subtext: `Álbum · ${DB.artist(a.artistId)?.name || ""}` }))
    .join("");
  const playlistCards = results.playlists
    .map(p => cardHtml({ type: "playlist", item: p, subtext: p.desc?.substring(0, 48) || "Playlist" }))
    .join("");

  let html = `<p class="sp2-result-count">${total} resultado${total === 1 ? "" : "s"} para <strong>“${esc(term)}”</strong></p>`;

  if (filter === "all") {
    html += `<div class="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr]">
      <div>${searchTopResultHtml(term)}</div>
      <div>
        ${sectionHeader("Canciones")}
        <div class="flex flex-col gap-1">${songRows}</div>
      </div>
    </div>`;
    html += resultSection("Artistas", artistCards ? cardGrid(artistCards) : "");
    html += resultSection("Álbumes", albumCards ? cardGrid(albumCards) : "");
    html += resultSection("Playlists", playlistCards ? cardGrid(playlistCards) : "");
  } else if (filter === "songs") {
    html += resultSection("Canciones", `<div class="flex flex-col gap-1">${songRows}</div>`);
  } else if (filter === "artists") {
    html += resultSection("Artistas", artistCards ? cardGrid(artistCards) : "");
  } else if (filter === "albums") {
    html += resultSection("Álbumes", albumCards ? cardGrid(albumCards) : "");
  } else if (filter === "playlists") {
    html += resultSection("Playlists", playlistCards ? cardGrid(playlistCards) : "");
  }

  if (html === `<p class="sp2-result-count">${total} resultado${total === 1 ? "" : "s"} para <strong>“${esc(term)}”</strong></p>`) {
    html += `<div class="rounded-2xl bg-white/[0.05] p-8 text-center text-sm text-[#a7a7a7]">No hay resultados de este tipo. Prueba con otro filtro.</div>`;
  }

  return html;
}

function renderSearch(q = "", filter = "all") {
  const term = q || "";
  return `
<div class="sp2-page px-4 pb-12 pt-5 sm:px-6 lg:px-8">
  <div class="mb-5">
    <p class="sp2-eyebrow">Buscar</p>
    <h1 class="text-2xl font-black text-white sm:text-3xl">Encuentra tu próxima canción</h1>
  </div>

  <form id="sp2-search-form" class="relative mb-4" role="search">
    <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-[#7a7a7a]">${icon("search")}</span>
    <input id="sp2-search-input" type="search" autocomplete="off" placeholder="¿Qué quieres escuchar?"
      value="${esc(term)}" aria-label="Buscar canciones, artistas, álbumes y playlists"
      class="w-full rounded-full border border-white/10 bg-white py-3 pl-11 pr-5 text-sm font-medium text-black outline-none placeholder:text-[#7a7a7a] focus:ring-2 focus:ring-white/40"/>
  </form>

  <div class="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filtrar resultados de búsqueda">
    ${searchChipsHtml(filter)}
  </div>

  <div id="sp2-search-results">${searchResultsHtml(term, filter)}</div>
</div>`;
}

/* ═══════════════════════════════════════════════════
   DETAIL
═══════════════════════════════════════════════════ */
function renderDetail(tipo, id) {
  switch ((tipo || "").toLowerCase()) {
    case "playlist": return renderPlaylist(id);
    case "album":    return renderAlbum(id);
    case "artist":   return renderArtist(id);
    case "genre":    return renderGenre(id);
    case "liked":    return renderLiked();
    default:         return renderNotFound("la colección");
  }
}

/* ═══════════════════════════════════════════════════
   PLAYLIST
═══════════════════════════════════════════════════ */
function renderPlaylist(id) {
  const pl = DB.playlist(id);
  if (!pl) return renderNotFound("la playlist");
  const songs = (pl.songIds || []).map(sid => DB.song(sid)).filter(Boolean);
  const totalSec = songs.reduce((a, s) => a + (s.duration || 0), 0);
  const isUser = DB.isUserPlaylist(id);

  return `
<div class="sp2-detail-page">
  ${detailHeroHtml({ kind: "Playlist", name: pl.name, img: pl.img,
    meta: `<span class="font-semibold text-white">${esc(pl.owner)}</span>
           <span class="text-white/50">·</span>
           <span>${songs.length} canciones, ${fmtTime(totalSec)}</span>`,
    extra: esc(pl.desc || "") })}
  ${actionBarHtml("playlist", id, { custom: isUser })}
  ${songs.length
    ? songTableHtml(songs, { queueType: "playlist", queueId: id })
    : `<div class="px-4 pb-16 text-center sm:px-8">
        <p class="text-lg font-black text-white">Esta playlist está vacía</p>
        <p class="mt-1 text-sm text-[#a7a7a7]">${isUser ? "Usa “Agregar canciones” para empezar a construirla." : "Vuelve pronto para descubrir nuevas canciones."}</p>
      </div>`}
</div>`;
}

/* ═══════════════════════════════════════════════════
   ÁLBUM
═══════════════════════════════════════════════════ */
function renderAlbum(id) {
  const alb = DB.album(id);
  if (!alb) return renderNotFound("el álbum");
  const artist = DB.artist(alb.artistId);
  const songs = alb.songs.map(([sid]) => DB.song(sid)).filter(Boolean);
  const totalSec = songs.reduce((a, s) => a + (s.duration || 0), 0);

  return `
<div class="sp2-detail-page">
  ${detailHeroHtml({ kind: "Álbum", name: alb.title, img: alb.img,
    meta: `<a href="${routeUrl(`artist/${alb.artistId}`)}" class="font-bold text-white hover:underline">${esc(artist?.name || "")}</a>
           <span class="text-white/50">·</span>
           <span>${alb.year}</span>
           <span class="text-white/50">·</span>
           <span>${songs.length} canciones, ${fmtTime(totalSec)}</span>` })}
  ${actionBarHtml("album", id, { saveAlbum: true })}
  ${songTableHtml(songs, { showAlbum: false, queueType: "album", queueId: id })}
  ${artist ? `<section class="px-4 pb-10 sm:px-8">
    <h2 class="mb-4 text-base font-black text-white">Sobre el artista</h2>
    <a href="${routeUrl(`artist/${artist.id}`)}" class="flex items-center gap-4 rounded-xl bg-white/[0.05] p-4 transition-colors hover:bg-white/[0.08]">
      <span class="h-20 w-20 shrink-0 overflow-hidden rounded-full shadow-lg" style="${coverBg(artist, "artist")}"></span>
      <div class="min-w-0">
        <p class="text-lg font-black leading-tight text-white">${esc(artist.name)}</p>
        <p class="mt-1 text-xs text-[#a7a7a7]">${esc(artist.monthly)} oyentes mensuales</p>
        <p class="mt-2 line-clamp-2 text-sm text-[#a7a7a7]">${esc(artist.bio || "")}</p>
      </div>
    </a>
  </section>` : ""}
</div>`;
}

/* ═══════════════════════════════════════════════════
   ARTISTA
═══════════════════════════════════════════════════ */
function renderArtist(id) {
  const artist = DB.artist(id);
  if (!artist) return renderNotFound("el artista");
  const albums = DB.albums.filter(a => a.artistId === id);
  const allSongs = albums.flatMap(a => a.songs.map(([sid]) => DB.song(sid)).filter(Boolean));
  const popularSongs = allSongs.slice(0, 5);

  const albumCards = albums.map(a => cardHtml({
    type: "album", item: a, subtext: `${a.year} · Álbum`,
  })).join("");

  const relatedArtists = DB.artists
    .filter(a => a.id !== id)
    .slice(0, 6)
    .map(a => cardHtml({ type: "artist", item: a, subtext: "Artista", round: true })).join("");

  return `
<div class="sp2-detail-page">
  ${detailHeroHtml({ kind: "Artista", name: artist.name, img: artist.img,
    meta: `<span class="font-semibold">${icon("verified")} Artista verificado</span>
           <span class="text-white/50">·</span>
           <span>${artist.monthly} oyentes mensuales</span>`,
    extra: esc(artist.bio || ""),
    badge: artist.verified ? "Artista verificado" : "" })}
  ${actionBarHtml("artist", id, { follow: true })}

  <div class="px-4 pb-4 sm:px-8">
    <section class="mb-8">
      ${sectionHeader("Popular")}
      <div class="flex flex-col gap-1">
        ${popularSongs.map((s, i) => songRowHtml(s, i, { showAlbum: false, queueType: "artist", queueId: id })).join("")}
      </div>
    </section>

    <section class="mb-8">
      ${sectionHeader("Discografía")}
      ${cardGrid(albumCards)}
    </section>

    <section class="mb-8">
      ${sectionHeader("Artistas similares")}
      ${cardGrid(relatedArtists)}
    </section>
  </div>
</div>`;
}

/* ═══════════════════════════════════════════════════
   GÉNERO
═══════════════════════════════════════════════════ */
function renderGenre(id) {
  const genre = DB.genre(id);
  if (!genre) return renderNotFound("el género");
  const playlists = DB.playlists.slice(0, 12);
  const cards = playlists.map(p => cardHtml({
    type: "playlist", item: p, subtext: p.desc?.substring(0, 48),
  })).join("");

  return `
<div class="sp2-detail-page">
  <header class="sp2-genre-hero" style="--genre-color:${genre.color}">
    <div class="sp2-genre-hero-media" style="background-image:url('${genre.img}')"></div>
    <div class="sp2-genre-hero-overlay"></div>
    <div class="sp2-genre-hero-content">
      <p class="sp2-eyebrow">Género</p>
      <h1>${esc(genre.name)}</h1>
      <p>Playlists, artistas y canciones para entrar en el mood.</p>
    </div>
  </header>

  <div class="px-4 pb-12 pt-6 sm:px-6 lg:px-8">
    <section class="mb-9">
      ${sectionHeader("Playlists populares")}
      ${cardGrid(cards)}
    </section>

    <section class="mb-9">
      ${sectionHeader("Artistas del género")}
      ${cardGrid(DB.artists.slice(0, 6).map(a => cardHtml({ type: "artist", item: a, subtext: "Artista", round: true })).join(""))}
    </section>

    <section>
      ${sectionHeader("Explora otros géneros", "explore")}
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        ${DB.genres.filter(g => g.id !== id).slice(0, 6).map(g => `
<a href="${routeUrl(`genre/${g.id}`)}" class="sp2-genre-tile sp2-genre-tile--lg" style="--genre-color:${g.color}" aria-label="Explorar ${esc(g.name)}">
  <span class="sp2-genre-tile-media" style="background-image:url('${g.img}')"></span>
  <span class="sp2-genre-tile-name">${esc(g.name)}</span>
</a>`).join("")}
      </div>
    </section>
  </div>
</div>`;
}

/* ═══════════════════════════════════════════════════
   CANCIONES QUE TE GUSTAN
═══════════════════════════════════════════════════ */
function renderLiked() {
  const songs = [...Player.liked].map(id => DB.song(id)).filter(Boolean);
  const totalSec = songs.reduce((a, s) => a + (s.duration || 0), 0);

  return `
<div class="sp2-detail-page">
  ${detailHeroHtml({ kind: "Playlist", name: "Canciones que te gustan",
    meta: `<span class="font-bold text-white">Matyaz Paredes</span>
           <span class="text-white/50">·</span>
           <span>${songs.length} canciones, ${fmtTime(totalSec)}</span>`,
    extra: "Todos los temas que guardaste con el corazón." })}
  ${songs.length
    ? `${actionBarHtml("liked", "liked")}${songTableHtml(songs, { queueType: "liked", queueId: "liked" })}`
    : `<div class="flex flex-col items-center justify-center px-6 py-20 text-center">
        <span class="mb-4 text-6xl">${icon("heart")}</span>
        <h2 class="mb-2 text-2xl font-black text-white">Canciones que te gustan</h2>
        <p class="max-w-sm text-[#a7a7a7]">Guarda canciones tocando el corazón. Aquí encontrarás todos tus favoritos.</p>
        <a href="index.html" class="mt-6 rounded-full bg-white px-6 py-3 text-sm font-black text-black transition hover:bg-white/90">Descubrir música</a>
      </div>`}
</div>`;
}

/* ═══════════════════════════════════════════════════
   BIBLIOTECA
═══════════════════════════════════════════════════ */
const libState = { filter: "all", query: "" };

function libraryItems() {
  const saved = new Set(Store.get("savedAlbums") || []);
  const savedArtists = new Set(Store.get("savedArtists") || []);
  const items = [];

  items.push({ type: "liked", id: "liked", name: "Canciones que te gustan", sub: "Playlist · " + Player.liked.size + " canciones", img: null });

  DB.userPlaylists.forEach(p => items.push({ type: "playlist", id: p.id, name: p.name, sub: "Playlist · " + (p.songIds?.length || 0) + " canciones", img: p.img, item: p }));
  DB.playlists.slice(0, 8).forEach(p => items.push({ type: "playlist", id: p.id, name: p.name, sub: "Playlist · " + p.owner, img: p.img, item: p }));
  DB.albums.filter(a => saved.has(a.id)).forEach(a => items.push({ type: "album", id: a.id, name: a.title, sub: `Álbum · ${DB.artist(a.artistId)?.name || ""}`, img: a.img, item: a }));
  DB.artists.filter(a => savedArtists.has(a.id)).forEach(a => items.push({ type: "artist", id: a.id, name: a.name, sub: "Artista", img: a.img, item: a }));

  return items;
}

function libraryRowsHtml() {
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const nq = norm(libState.query);
  const filtered = libraryItems().filter(it => {
    if (libState.filter !== "all" && it.type !== libState.filter && !(libState.filter === "playlist" && it.type === "liked")) return false;
    if (nq && !norm(`${it.name} ${it.sub}`).includes(nq)) return false;
    return true;
  });

  if (!filtered.length) {
    return `<div class="flex flex-col items-center justify-center py-16 text-center">
      <span class="mb-4 text-5xl">🎧</span>
      <h3 class="text-xl font-black text-white">Nada aquí aún</h3>
      <p class="mt-1 max-w-xs text-sm text-[#a7a7a7]">Guarda álbumes, sigue artistas o crea playlists para llenar tu biblioteca.</p>
    </div>`;
  }

  return filtered.map(it => {
    const bg = it.img ? `background-image:url('${it.img}');background-size:cover;background-position:center` : "background:linear-gradient(135deg,#333,#111)";
    const round = it.type === "artist" ? "rounded-full" : "rounded-md";
    const href = it.type === "liked" ? routeUrl("liked/liked") : routeUrl(`${it.type}/${it.id}`);
    const isActive = Player.context.id === it.id || (it.type === "liked" && Player.context.type === "liked");
    return `
<article class="sp2-library-row group relative flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/[0.07] ${isActive ? "bg-white/[0.05]" : ""}">
  <a class="absolute inset-0 z-0 rounded-lg" href="${href}" aria-label="Abrir ${esc(it.name)}"></a>
  <span class="relative z-10 h-14 w-14 shrink-0 overflow-hidden ${round} pointer-events-none" style="${bg}"></span>
  <div class="relative z-10 min-w-0 flex-1 pointer-events-none">
    <p class="truncate text-sm font-bold leading-tight ${isActive ? "text-[#1ed760]" : "text-white"}">${esc(it.name)}</p>
    <p class="mt-0.5 truncate text-xs text-[#a7a7a7]">${esc(it.sub)}</p>
  </div>
  <button class="sp2-row-play-btn relative z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[#1ed760] text-black shadow transition-transform hover:scale-110"
    data-collection-play="${it.type === "liked" ? "liked:liked" : `${it.type}:${it.id}`}" aria-label="Reproducir ${esc(it.name)}">
    <span class="ml-0.5 flex h-4 w-4 items-center justify-center text-[16px]">${icon("play")}</span>
  </button>
</article>`;
  }).join("");
}

function renderLibrary() {
  const all = libraryItems();
  const chips = [["all", "Todas"], ["playlist", "Playlists"], ["album", "Álbumes"], ["artist", "Artistas"]]
    .map(([val, lbl]) => {
      const on = libState.filter === val;
      return `<button type="button" class="sp2-filter-chip ${on ? "active" : ""}" data-lib-filter-page="${val}" aria-pressed="${on}">${lbl}</button>`;
    }).join("");

  return `
<div class="sp2-page px-4 pb-12 pt-4 sm:px-6 lg:px-8">
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p class="sp2-eyebrow">Tu colección</p>
      <h1 class="text-3xl font-black text-white">Tu biblioteca</h1>
      <p id="sp2-library-count" class="mt-1 text-sm text-[#a7a7a7]">${all.length} elementos</p>
    </div>
    <button type="button" class="sp2-primary-btn self-start" data-create-playlist>
      ${icon("plus")} Crear playlist
    </button>
  </div>

  <div class="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar biblioteca">${chips}</div>

  <div class="mb-5 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5">
    <span class="text-[16px] text-[#a7a7a7]">${icon("search")}</span>
    <input id="sp2-lib-search" type="search" placeholder="Buscar en tu biblioteca" value="${esc(libState.query)}"
      aria-label="Buscar en tu biblioteca"
      class="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-[#a7a7a7] focus:outline-none"/>
  </div>

  <div id="sp2-library-results" class="flex flex-col gap-1">${libraryRowsHtml()}</div>
</div>`;
}

/* ═══════════════════════════════════════════════════
   EXPLORAR
═══════════════════════════════════════════════════ */
function renderExplore() {
  const newAlbums = [...DB.albums].sort((a, b) => b.year - a.year).slice(0, 6);
  const featuredPlaylists = DB.playlists.slice(0, 6);
  const artists = DB.artists.slice(0, 6);

  const moods = [
    { name: "Para entrenar", desc: "Energía al máximo", id: "pl-fitness", color: "#e8115b" },
    { name: "Modo focus", desc: "Concéntrate sin distracciones", id: "pl-lofi", color: "#1e3264" },
    { name: "Fiesta latina", desc: "Reggaeton y urbano", id: "pl-ferxxo", color: "#e61e32" },
    { name: "Nostalgia", desc: "Para recordar viejos tiempos", id: "pl-sad", color: "#537aa1" },
    { name: "Rock chileno", desc: "Lo mejor de casa", id: "pl-rockcl", color: "#ba5d07" },
    { name: "Indie acústico", desc: "Guitarras y calma", id: "pl-indie", color: "#8d67ab" },
  ];

  return `
<div class="sp2-page px-4 pb-12 pt-5 sm:px-6 lg:px-8">
  <header class="sp2-explore-hero mb-9">
    <div class="relative z-10">
      <p class="sp2-eyebrow">Descubrir</p>
      <h1 class="mt-1 text-3xl font-black text-white sm:text-4xl">Explora música nueva</h1>
      <p class="mt-3 max-w-xl text-sm text-white/70 sm:text-base">Géneros, lanzamientos recientes, artistas para descubrir y playlists para cada momento. Todo listo para reproducir.</p>
      <a href="buscar.html" class="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-black transition hover:scale-105">
        ${icon("search")} Buscar algo específico
      </a>
    </div>
  </header>

  <section class="mb-10">
    ${sectionHeader("Explora por género")}
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      ${DB.genres.map(g => `
<a href="${routeUrl(`genre/${g.id}`)}" class="sp2-genre-tile sp2-genre-tile--lg" style="--genre-color:${g.color}" aria-label="Explorar ${esc(g.name)}">
  <span class="sp2-genre-tile-media" style="background-image:url('${g.img}')"></span>
  <span class="sp2-genre-tile-name">${esc(g.name)}</span>
</a>`).join("")}
    </div>
  </section>

  <section class="mb-10">
    ${sectionHeader("Nuevos lanzamientos")}
    ${cardGrid(newAlbums.map(a => cardHtml({
      type: "album", item: a, subtext: `${DB.artist(a.artistId)?.name || ""} · ${a.year}`,
    })).join(""))}
  </section>

  <section class="mb-10">
    ${sectionHeader("Playlists para cada momento")}
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      ${moods.map(m => `
<a href="${routeUrl(`playlist/${m.id}`)}" class="sp2-mood-tile" style="--mood-color:${m.color}">
  <span class="sp2-mood-tile-icon">${icon("queue")}</span>
  <span class="min-w-0">
    <span class="block truncate text-base font-black text-white">${esc(m.name)}</span>
    <span class="block truncate text-xs text-white/70">${esc(m.desc)}</span>
  </span>
  <span class="ml-auto text-[20px] text-white/70">${icon("chevron-right")}</span>
</a>`).join("")}
    </div>
  </section>

  <section class="mb-10">
    ${sectionHeader("Playlists destacadas", "library")}
    ${cardGrid(featuredPlaylists.map(p => cardHtml({
      type: "playlist", item: p, subtext: p.desc?.substring(0, 48) || "Playlist",
    })).join(""))}
  </section>

  <section>
    ${sectionHeader("Artistas para descubrir")}
    ${cardGrid(artists.map(a => cardHtml({ type: "artist", item: a, subtext: "Artista", round: true })).join(""))}
  </section>
</div>`;
}

/* ═══════════════════════════════════════════════════
   ACERCA DE
═══════════════════════════════════════════════════ */
function renderAbout() {
  const pages = [
    ["index.html", "Inicio", "Recomendaciones, accesos rápidos y canciones del momento.", "home"],
    ["buscar.html", "Buscar", "Búsqueda en vivo con filtros por canción, artista, álbum y playlist.", "search"],
    ["biblioteca.html", "Biblioteca", "Playlists, álbumes guardados y artistas que sigues.", "library"],
    ["explorar.html", "Explorar", "Géneros, novedades, moods y artistas para descubrir.", "globe"],
    ["premium.html", "Premium", "Planes simulados con facturación mensual y anual.", "premium"],
    ["cuenta.html", "Cuenta", "Perfil, preferencias y estadísticas de uso.", "user"],
    ["acerca.html", "Acerca de", "Objetivo, tecnologías y alcance del proyecto académico.", "info"],
  ];

  const tech = [
    ["HTML5 semántico", "Estructura con header, nav, main, section, article y footer."],
    ["Tailwind CSS 4", "Utilidades compiladas localmente con @tailwindcss/cli."],
    ["JavaScript vanilla", "Vistas, eventos, búsqueda, filtros y reproductor simulado."],
    ["LocalStorage", "Persistencia de likes, playlists, preferencias y estado del reproductor."],
  ];

  const features = [
    "Reproductor simulado con play/pause, siguiente, anterior, aleatorio, repetición y volumen.",
    "Barra de progreso interactiva y reproducción a pantalla completa en móvil.",
    "Búsqueda con filtros y navegación real entre páginas HTML.",
    "Creación de playlists, guardado de álbumes y seguimiento de artistas.",
    "Menús de notificaciones, perfil, dispositivos y cola de reproducción.",
    "Diseño responsive probado en móvil, tablet y escritorio.",
  ];

  return `
<div class="sp2-page px-4 pb-16 pt-5 sm:px-6 lg:px-8">
  <header class="sp2-about-hero mb-10">
    <span class="sp2-about-logo">${icon("logo")}</span>
    <div class="relative z-10 min-w-0">
      <p class="sp2-eyebrow">Proyecto académico · RA2</p>
      <h1 class="mt-1 text-3xl font-black text-white sm:text-5xl">Spotify Clone</h1>
      <p class="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
        Réplica visual e interactiva de Spotify Web construida con HTML, Tailwind CSS 4 y JavaScript vanilla.
        El objetivo es demostrar estructura multipágina, diseño responsive, accesibilidad básica e interacciones
        reales sin backend ni servicios de reproducción reales.
      </p>
      <div class="mt-5 flex flex-wrap gap-3">
        <a href="index.html" class="rounded-full bg-[#1ed760] px-5 py-2.5 text-sm font-black text-black transition hover:scale-105">Empezar a escuchar</a>
        <a href="explorar.html" class="rounded-full border border-white/30 px-5 py-2.5 text-sm font-bold text-white transition hover:border-white">Explorar el catálogo</a>
      </div>
    </div>
  </header>

  <section class="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
    <article class="sp2-about-card">
      <span class="sp2-about-card-icon text-[#1ed760]">${icon("info")}</span>
      <h2>Objetivo</h2>
      <p>Construir una experiencia tipo Spotify con cinco o más páginas reales, navegación coherente y un reproductor simulado que responda a las acciones del usuario.</p>
    </article>
    <article class="sp2-about-card">
      <span class="sp2-about-card-icon text-[#1ed760]">${icon("settings")}</span>
      <h2>Tecnologías</h2>
      <p>HTML semántico, Tailwind CSS 4 compilado, JavaScript vanilla, LocalStorage y recursos locales. Sin frameworks de UI ni backend.</p>
    </article>
    <article class="sp2-about-card">
      <span class="sp2-about-card-icon text-[#1ed760]">${icon("verified")}</span>
      <h2>Alcance</h2>
      <p>Demo educativa. No hay autenticación real, pagos, cuentas oficiales ni uso de la API de Spotify. Los precios y la letra son simulados.</p>
    </article>
  </section>

  <div class="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_.95fr]">
    <section>
      <h2 class="sp2-about-section-title">Páginas del proyecto</h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        ${pages.map(([href, name, desc, ico]) => `
<a href="${href}" class="sp2-about-page-link">
  <span class="sp2-about-page-icon">${icon(ico)}</span>
  <span class="min-w-0">
    <span class="block truncate text-sm font-black text-white">${name}</span>
    <span class="block text-xs leading-snug text-[#a7a7a7]">${desc}</span>
  </span>
</a>`).join("")}
      </div>
    </section>

    <section>
      <h2 class="sp2-about-section-title">Funcionalidades</h2>
      <ul class="sp2-about-list">
        ${features.map(f => `<li><span class="text-[#1ed760]">${icon("check")}</span><span>${f}</span></li>`).join("")}
      </ul>
    </section>
  </div>

  <section class="mt-10">
    <h2 class="sp2-about-section-title">Stack y decisiones técnicas</h2>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      ${tech.map(([title, desc]) => `
<article class="sp2-about-card">
  <h3>${title}</h3>
  <p>${desc}</p>
</article>`).join("")}
    </div>
  </section>

  <section class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
    <article class="sp2-about-card">
      <h2>Autor</h2>
      <p><strong class="text-white">Matyaz Paredes</strong><br/>Estudiante de la Universidad de Los Lagos.<br/>Proyecto de evaluación RA2.</p>
    </article>
    <article class="sp2-about-card">
      <h2>Cómo probar</h2>
      <ol class="sp2-about-steps">
        <li>Entra a Inicio y reproduce una canción.</li>
        <li>Cambia de página y comprueba que el estado se mantiene.</li>
        <li>Busca, filtra, guarda un álbum y crea una playlist.</li>
        <li>Prueba la vista móvil, la cola y la pantalla completa.</li>
      </ol>
    </article>
  </section>

  <footer class="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-xs leading-relaxed text-[#a7a7a7]">
    Spotify Clone es un proyecto educativo sin fines comerciales. Las marcas, portadas y nombres de artistas pertenecen a sus respectivos dueños.
    Este sitio no reproduce audio real ni solicita credenciales.
  </footer>
</div>`;
}

/* ═══════════════════════════════════════════════════
   PREMIUM
═══════════════════════════════════════════════════ */
function renderPremium() {
  const currentPlan = Store.get("plan") || "free";
  const billing = Store.get("billing") || "monthly";

  const cards = DB.plans.map(p => {
    const active = currentPlan === p.id;
    const price = billing === "annual" ? p.price * 10 : p.price;
    return `
<article class="relative flex flex-col overflow-hidden rounded-2xl border ${active ? "border-[#1ed760]" : "border-white/10"} bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.07]">
  ${active ? `<span class="absolute right-3 top-3 rounded-full bg-[#1ed760] px-2 py-0.5 text-[10px] font-black uppercase text-black">Tu plan</span>` : ""}
  <h3 class="text-lg font-black text-white">${esc(p.name)}</h3>
  <p class="mb-4 mt-1 text-xs text-[#a7a7a7]">${esc(p.desc)}</p>
  <div class="mt-auto">
    <p class="mb-1 text-3xl font-black text-white">$${price.toLocaleString("es-CL")}
      <span class="text-sm font-medium text-[#a7a7a7]">/ ${billing === "annual" ? "año" : "mes"}</span></p>
    <ul class="mb-5 mt-3 space-y-1.5">
      ${p.features.map(f => `<li class="flex items-center gap-2 text-xs text-[#a7a7a7]"><span class="text-[14px] text-[#1ed760]">${icon("check")}</span>${esc(f)}</li>`).join("")}
    </ul>
    <button type="button" data-choose-plan="${p.id}" ${active ? "disabled" : ""}
      class="w-full rounded-full py-3 text-sm font-black transition-all ${active ? "cursor-default bg-white/10 text-white" : "bg-[#1ed760] text-black hover:scale-[1.02] hover:bg-[#3be477]"}">
      ${active ? "Plan actual" : "Elegir plan"}
    </button>
  </div>
</article>`;
  }).join("");

  const faqs = [
    ["¿Los pagos son reales?", "No. Todos los planes, precios y botones son simulados para la demostración académica."],
    ["¿Puedo volver al plan Free?", "Sí. Usa el botón “Volver al plan Free” al final de la página o cambia de plan desde Cuenta."],
    ["¿Qué incluye Premium en esta demo?", "Solo cambia el estado visual del perfil y las insignias. No se desbloquea audio real ni contenido adicional."],
  ];

  return `
<div class="sp2-page px-4 pb-16 pt-2 sm:px-6 lg:px-8">
  <header class="relative mb-10 mt-2 overflow-hidden rounded-2xl px-6 py-12 text-center sm:px-8 sm:py-14" style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 40%,#0f3460 70%,#1ed760 130%)">
    <div class="absolute inset-0 opacity-10" style="background-image:repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%);background-size:20px 20px"></div>
    <div class="relative">
      <span class="mb-4 block text-5xl">${icon("logo")}</span>
      <h1 class="mb-2 text-3xl font-black text-white sm:text-5xl">Spotify Premium</h1>
      <p class="mb-6 text-base text-white/70 sm:text-lg">Música sin límites, sin anuncios, en todos tus dispositivos.</p>
      <div class="inline-flex gap-1 rounded-full bg-black/30 p-1" role="group" aria-label="Periodicidad de facturación">
        <button type="button" data-billing="monthly" class="sp2-billing-tab ${billing === "monthly" ? "active" : ""}" aria-pressed="${billing === "monthly"}">Mensual</button>
        <button type="button" data-billing="annual" class="sp2-billing-tab ${billing === "annual" ? "active" : ""}" aria-pressed="${billing === "annual"}">Anual <span class="ml-1 text-xs font-black text-[#1ed760]">-17%</span></button>
      </div>
    </div>
  </header>

  <div class="mb-6 flex flex-col gap-2 rounded-xl border border-[#1ed760]/20 bg-[#1ed760]/10 px-4 py-3 text-sm text-[#b7f5cb] sm:flex-row sm:items-center sm:justify-between">
    <span>${icon("info")} Demo académica: los planes y precios son simulados. No se realizan cobros.</span>
    ${currentPlan !== "free" ? `<button type="button" data-choose-plan="free" class="self-start text-xs font-black uppercase tracking-wider text-white underline-offset-4 hover:underline sm:self-auto">Volver al plan Free</button>` : ""}
  </div>

  <div class="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
    ${cards}
  </div>

  <section class="mb-10 rounded-2xl bg-white/[0.04] p-6 sm:p-8">
    <h2 class="mb-6 text-2xl font-black text-white">¿Por qué Premium?</h2>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      ${[
        ["🚫", "Sin anuncios", "Escucha sin interrupciones. La música fluye sin cortes."],
        ["📥", "Descargas", "Lleva tu música a donde vayas, sin internet."],
        ["🎵", "Calidad máxima", "Audio de 320 kbps. Escucha cada detalle."],
        ["⏭️", "Saltos ilimitados", "Salta cuantas canciones quieras, cuando quieras."],
      ].map(([em, t, d]) => `<div class="flex flex-col gap-2">
        <span class="text-3xl">${em}</span>
        <h3 class="text-base font-black text-white">${t}</h3>
        <p class="text-sm text-[#a7a7a7]">${d}</p>
      </div>`).join("")}
    </div>
  </section>

  <section class="mx-auto max-w-3xl">
    <h2 class="mb-4 text-2xl font-black text-white">Preguntas frecuentes</h2>
    <div class="space-y-2">
      ${faqs.map(([q, a]) => `<details class="sp2-faq">
        <summary>${q}</summary>
        <p>${a}</p>
      </details>`).join("")}
    </div>
  </section>
</div>`;
}

/* ═══════════════════════════════════════════════════
   CUENTA
═══════════════════════════════════════════════════ */
function renderAccount() {
  const plan = Store.get("plan") || "free";
  const planName = plan === "free" ? "Free" : (DB.plan(plan)?.name || "Premium");
  const settings = Store.get("settings") || {};

  const rows = [
    ["quality", "Calidad de audio", "select", ["Normal", "Alta", "Muy alta", "Sin pérdida"], settings.quality || "Alta"],
    ["autoplay", "Reproducción automática", "checkbox", null, settings.autoplay !== false],
    ["crossfade", "Crossfade", "checkbox", null, settings.crossfade || false],
    ["normalize", "Normalizar volumen", "checkbox", null, settings.normalize !== false],
  ].map(([key, label, type, opts, val]) => `
<div class="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 last:border-0">
  <div>
    <p class="text-sm font-semibold text-white">${label}</p>
    <p class="mt-0.5 text-xs text-[#a7a7a7]">${type === "checkbox" ? "Se guarda en este navegador" : "Aplica al reproductor simulado"}</p>
  </div>
  ${type === "checkbox"
    ? `<label class="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" class="peer sr-only" ${val ? "checked" : ""} data-setting="${key}" aria-label="${label}">
        <span class="sp2-switch"></span>
      </label>`
    : `<select data-setting="${key}" aria-label="${label}" class="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white focus:border-white/40 focus:outline-none">
        ${opts.map(o => `<option ${o === val ? "selected" : ""}>${o}</option>`).join("")}
      </select>`}
</div>`).join("");

  return `
<div class="sp2-page mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
  <p class="sp2-eyebrow">Perfil</p>
  <h1 class="mb-8 text-3xl font-black text-white">Cuenta</h1>

  <section class="mb-6 flex flex-col items-center gap-5 rounded-2xl bg-white/[0.06] p-6 text-center sm:flex-row sm:text-left">
    <div class="sp2-avatar-lg">MP</div>
    <div class="min-w-0 flex-1">
      <h2 class="text-xl font-black text-white">Matyaz Paredes</h2>
      <p class="mt-0.5 text-sm text-[#a7a7a7]">matyaz@estudiante.ulagos.cl</p>
      <span class="mt-2 inline-flex items-center gap-1 rounded-full ${plan === "free" ? "bg-white/10 text-[#a7a7a7]" : "bg-[#1ed760]/20 text-[#1ed760]"} px-3 py-1 text-xs font-bold">
        ${plan !== "free" ? icon("premium") : ""} ${esc(planName)}
      </span>
    </div>
    <a href="premium.html" class="shrink-0 rounded-full border border-white/30 px-4 py-2 text-sm font-bold text-white transition hover:border-white">
      ${plan === "free" ? "Ir a Premium" : "Ver plan"}
    </a>
  </section>

  <section class="mb-6 overflow-hidden rounded-2xl bg-white/[0.06]">
    <div class="border-b border-white/10 px-5 py-4">
      <h2 class="font-black text-white">Preferencias</h2>
      <p class="mt-0.5 text-xs text-[#a7a7a7]">Los cambios se guardan automáticamente.</p>
    </div>
    ${rows}
  </section>

  <section class="mb-6 grid grid-cols-3 gap-3">
    ${[
      [Player.liked.size, "Te gustan"],
      [DB.userPlaylists.length, "Playlists"],
      [(Store.get("savedAlbums") || []).length, "Álbumes"],
    ].map(([n, l]) => `<div class="rounded-xl bg-white/[0.06] p-4 text-center">
      <p class="text-3xl font-black text-white">${n}</p>
      <p class="mt-1 text-xs text-[#a7a7a7]">${l}</p>
    </div>`).join("")}
  </section>

  <section class="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
    <h2 class="text-sm font-black text-white">Privacidad y alcance</h2>
    <p class="mt-1 text-xs leading-relaxed text-[#a7a7a7]">Esta cuenta es simulada. No hay autenticación real ni envío de datos a servidores. La información de preferencias, likes y playlists se guarda solo en el LocalStorage de este navegador.</p>
  </section>

  <button type="button" data-action="logout"
    class="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:border-white">
    ${icon("logout")} Cerrar sesión (demo)
  </button>
</div>`;
}

/* ═══════════════════════════════════════════════════
   COLA DE REPRODUCCIÓN
═══════════════════════════════════════════════════ */
function renderQueuePanel(tab = "queue") {
  const content = document.getElementById("sp2-queue-content");
  if (!content) return;

  document.querySelectorAll(".sp2-queue-tab").forEach(btn => {
    const on = btn.getAttribute("data-queue-tab") === tab;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-selected", on ? "true" : "false");
  });

  if (tab === "lyrics") {
    const song = Player.song;
    if (!song) {
      content.innerHTML = `<div class="flex h-40 flex-col items-center justify-center gap-3 px-6 text-center text-sm text-[#a7a7a7]">${icon("lyrics")}<p>Reproduce algo para ver la letra</p></div>`;
      return;
    }
    const lines = [
      "Se encienden las luces de la ciudad,", "y tu nombre suena en la radio otra vez.",
      "No sé si es el ritmo o la soledad,", "pero esta noche no pienso volver.",
      "", "Y bailamos bajo la lluvia,", "como si el mundo no existiera.",
      "Cada latido es una excusa", "para quedarnos hasta que amanezca.",
      "", "No me digas que es el final,", "que la noche apenas empieza.",
      "Tu voz se mezcla con el beat", "y todo lo demás se congela.",
    ];
    const chorus = new Set([5, 6, 7, 8, 12, 13]);
    content.innerHTML = `<div class="px-4 pb-8 pt-2">
      <p class="mb-4 rounded-lg bg-white/[0.04] p-3 text-[10px] leading-relaxed text-[#a7a7a7]">Letra simulada con fines visuales.</p>
      ${lines.map((l, i) => l
        ? `<p class="mb-3 text-[15px] font-semibold leading-snug ${chorus.has(i) ? "text-white" : "text-white/50"}">${esc(l)}</p>`
        : `<div class="mb-3"></div>`).join("")}
    </div>`;
    return;
  }

  const cur = Player.song;
  if (!cur) {
    content.innerHTML = `<div class="flex h-40 flex-col items-center justify-center gap-3 px-6 text-center text-sm text-[#a7a7a7]">${icon("queue")}<p>La cola está vacía</p></div>`;
    return;
  }
  const curAlbum = DB.album(cur.albumId);
  const upcoming = Player.queue.slice(Player.index + 1).map(sid => DB.song(sid)).filter(Boolean);

  content.innerHTML = `<div class="px-3 pb-8">
    <p class="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-[#a7a7a7]">Sonando ahora</p>
    <div class="mb-5 flex items-center gap-3 rounded-xl bg-white/10 p-3">
      <span class="h-12 w-12 shrink-0 rounded bg-cover bg-center shadow" style="${coverBg(curAlbum || {}, "album")}"></span>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold text-[#1ed760]">${esc(cur.title)}</p>
        <p class="truncate text-xs text-[#a7a7a7]">${esc(DB.artist(cur.artistId)?.name || "")}</p>
      </div>
    </div>
    <p class="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-[#a7a7a7]">A continuación</p>
    ${upcoming.length ? upcoming.slice(0, 20).map(s => {
      const al = DB.album(s.albumId);
      return `<button type="button" class="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white/[0.07]" data-queue-play="${s.id}">
        <span class="h-10 w-10 shrink-0 rounded bg-cover bg-center" style="${coverBg(al || {}, "album")}"></span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-medium text-white">${esc(s.title)}</span>
          <span class="block truncate text-xs text-[#a7a7a7]">${esc(DB.artist(s.artistId)?.name || "")}</span>
        </span>
        <span class="text-xs tabular-nums text-[#a7a7a7]">${fmtTime(s.duration)}</span>
      </button>`;
    }).join("") : `<p class="px-1 py-3 text-xs text-[#a7a7a7]">No hay más canciones en la cola.</p>`}
  </div>`;
}

/* ═══════════════════════════════════════════════════
   404
═══════════════════════════════════════════════════ */
function renderNotFound(what) {
  return `
<div class="sp2-page flex flex-col items-center justify-center px-6 py-24 text-center">
  <span class="mb-4 text-6xl">😵</span>
  <h1 class="mb-2 text-3xl font-black text-white">No encontrado</h1>
  <p class="mb-6 max-w-xs text-[#a7a7a7]">No encontramos ${esc(what)} en el catálogo.</p>
  <div class="flex flex-wrap justify-center gap-3">
    <a href="index.html" class="rounded-full bg-white px-6 py-3 text-sm font-black text-black transition hover:bg-white/90">Inicio</a>
    <a href="buscar.html" class="rounded-full border border-white/30 px-6 py-3 text-sm font-black text-white transition hover:border-white">Buscar</a>
  </div>
</div>`;
}
