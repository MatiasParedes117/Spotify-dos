/* =====================================================================
 * Spotify-dos — Vistas (renderizado de páginas)
 * ================================================================== */

/* ═══════════════════════════════════════════════════
   HOME
═══════════════════════════════════════════════════ */
function renderHome() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  // Quick access grid (últimos reproducidos)
  const recentItems = DB.homeSections[0]?.items || [];
  const quickGrid = recentItems.slice(0, 6).map(it => {
    let obj, lnk, bg;
    if (it.type === "album")    { obj = DB.album(it.id);    lnk = `album/${it.id}`;    bg = coverBg(obj, "album"); }
    else if (it.type === "playlist"){ obj = DB.playlist(it.id); lnk = `playlist/${it.id}`; bg = coverBg(obj, "playlist"); }
    else                        { obj = DB.artist(it.id);   lnk = `artist/${it.id}`;   bg = coverBg(obj, "artist"); }
    if (!obj) return "";
    const name = esc(it.type === "album" ? obj.title : obj.name);
    const isActive = Player.context.id === it.id;
    return `
<article class="group relative flex items-center gap-3 rounded-md overflow-hidden cursor-pointer transition-all hover:bg-white/[0.12] bg-white/[0.07] ${isActive ? "ring-1 ring-[#1ed760]/40" : ""}"
  data-link="${lnk}" data-card="${it.type}:${it.id}">
  <span class="h-16 w-16 shrink-0 bg-cover bg-center" style="${bg}"></span>
  <span class="pr-3 text-sm font-bold text-white leading-tight truncate flex-1">${name}</span>
  <button class="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-xl opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
    data-collection-play="${it.type}:${it.id}" aria-label="Reproducir" tabindex="-1">
    <span class="ml-0.5 flex h-5 w-5 items-center justify-center text-[18px]">${icon(isActive && Player.playing ? "pause" : "play")}</span>
  </button>
</article>`;
  }).join("");

  // Trending chart
  const trendSongs = (DB.homeTrending?.songIds || []).slice(0, 5).map((sid, i) => {
    const song = DB.song(sid); if (!song) return "";
    const album = DB.album(song.albumId);
    const artist = DB.artist(song.artistId);
    const isActive = Player.song?.id === sid;
    return `
<div class="group flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-white/[0.07] cursor-pointer ${isActive ? "bg-white/[0.05]" : ""}"
  data-play-song="${sid}" data-queue-type="playlist" data-queue-id="pl-topglobal">
  <span class="w-6 text-center text-sm tabular-nums ${isActive ? "text-[#1ed760]" : "text-[#a7a7a7]"}">${isActive && Player.playing ? `<span class="text-[14px]">${icon("volume-low")}</span>` : i + 1}</span>
  <span class="h-11 w-11 shrink-0 rounded bg-cover bg-center shadow-sm" style="${coverBg(album||{}, "album")}"></span>
  <div class="min-w-0 flex-1">
    <p class="truncate text-sm font-semibold leading-tight ${isActive ? "text-[#1ed760]" : "text-white"}">${esc(song.title)}</p>
    <p class="truncate text-xs text-[#a7a7a7]">${esc(artist?.name||"")}</p>
  </div>
  <span class="text-xs tabular-nums text-[#a7a7a7] ml-2">${fmtTime(song.duration)}</span>
  <button class="opacity-0 group-hover:opacity-100 ${Player.liked.has(sid) ? "!opacity-100 text-[#1ed760]" : "text-[#a7a7a7] hover:text-white"} transition ml-1" data-like="${sid}">
    <span class="text-[15px]">${icon(Player.liked.has(sid) ? "heart" : "heart-outline")}</span>
  </button>
</div>`;
  }).join("");

  // Content sections
  const sections = DB.homeSections.slice(1).map(sec => {
    const cards = sec.items.slice(0, 6).map(it => {
      let obj, sub;
      if (it.type === "artist")   { obj = DB.artist(it.id);   sub = "Artista"; }
      else if (it.type === "album")    { obj = DB.album(it.id);    sub = `Álbum · ${DB.artist(obj?.artistId)?.name || ""}`; }
      else { obj = DB.playlist(it.id); sub = obj?.desc?.substring(0, 50) || "Playlist"; }
      if (!obj) return "";
      return cardHtml({ type: it.type, item: obj, subtext: sub, round: it.type === "artist" });
    }).join("");
    return `<section class="mb-8">
      ${sectionHeader(sec.title)}
      ${cardGrid(cards)}
    </section>`;
  }).join("");

  return `
<main class="px-4 pb-12 sm:px-6 lg:px-8">
  <!-- Greeting -->
  <div class="flex items-center justify-between pt-6 pb-5">
    <h1 class="text-2xl sm:text-3xl font-black text-white">${greeting}</h1>
  </div>

  <!-- Quick access grid -->
  <div class="mb-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
    ${quickGrid || "<p class='text-[#a7a7a7] text-sm'>Empieza a reproducir algo</p>"}
  </div>

  <!-- Trending -->
  <section class="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div>
      ${sectionHeader("Canciones del momento", "playlist/pl-topglobal")}
      ${trendSongs}
    </div>
    <div>
      ${sectionHeader("Géneros populares")}
      <div class="grid grid-cols-3 gap-2">
        ${DB.genres.slice(0, 6).map(g => `
<a href="#/genre/${g.id}" class="relative h-20 overflow-hidden rounded-lg cursor-pointer transition-transform hover:scale-[1.02] active:scale-[.98]" data-link="genre/${g.id}">
  <div class="absolute inset-0 bg-cover bg-center" style="background-image:url('${g.img}')"></div>
  <div class="absolute inset-0 bg-gradient-to-br from-black/60 to-transparent"></div>
  <span class="absolute inset-x-2 top-2 text-sm font-black text-white drop-shadow leading-tight">${esc(g.name)}</span>
</a>`).join("")}
      </div>
    </div>
  </section>

  ${sections}
</main>`;
}

/* ═══════════════════════════════════════════════════
   SEARCH
═══════════════════════════════════════════════════ */
const searchState = { query: "", filter: "all" };

function renderSearch(q = "") {
  const results = q ? DB.search(q) : null;

  const genreGrid = `
<section class="mt-6">
  <h2 class="mb-4 text-xl font-black text-white">Busca por categoría</h2>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
    ${DB.genres.map(g => `
<a href="#/genre/${g.id}" class="relative h-28 overflow-hidden rounded-xl cursor-pointer transition-transform hover:scale-[1.03] active:scale-[.98]" data-link="genre/${g.id}">
  <div class="absolute inset-0 bg-cover bg-center" style="background-image:url('${g.img}')"></div>
  <div class="absolute inset-0" style="background:linear-gradient(to bottom right, ${g.color}dd, ${g.color}66)"></div>
  <span class="absolute inset-x-3 top-3 text-base font-black text-white drop-shadow-lg leading-tight">${esc(g.name)}</span>
</a>`).join("")}
  </div>
</section>`;

  if (!results) {
    return `<main class="px-4 pb-12 pt-5 sm:px-6 lg:px-8">
      <div class="relative mb-5">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#a7a7a7] text-[18px]">${icon("search")}</span>
        <input id="sp2-search-input" type="search" placeholder="¿Qué quieres escuchar?"
          value="${esc(q)}"
          class="w-full rounded-full bg-white text-black placeholder:text-[#7a7a7a] pl-10 pr-5 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/40"/>
      </div>
      ${genreGrid}
    </main>`;
  }

  const { artists, albums, playlists, songs } = results;

  const topResult = artists[0] || albums[0] || playlists[0];
  let topHtml = "";
  if (topResult) {
    const isArtist = artists[0] === topResult;
    const isAlbum  = albums[0] === topResult;
    const type     = isArtist ? "artist" : isAlbum ? "album" : "playlist";
    const name     = type === "album" ? topResult.title : topResult.name;
    const sub      = isArtist ? "Artista" : isAlbum ? `Álbum · ${DB.artist(topResult.artistId)?.name||""}` : "Playlist";
    const img      = topResult.img;
    topHtml = `
<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.4fr]">
  <div>
    <h3 class="mb-3 text-base font-black text-white">Resultado principal</h3>
    <article class="group relative flex flex-col gap-3 rounded-2xl p-5 bg-white/[0.07] hover:bg-white/[0.12] cursor-pointer transition-colors"
      data-link="${type}/${topResult.id}" data-card="${type}:${topResult.id}">
      <div class="h-28 w-28 overflow-hidden ${isArtist ? "rounded-full" : "rounded-lg"} shadow-2xl">
        <div class="h-full w-full" style="${coverBg(topResult, type)}"></div>
      </div>
      <div>
        <p class="text-2xl font-black text-white leading-tight">${esc(name)}</p>
        <p class="mt-1 text-sm text-[#a7a7a7]">${esc(sub)}</p>
      </div>
      <button class="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 hover:scale-105"
        data-collection-play="${type}:${topResult.id}">
        <span class="ml-0.5 flex h-5 w-5 items-center justify-center text-[20px]">${icon("play")}</span>
      </button>
    </article>
  </div>
  ${songs.length ? `<div>
    <h3 class="mb-3 text-base font-black text-white">Canciones</h3>
    <div class="flex flex-col gap-1">
      ${songs.slice(0, 4).map((s, i) => songRowHtml(s, i, { showAlbum: false, queueType: "search", queueId: "search" })).join("")}
    </div>
  </div>` : ""}
</div>`;
  }

  const artistCards = artists.map(a => cardHtml({ type: "artist", item: a, subtext: "Artista", round: true })).join("");
  const albumCards  = albums.map(a  => cardHtml({ type: "album",  item: a, subtext: `Álbum · ${DB.artist(a.artistId)?.name||""}` })).join("");
  const plCards     = playlists.map(p=> cardHtml({ type: "playlist",item: p, subtext: p.desc?.substring(0,40)||"Playlist" })).join("");

  return `<main class="px-4 pb-12 pt-5 sm:px-6 lg:px-8">
    <div class="relative mb-5">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#a7a7a7] text-[18px]">${icon("search")}</span>
      <input id="sp2-search-input" type="search" placeholder="¿Qué quieres escuchar?"
        value="${esc(q)}"
        class="w-full rounded-full bg-white text-black placeholder:text-[#7a7a7a] pl-10 pr-5 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/40"/>
    </div>
    ${topHtml}
    ${artistCards ? `<section class="mb-6">${sectionHeader("Artistas")}${cardGrid(artistCards)}</section>` : ""}
    ${albumCards  ? `<section class="mb-6">${sectionHeader("Álbumes")}${cardGrid(albumCards)}</section>`  : ""}
    ${plCards     ? `<section class="mb-6">${sectionHeader("Playlists")}${cardGrid(plCards)}</section>`   : ""}
    ${!topResult && !songs.length ? `<p class="mt-10 text-center text-[#a7a7a7]">Sin resultados para "<strong class="text-white">${esc(q)}</strong>"</p>` : ""}
  </main>`;
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
<div>
  ${detailHeroHtml({ kind: "Playlist", name: pl.name, img: pl.img,
    meta: `<span class="font-semibold text-white">${esc(pl.owner)}</span>
           <span class="text-white/50">·</span>
           <span>${songs.length} canciones, ${fmtTime(totalSec)}</span>`,
    extra: esc(pl.desc || "") })}
  ${actionBarHtml("playlist", id, { custom: isUser })}
  ${songTableHtml(songs, { queueType: "playlist", queueId: id })}
</div>`;
}

/* ═══════════════════════════════════════════════════
   ÁLBUM
═══════════════════════════════════════════════════ */
function renderAlbum(id) {
  const alb = DB.album(id);
  if (!alb) return renderNotFound("el álbum");
  const artist = DB.artist(alb.artistId);
  const songs  = alb.songs.map(([sid]) => DB.song(sid)).filter(Boolean);
  const totalSec = songs.reduce((a, s) => a + (s.duration || 0), 0);

  return `
<div>
  ${detailHeroHtml({ kind: "Álbum", name: alb.title, img: alb.img,
    meta: `<a href="#/artist/${alb.artistId}" class="font-bold text-white hover:underline" data-link="artist/${alb.artistId}">${esc(artist?.name||"")}</a>
           <span class="text-white/50">·</span>
           <span>${alb.year}</span>
           <span class="text-white/50">·</span>
           <span>${songs.length} canciones, ${fmtTime(totalSec)}</span>` })}
  ${actionBarHtml("album", id, { saveAlbum: true })}
  ${songTableHtml(songs, { showAlbum: false, queueType: "album", queueId: id })}
  ${artist ? `<div class="px-4 pb-10 sm:px-8">
    <h3 class="mb-4 text-base font-black text-white">Sobre el artista</h3>
    <div class="flex items-center gap-4 rounded-xl bg-white/[0.05] p-4 cursor-pointer hover:bg-white/[0.08] transition-colors" data-link="artist/${artist.id}">
      <span class="h-20 w-20 shrink-0 rounded-full overflow-hidden shadow-lg" style="${coverBg(artist, "artist")}"></span>
      <div class="min-w-0">
        <p class="font-black text-white text-lg leading-tight">${esc(artist.name)}</p>
        <p class="text-xs text-[#a7a7a7] mt-1">${esc(artist.monthly)} oyentes mensuales</p>
        <p class="text-sm text-[#a7a7a7] mt-2 line-clamp-2">${esc(artist.bio||"")}</p>
      </div>
    </div>
  </div>` : ""}
</div>`;
}

/* ═══════════════════════════════════════════════════
   ARTISTA
═══════════════════════════════════════════════════ */
function renderArtist(id) {
  const artist = DB.artist(id);
  if (!artist) return renderNotFound("el artista");
  const albums  = DB.albums.filter(a => a.artistId === id);
  const allSongs = albums.flatMap(a => a.songs.map(([sid]) => DB.song(sid)).filter(Boolean));
  const popularSongs = allSongs.slice(0, 5);

  const albumCards = albums.map(a => cardHtml({
    type: "album", item: a,
    subtext: `${a.year} · Álbum`,
  })).join("");

  const relatedArtists = DB.artists
    .filter(a => a.id !== id)
    .slice(0, 6)
    .map(a => cardHtml({ type: "artist", item: a, subtext: "Artista", round: true })).join("");

  return `
<div>
  ${detailHeroHtml({ kind: "Artista", name: artist.name, img: artist.img,
    meta: `<span class="font-semibold">${icon("verified")} Artista verificado</span>
           <span class="text-white/50">·</span>
           <span>${artist.monthly} oyentes mensuales</span>`,
    extra: esc(artist.bio || ""),
    badge: artist.verified ? "Artista verificado" : "" })}
  ${actionBarHtml("artist", id, { follow: true })}

  <div class="px-4 pb-4 sm:px-8">
    <h2 class="mb-3 text-xl font-black text-white">Popular</h2>
    <div class="flex flex-col gap-1 mb-8">
      ${popularSongs.map((s, i) => songRowHtml(s, i, { showAlbum: false, queueType: "artist", queueId: id })).join("")}
    </div>

    <section class="mb-8">
      ${sectionHeader("Discografía", `search`)}
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
  const playlists = DB.playlists.slice(0, 10);
  const cards = playlists.map(p => cardHtml({ type: "playlist", item: p, subtext: p.desc?.substring(0, 40) })).join("");

  return `
<div>
  <div class="relative h-56 overflow-hidden" style="background-color:${genre.color}">
    <div class="absolute inset-0 bg-cover bg-center opacity-40" style="background-image:url('${genre.img}')"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-black/20 to-[#121212]"></div>
    <h1 class="absolute bottom-6 left-6 text-5xl sm:text-7xl font-black text-white drop-shadow-xl">${esc(genre.name)}</h1>
  </div>
  <main class="px-4 pb-12 pt-6 sm:px-6 lg:px-8">
    <section>${sectionHeader("Playlists populares")}${cardGrid(cards)}</section>
  </main>
</div>`;
}

/* ═══════════════════════════════════════════════════
   CANCIONES QUE TE GUSTAN
═══════════════════════════════════════════════════ */
function renderLiked() {
  const songs = [...Player.liked].map(id => DB.song(id)).filter(Boolean);
  const totalSec = songs.reduce((a, s) => a + (s.duration || 0), 0);

  return `
<div>
  ${detailHeroHtml({ kind: "Playlist", name: "Canciones que te gustan",
    meta: `<span class="font-bold text-white">Matyaz Paredes</span>
           <span class="text-white/50">·</span>
           <span>${songs.length} canciones, ${fmtTime(totalSec)}</span>` })}
  ${actionBarHtml("liked", "liked")}
  ${songs.length
    ? songTableHtml(songs, { queueType: "liked", queueId: "liked" })
    : `<div class="flex flex-col items-center justify-center py-20 text-center px-6">
        <span class="text-6xl mb-4">${icon("heart")}</span>
        <h3 class="text-2xl font-black text-white mb-2">Canciones que te gustan</h3>
        <p class="text-[#a7a7a7] max-w-sm">Guarda canciones tocando el corazón. Aquí encontrarás todos tus favoritos.</p>
      </div>`}
</div>`;
}

/* ═══════════════════════════════════════════════════
   BIBLIOTECA (móvil)
═══════════════════════════════════════════════════ */
const libState = { filter: "all", query: "" };

function libraryItems() {
  const saved = new Set(Store.get("savedAlbums") || []);
  const savedArtists = new Set(Store.get("savedArtists") || []);
  const items = [];

  items.push({ type: "liked", id: "liked", name: "Canciones que te gustan", sub: "Playlist · " + Player.liked.size + " canciones", img: null });

  DB.userPlaylists.forEach(p => items.push({ type: "playlist", id: p.id, name: p.name, sub: "Playlist · " + (p.songIds?.length || 0) + " canciones", img: p.img, item: p }));
  DB.playlists.slice(0, 5).forEach(p => items.push({ type: "playlist", id: p.id, name: p.name, sub: "Playlist · " + p.owner, img: p.img, item: p }));
  DB.albums.filter(a => saved.has(a.id)).forEach(a => items.push({ type: "album", id: a.id, name: a.title, sub: `Álbum · ${DB.artist(a.artistId)?.name||""}`, img: a.img, item: a }));
  DB.artists.filter(a => savedArtists.has(a.id)).forEach(a => items.push({ type: "artist", id: a.id, name: a.name, sub: "Artista", img: a.img, item: a }));

  return items;
}

function renderLibrary() {
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const nq = norm(libState.query);
  const all = libraryItems();
  const filtered = all.filter(it => {
    if (libState.filter !== "all" && it.type !== libState.filter && !(libState.filter === "playlist" && it.type === "liked")) return false;
    if (nq && !norm(`${it.name} ${it.sub}`).includes(nq)) return false;
    return true;
  });

  const chips = [["all","Todas"],["playlist","Playlists"],["album","Álbumes"],["artist","Artistas"]]
    .map(([val, lbl]) => {
      const on = libState.filter === val;
      return `<button class="rounded-full px-3 py-1.5 text-xs font-bold transition ${on ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"}" data-lib-filter-page="${val}">${lbl}</button>`;
    }).join("");

  const rows = filtered.map(it => {
    const bg   = it.img ? `background-image:url('${it.img}');background-size:cover;background-position:center` : "background:linear-gradient(135deg,#333,#111)";
    const round = it.type === "artist" ? "rounded-full" : "rounded-sm";
    const lnk  = it.type === "liked" ? "liked" : `${it.type}/${it.id}`;
    const isActive = Player.context.id === it.id;
    return `
<article class="group flex items-center gap-3 rounded-lg p-2 cursor-pointer transition-colors hover:bg-white/[0.07] ${isActive ? "bg-white/[0.05]" : ""}"
  data-link="${lnk}" data-card="${it.type === "liked" ? "liked:liked" : `${it.type}:${it.id}`}">
  <span class="h-14 w-14 shrink-0 overflow-hidden ${round}" style="${bg}"></span>
  <div class="min-w-0 flex-1">
    <p class="truncate text-sm font-bold leading-tight ${isActive ? "text-[#1ed760]" : "text-white"}">${esc(it.name)}</p>
    <p class="truncate text-xs text-[#a7a7a7] mt-0.5">${esc(it.sub)}</p>
  </div>
  <button class="hidden group-hover:flex h-9 w-9 items-center justify-center rounded-full bg-[#1ed760] text-black shadow hover:scale-110 transition-transform"
    data-collection-play="${it.type === "liked" ? "liked:liked" : `${it.type}:${it.id}`}" aria-label="Reproducir">
    <span class="ml-0.5 flex h-4 w-4 items-center justify-center text-[16px]">${icon("play")}</span>
  </button>
</article>`;
  }).join("");

  return `<main class="px-4 pb-12 pt-4 sm:px-6 lg:px-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div>
        <h1 class="text-3xl font-black text-white">Tu biblioteca</h1>
        <p class="mt-1 text-sm text-[#a7a7a7]">${all.length} elementos</p>
      </div>
      <button class="self-start rounded-full bg-white px-5 py-2.5 text-sm font-black text-black hover:scale-105 transition-transform" data-create-playlist>
        ${icon("plus")} Crear playlist
      </button>
    </div>
    <div class="flex flex-wrap gap-2 mb-4">${chips}</div>
    <div class="mb-4 flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
      <span class="text-[16px] text-[#a7a7a7]">${icon("search")}</span>
      <input id="sp2-lib-search" type="search" placeholder="Buscar en tu biblioteca" value="${esc(libState.query)}"
        class="flex-1 bg-transparent text-sm text-white placeholder:text-[#a7a7a7] focus:outline-none min-w-0"/>
    </div>
    <div class="flex flex-col gap-1">
      ${rows || `<div class="flex flex-col items-center justify-center py-16 text-center">
          <span class="text-5xl mb-4">🎧</span>
          <h3 class="text-xl font-black text-white">Nada aquí aún</h3>
          <p class="text-sm text-[#a7a7a7] mt-1 max-w-xs">Guarda álbumes, sigue artistas o crea playlists.</p>
        </div>`}
    </div>
  </main>`;
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
<article class="relative flex flex-col rounded-2xl overflow-hidden border ${active ? "border-[#1ed760]" : "border-white/10"} bg-white/[0.04] hover:bg-white/[0.07] transition-colors p-6">
  ${active ? `<span class="absolute top-3 right-3 rounded-full bg-[#1ed760] px-2 py-0.5 text-[10px] font-black text-black uppercase">Tu plan</span>` : ""}
  <h3 class="text-lg font-black text-white">${esc(p.name)}</h3>
  <p class="text-xs text-[#a7a7a7] mt-1 mb-4">${esc(p.desc)}</p>
  <div class="mt-auto">
    <p class="text-3xl font-black text-white mb-1">$${price.toLocaleString("es-CL")}
      <span class="text-sm font-medium text-[#a7a7a7]"> / ${billing === "annual" ? "año" : "mes"}</span></p>
    <ul class="mt-3 space-y-1.5 mb-5">
      ${p.features.map(f => `<li class="flex items-center gap-2 text-xs text-[#a7a7a7]"><span class="text-[#1ed760] text-[14px]">${icon("check")}</span>${esc(f)}</li>`).join("")}
    </ul>
    <button data-choose-plan="${p.id}"
      class="w-full rounded-full py-3 text-sm font-black transition-all hover:scale-105 ${active ? "bg-white/10 text-white cursor-default" : "bg-[#1ed760] text-black hover:bg-[#3be477]"}">
      ${active ? "Plan actual" : "Comenzar"}
    </button>
  </div>
</article>`;
  }).join("");

  return `<main class="px-4 pb-16 sm:px-6 lg:px-8">
    <!-- Hero -->
    <div class="relative overflow-hidden rounded-2xl mb-10 mt-2 px-8 py-14 text-center"
      style="background:linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1ed760 130%)">
      <div class="absolute inset-0 opacity-10" style="background-image:repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%);background-size:20px 20px"></div>
      <div class="relative">
        <span class="text-5xl mb-4 block">${icon("logo")}</span>
        <h1 class="text-4xl sm:text-5xl font-black text-white mb-2">Spotify Premium</h1>
        <p class="text-white/70 text-lg mb-6">Música sin límites, sin anuncios, en todos tus dispositivos.</p>
        <div class="inline-flex rounded-full bg-black/30 p-1 gap-1">
          <button data-billing="monthly" class="billing-tab rounded-full px-4 py-1.5 text-sm font-bold transition ${billing === "monthly" ? "bg-white text-black" : "text-white hover:bg-white/10"}">Mensual</button>
          <button data-billing="annual"  class="billing-tab rounded-full px-4 py-1.5 text-sm font-bold transition ${billing === "annual"  ? "bg-white text-black" : "text-white hover:bg-white/10"}">Anual <span class="ml-1 text-[#1ed760] text-xs font-black">-17%</span></button>
        </div>
      </div>
    </div>

    <!-- Plans -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-12">
      ${cards}
    </div>

    <!-- Features -->
    <div class="rounded-2xl bg-white/[0.04] p-6 sm:p-8">
      <h2 class="text-2xl font-black text-white mb-6">¿Por qué Premium?</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        ${[
          ["🚫","Sin anuncios","Escucha sin interrupciones. La música fluye sin cortes."],
          ["📥","Descargas","Lleva tu música a donde vayas, sin internet."],
          ["🎵","Calidad máxima","Audio de 320 kbps. Escucha cada detalle."],
          ["⏭️","Saltos ilimitados","Salta cuantas canciones quieras, cuando quieras."],
        ].map(([em, t, d]) => `<div class="flex flex-col gap-2">
          <span class="text-3xl">${em}</span>
          <h3 class="font-black text-white text-base">${t}</h3>
          <p class="text-sm text-[#a7a7a7]">${d}</p>
        </div>`).join("")}
      </div>
    </div>
  </main>`;
}

/* ═══════════════════════════════════════════════════
   CUENTA
═══════════════════════════════════════════════════ */
function renderAccount() {
  const plan = Store.get("plan") || "free";
  const planName = plan === "free" ? "Free" : (DB.plan(plan)?.name || "Premium");
  const settings = Store.get("settings") || {};

  return `<main class="px-4 pb-16 pt-4 sm:px-6 lg:px-8 max-w-2xl">
    <h1 class="text-3xl font-black text-white mb-8">Cuenta</h1>

    <!-- Profile card -->
    <div class="flex items-center gap-5 rounded-2xl bg-white/[0.06] p-6 mb-6">
      <div class="h-20 w-20 shrink-0 rounded-full flex items-center justify-center text-2xl font-black text-white shadow-lg"
        style="background:linear-gradient(135deg,#ff512f,#dd2476)">MP</div>
      <div class="min-w-0 flex-1">
        <h2 class="text-xl font-black text-white">Matyaz Paredes</h2>
        <p class="text-sm text-[#a7a7a7] mt-0.5">matyaz@estudiante.ulagos.cl</p>
        <span class="mt-2 inline-flex items-center gap-1 rounded-full ${plan === "free" ? "bg-white/10 text-[#a7a7a7]" : "bg-[#1ed760]/20 text-[#1ed760]"} px-3 py-1 text-xs font-bold">
          ${plan !== "free" ? icon("premium") : ""} ${esc(planName)}
        </span>
      </div>
      <a href="#/premium" class="shrink-0 rounded-full border border-white/30 px-4 py-2 text-sm font-bold text-white hover:border-white transition" data-link="premium">
        ${plan === "free" ? "Ir a Premium" : "Ver plan"}
      </a>
    </div>

    <!-- Settings -->
    <div class="rounded-2xl bg-white/[0.06] overflow-hidden mb-6">
      <div class="px-5 py-4 border-b border-white/10">
        <h3 class="font-black text-white">Preferencias</h3>
      </div>
      ${[
        ["quality", "Calidad de audio", "select", ["Normal","Alta","Muy alta","Sin pérdida"], settings.quality || "Alta"],
        ["autoplay", "Reproducción automática", "checkbox", null, settings.autoplay !== false],
        ["crossfade", "Crossfade", "checkbox", null, settings.crossfade || false],
        ["normalize", "Normalizar volumen", "checkbox", null, settings.normalize !== false],
      ].map(([key, label, type, opts, val]) => `
<div class="flex items-center justify-between px-5 py-4 border-b border-white/10 last:border-0">
  <div>
    <p class="text-sm font-semibold text-white">${label}</p>
  </div>
  ${type === "checkbox"
    ? `<label class="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" class="peer sr-only" ${val ? "checked" : ""} data-setting="${key}">
        <div class="h-6 w-11 rounded-full bg-white/10 peer-checked:bg-[#1ed760] transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5"></div>
      </label>`
    : `<select data-setting="${key}" class="rounded-lg bg-white/10 border border-white/20 text-sm text-white px-3 py-1.5 focus:outline-none focus:border-white/40">
        ${opts.map(o => `<option ${o===val?"selected":""}>${o}</option>`).join("")}
      </select>`}
</div>`).join("")}
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-3 mb-6">
      ${[
        [Player.liked.size, "Te gustan"],
        [DB.userPlaylists.length, "Playlists"],
        [(Store.get("savedAlbums") || []).length, "Álbumes"],
      ].map(([n, l]) => `<div class="rounded-xl bg-white/[0.06] p-4 text-center">
        <p class="text-3xl font-black text-white">${n}</p>
        <p class="text-xs text-[#a7a7a7] mt-1">${l}</p>
      </div>`).join("")}
    </div>

    <button data-action="logout"
      class="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white hover:border-white transition-colors">
      ${icon("logout")} Cerrar sesión
    </button>
  </main>`;
}

/* ═══════════════════════════════════════════════════
   COLA DE REPRODUCCIÓN
═══════════════════════════════════════════════════ */
function renderQueuePanel(tab = "queue") {
  const content = document.getElementById("sp2-queue-content");
  if (!content) return;

  if (tab === "lyrics") {
    const song = Player.song;
    if (!song) { content.innerHTML = `<div class="flex flex-col items-center justify-center h-40 text-[#a7a7a7] text-sm">${icon("lyrics")} <p class="mt-3">Reproduce algo para ver la letra</p></div>`; return; }
    const lines = [
      "Se encienden las luces de la ciudad,","y tu nombre suena en la radio otra vez.",
      "No sé si es el ritmo o la soledad,","pero esta noche no pienso volver.",
      "","Y bailamos bajo la lluvia,","como si el mundo no existiera.",
      "Cada latido es una excusa","para quedarnos hasta que amanezca.",
      "","No me digas que es el final,","que la noche apenas empieza.",
      "Tu voz se mezcla con el beat","y todo lo demás se congela.",
    ];
    const chorus = new Set([5,6,7,8,12,13]);
    content.innerHTML = `<div class="px-4 pb-8 pt-2">
      <p class="text-[10px] text-[#a7a7a7] rounded-lg bg-white/[0.04] p-3 mb-4 leading-relaxed">Letra simulada con fines visuales.</p>
      ${lines.map((l, i) => l ? `<p class="mb-3 text-[15px] font-semibold leading-snug ${chorus.has(i) ? "text-white" : "text-white/50"}">${esc(l)}</p>` : "<div class='mb-3'></div>").join("")}
    </div>`;
    return;
  }

  // Queue tab
  const cur = Player.song;
  if (!cur) {
    content.innerHTML = `<div class="flex flex-col items-center justify-center h-40 text-[#a7a7a7] text-sm gap-2">🎵<p>La cola está vacía</p></div>`;
    return;
  }
  const curAlbum = DB.album(cur.albumId);
  const upcoming = Player.queue.slice(Player.index + 1).map(sid => DB.song(sid)).filter(Boolean);

  content.innerHTML = `<div class="px-3 pb-8">
    <p class="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#a7a7a7] px-1">Sonando ahora</p>
    <div class="flex items-center gap-3 rounded-xl bg-white/10 p-3 mb-5">
      <span class="h-12 w-12 shrink-0 rounded bg-cover bg-center shadow" style="${coverBg(curAlbum||{}, "album")}"></span>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold text-[#1ed760]">${esc(cur.title)}</p>
        <p class="truncate text-xs text-[#a7a7a7]">${esc(DB.artist(cur.artistId)?.name||"")}</p>
      </div>
    </div>
    <p class="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#a7a7a7] px-1">A continuación</p>
    ${upcoming.length ? upcoming.slice(0,15).map(s => {
      const al = DB.album(s.albumId);
      return `<button class="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-white/[0.07] transition-colors" data-queue-play="${s.id}">
        <span class="h-10 w-10 shrink-0 rounded bg-cover bg-center" style="${coverBg(al||{}, "album")}"></span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-medium text-white">${esc(s.title)}</span>
          <span class="block truncate text-xs text-[#a7a7a7]">${esc(DB.artist(s.artistId)?.name||"")}</span>
        </span>
        <span class="text-xs tabular-nums text-[#a7a7a7]">${fmtTime(s.duration)}</span>
      </button>`;
    }).join("") : `<p class="text-xs text-[#a7a7a7] px-1 py-3">No hay más canciones en la cola.</p>`}
  </div>`;
}

/* ═══════════════════════════════════════════════════
   404
═══════════════════════════════════════════════════ */
function renderNotFound(what) {
  return `<main class="flex flex-col items-center justify-center px-6 py-24 text-center">
    <span class="text-6xl mb-4">😵</span>
    <h2 class="text-3xl font-black text-white mb-2">No encontrado</h2>
    <p class="text-[#a7a7a7] mb-6 max-w-xs">No encontramos ${esc(what)} en el catálogo.</p>
    <div class="flex gap-3">
      <a href="#/" class="rounded-full bg-white px-6 py-3 text-sm font-black text-black hover:bg-white/90 transition" data-link="">Inicio</a>
      <a href="#/search" class="rounded-full border border-white/30 px-6 py-3 text-sm font-black text-white hover:border-white transition" data-link="search">Buscar</a>
    </div>
  </main>`;
}
