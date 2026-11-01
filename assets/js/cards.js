/* =====================================================================
 * Spotify-dos — Componentes de tarjetas y reproductor
 * ================================================================== */

function esc(s) {
  return String(s).replace(/[&<>"']/g, m =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
  );
}

/* ─── rutas reales entre páginas ─── */
const PAGE_ROUTES = {
  home: "index.html",
  search: "buscar.html",
  library: "biblioteca.html",
  explore: "explorar.html",
  about: "acerca.html",
  premium: "premium.html",
  account: "cuenta.html",
};

function routeUrl(link) {
  if (!link) return "index.html";
  if (/^(https?:|mailto:|tel:|#|data:)/.test(link)) return link;
  if (/\.html(\?.*)?$/.test(link)) return link;
  const clean = link.replace(/^#\//, "");
  if (PAGE_ROUTES[clean]) return PAGE_ROUTES[clean];
  const [type, id] = clean.split("/");
  if (!id) return PAGE_ROUTES[type] || "index.html";
  if (["playlist", "album", "artist", "genre", "liked"].includes(type)) {
    return `detalle.html?tipo=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`;
  }
  return "index.html";
}

/* ─── imagen de portada ─── */
function coverSrc(item, type) {
  if (item?.img) return `url('${item.img}')`;
  const colors = {
    "a-badbunny": "#18181b", "a-karolg": "#ec4899", "a-taylorswift": "#7c3aed",
    "a-weeknd": "#991b1b", "a-feid": "#065f46", "a-dualipa": "#1d4ed8",
    "a-rosalia": "#9d174d", "a-kendrick": "#78350f", "a-sza": "#4c1d95",
    "a-coldplay": "#1e40af", "a-monlaferte": "#dc2626", "a-bunkers": "#374151",
  };
  const c = colors[item?.id] || "#282828";
  return `linear-gradient(135deg, ${c} 0%, #121212 100%)`;
}

function coverBg(item, type) {
  return `background-image:${coverSrc(item, type)}; background-size:cover; background-position:center;`;
}

/* ─── card estilo Spotify (vertical) ─── */
function cardHtml({ type, item, subtext, playTarget, href, round = false }) {
  const isActive = Player.song &&
    ((type === "song" && Player.song.id === item.id) ||
     (type === "album" && Player.song.albumId === item.id) ||
     (type === "artist" && Player.song.artistId === item.id) ||
     (type === "playlist" && Player.context.id === item.id));

  const roundCls = round || type === "artist" ? "rounded-full" : "rounded-md";
  const title = esc(type === "album" ? item.title : item.name);
  const sub = esc(subtext || "");
  const pt = playTarget || `${type}:${item.id}`;
  const url = routeUrl(href || `${type}/${item.id}`);

  return `
<article class="sp2-card group relative flex flex-col gap-2 rounded-lg p-3 transition-all duration-200 hover:bg-white/[0.08] ${isActive ? "bg-white/[0.06]" : ""}">
  <a class="absolute inset-0 z-0 rounded-lg" href="${url}" aria-label="Abrir ${title}"></a>
  <div class="relative z-10 flex min-w-0 flex-col gap-2 pointer-events-none">
    <div class="relative mb-1 aspect-square w-full overflow-hidden ${roundCls} shadow-lg">
      <div class="absolute inset-0 ${roundCls}" style="${coverBg(item, type)}"></div>
      <div class="absolute inset-0 ${roundCls} bg-black/0 transition-colors duration-200 group-hover:bg-black/20"></div>
      <button type="button" class="sp2-play-btn pointer-events-auto absolute bottom-2 right-2 z-20 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-[#1ed760] text-black opacity-0 shadow-xl transition-all duration-200 hover:scale-105 hover:bg-[#3be477] group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100"
        data-collection-play="${pt}" aria-label="Reproducir ${title}">
        <span class="ml-0.5 flex h-5 w-5 items-center justify-center text-[18px]">${icon(isActive && Player.playing ? "pause" : "play")}</span>
      </button>
    </div>
    <div class="min-w-0">
      <p class="truncate text-sm font-bold leading-tight text-white">${title}</p>
      <p class="mt-0.5 truncate text-xs leading-snug text-[#a7a7a7]">${sub}</p>
    </div>
  </div>
</article>`;
}

/* ─── fila de canción ─── */
function songRowHtml(song, index, opts = {}) {
  const album = DB.album(song.albumId);
  const artist = DB.artist(song.artistId);
  const isActive = Player.song?.id === song.id;
  const isLiked = Player.liked.has(song.id);
  const qType = opts.queueType || "playlist";
  const qId = opts.queueId || "pl-topglobal";
  const showAlbum = opts.showAlbum !== false;
  const artistUrl = routeUrl(`artist/${song.artistId}`);
  const albumUrl = routeUrl(`album/${song.albumId}`);

  return `
<div class="sp2-song-row ${showAlbum ? "sp2-song-row--album" : "sp2-song-row--slim"} group grid items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-white/[0.07] sm:gap-3 sm:px-4 ${isActive ? "bg-white/[0.05]" : ""}"
  data-play-song="${song.id}" data-queue-type="${qType}" data-queue-id="${qId}" tabindex="0" role="button"
  aria-label="Reproducir ${esc(song.title)} de ${esc(artist?.name || "")}">
  <span class="select-none text-center text-sm tabular-nums ${isActive ? "text-[#1ed760]" : "text-[#a7a7a7]"}">${isActive && Player.playing ? icon("volume-low") : index + 1}</span>
  <button type="button" class="sp2-row-play hidden h-6 w-6 items-center justify-center text-white group-hover:flex group-focus-within:flex" data-play-song="${song.id}" data-queue-type="${qType}" data-queue-id="${qId}" aria-label="Reproducir ${esc(song.title)}">
    <span class="text-[18px]">${icon(isActive && Player.playing ? "pause" : "play")}</span>
  </button>
  <span class="h-10 w-10 shrink-0 rounded bg-cover bg-center shadow" style="${coverBg(album || {}, "album")}"></span>
  <div class="min-w-0">
    <p class="truncate text-sm font-bold leading-tight ${isActive ? "text-[#1ed760]" : "text-white"}">${esc(song.title)}</p>
    <a href="${artistUrl}" class="block truncate text-xs leading-snug text-[#a7a7a7] hover:text-white hover:underline">${esc(artist?.name || "")}</a>
  </div>
  ${showAlbum ? `<a href="${albumUrl}" class="hidden truncate text-sm text-[#a7a7a7] hover:text-white hover:underline sm:block">${esc(album?.title || "")}</a>` : ""}
  <span class="text-right text-xs tabular-nums text-[#a7a7a7]">${fmtTime(song.duration)}</span>
  <button type="button" class="sp2-row-like ${isLiked ? "opacity-100 text-[#1ed760]" : "text-[#a7a7a7] hover:text-white"} transition-opacity" data-like="${song.id}" aria-label="Me gusta ${esc(song.title)}" aria-pressed="${isLiked}">
    <span class="text-[16px]">${icon(isLiked ? "heart" : "heart-outline")}</span>
  </button>
</div>`;
}

/* ─── header de sección ─── */
function sectionHeader(title, href = "") {
  return `<div class="mb-4 mt-2 flex items-end justify-between gap-4">
    <h2 class="text-xl font-black text-white">${esc(title)}</h2>
    ${href ? `<a href="${routeUrl(href)}" class="shrink-0 text-xs font-bold uppercase tracking-wider text-[#a7a7a7] transition-colors hover:text-white">Ver todo</a>` : ""}
  </div>`;
}

/* ─── grid de cards ─── */
function cardGrid(items, opts = {}) {
  const cols = opts.cols || "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
  return `<div class="grid gap-3 ${cols}">${items}</div>`;
}

/* ─── hero de portada de detalle ─── */
function detailHeroHtml({ kind, name, img, meta = "", extra = "", badge = "" }) {
  const blur = img ? `url('${img}')` : "linear-gradient(135deg,#282828,#121212)";
  return `
<div class="relative overflow-hidden px-4 pb-8 pt-16 sm:px-8 sm:pt-20">
  <div class="absolute inset-0" style="background-image:${blur};background-size:cover;background-position:center;filter:blur(60px);transform:scale(1.3);opacity:.55"></div>
  <div class="absolute inset-0" style="background:linear-gradient(to bottom, rgba(0,0,0,.2) 0%, rgba(18,18,18,.7) 60%, #121212 100%)"></div>
  <div class="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-8">
    ${img ? `<div class="mx-auto h-44 w-44 shrink-0 overflow-hidden ${kind === "Artista" ? "rounded-full" : "rounded-lg"} shadow-2xl ring-1 ring-white/10 sm:mx-0 sm:h-[220px] sm:w-[220px]">
      <div class="h-full w-full" style="background-image:url('${img}');background-size:cover;background-position:center"></div>
    </div>` : ""}
    <div class="min-w-0 text-center sm:text-left">
      ${badge ? `<p class="mb-1 text-xs font-bold uppercase tracking-widest text-white/70">${esc(badge)}</p>` : ""}
      <p class="text-[11px] font-bold uppercase tracking-wider text-white/60">${esc(kind)}</p>
      <h1 class="mt-1 break-words text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">${esc(name)}</h1>
      ${meta ? `<div class="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm text-white/80 sm:justify-start">${meta}</div>` : ""}
      ${extra ? `<p class="mt-2 max-w-xl text-sm text-[#a7a7a7]">${extra}</p>` : ""}
    </div>
  </div>
</div>`;
}

/* ─── barra de acción (play, shuffle, like, more) ─── */
function actionBarHtml(type, id, opts = {}) {
  const saved = opts.follow && (Store.get("savedArtists") || []).includes(id);
  const savedAlbum = opts.saveAlbum && (Store.get("savedAlbums") || []).includes(id);
  const isPlaying = Player.playing && Player.context.id === id;

  return `
<div class="sticky top-0 z-20 flex flex-wrap items-center gap-3 px-4 py-5 sm:px-8"
  style="background:linear-gradient(to bottom, rgba(18,18,18,.92) 80%, transparent)">
  <button type="button" class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-2xl transition-transform hover:scale-105 active:scale-95"
    data-collection-play="${type}:${id}" aria-label="Reproducir">
    <span class="ml-0.5 flex h-6 w-6 items-center justify-center text-[22px]">${icon(isPlaying ? "pause" : "play")}</span>
  </button>
  <button type="button" class="flex h-9 w-9 items-center justify-center rounded-full text-[#a7a7a7] transition hover:scale-110 hover:text-white"
    data-shuffle-collection="${type}:${id}" aria-label="Mezclar" title="Aleatorio">
    <span class="text-[22px]">${icon("shuffle")}</span>
  </button>
  ${opts.follow ? `<button type="button" class="rounded-full border px-5 py-1.5 text-sm font-bold transition-all hover:scale-105
      ${saved ? "border-[#1ed760] text-[#1ed760] hover:border-white hover:text-white" : "border-white/40 text-white hover:border-white"}"
      data-follow-artist="${id}" aria-pressed="${saved}">${saved ? "Siguiendo" : "Seguir"}</button>` : ""}
  ${opts.saveAlbum ? `<button type="button" class="rounded-full text-[26px] transition hover:scale-110
      ${savedAlbum ? "text-[#1ed760]" : "text-[#a7a7a7] hover:text-white"}"
      data-save-album="${id}" aria-label="${savedAlbum ? "Guardado" : "Guardar en biblioteca"}" aria-pressed="${savedAlbum}">
      <span>${icon(savedAlbum ? "heart" : "heart-outline")}</span>
    </button>` : ""}
  ${opts.custom ? `<button type="button" class="rounded-full border border-white/40 px-4 py-1.5 text-sm font-bold text-white transition-all hover:scale-105 hover:border-white"
    data-add-songs="${id}">${icon("plus")} Agregar canciones</button>` : ""}
  <button type="button" class="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-[#a7a7a7] transition hover:scale-110 hover:text-white"
    data-more-context="${type}:${id}" aria-label="Más opciones">
    <span class="text-[22px]">${icon("more")}</span>
  </button>
</div>`;
}

/* ─── tabla de canciones con cabecera ─── */
function songTableHtml(songs, opts = {}) {
  const showAlbum = opts.showAlbum !== false;
  return `
<div class="px-1 pb-8 sm:px-8">
  <div class="sp2-song-head ${showAlbum ? "sp2-song-head--album" : "sp2-song-head--slim"} mb-2 grid items-center gap-2 border-b border-white/10 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#a7a7a7] sm:gap-3 sm:px-4">
    <span class="text-center">#</span>
    <span></span>
    <span></span>
    <span>Título</span>
    ${showAlbum ? `<span class="hidden sm:block">Álbum</span>` : ""}
    <span class="text-right">${icon("clock") || "⏱"}</span>
    <span></span>
  </div>
  ${songs.map((s, i) => songRowHtml(s, i, opts)).join("")}
</div>`;
}

/* ─── fila compacta en sidebar ─── */
function sidebarItemHtml(item, type) {
  const name = esc(type === "album" ? item.title : item.name);
  const sub = type === "artist" ? "Artista" : type === "album" ? `Álbum · ${esc(DB.artist(item.artistId)?.name || "")}` : "Playlist";
  const url = routeUrl(`${type}/${item.id}`);
  const isActive = Player.context.id === item.id;
  const round = type === "artist" ? "rounded-full" : "rounded-sm";

  return `
<a href="${url}" class="flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.07] ${isActive ? "bg-white/[0.05]" : ""}">
  <span class="h-11 w-11 shrink-0 overflow-hidden ${round}" style="${coverBg(item, type)}"></span>
  <div class="min-w-0 flex-1">
    <p class="truncate text-sm font-semibold leading-tight ${isActive ? "text-[#1ed760]" : "text-white"}">${name}</p>
    <p class="truncate text-xs text-[#a7a7a7]">${sub}</p>
  </div>
</a>`;
}

/* ─── toaster ─── */
function toast(msg, duration = 2800) {
  const el = document.getElementById("sp2-toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("opacity-0", "translate-y-2");
  el.classList.add("opacity-100", "translate-y-0");
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.classList.remove("opacity-100", "translate-y-0");
    el.classList.add("opacity-0", "translate-y-2");
  }, duration);
}

/* ─── progreso del reproductor ─── */
function updateProgressUI() {
  const pct = Player.duration > 0 ? (Player.currentTime / Player.duration) * 100 : 0;

  const bar = document.getElementById("sp2-progress");
  const time = document.getElementById("sp2-time");
  const dur = document.getElementById("sp2-dur");
  const npBar = document.getElementById("sp2-np-progress");
  const npTime = document.getElementById("sp2-np-time");
  const npDur = document.getElementById("sp2-np-dur");
  const mbar = document.getElementById("sp2-mini-bar");

  if (bar) {
    bar.value = pct;
    if (typeof updateSliderFill === "function") updateSliderFill(bar);
  }
  if (npBar) {
    npBar.value = pct;
    if (typeof updateSliderFill === "function") updateSliderFill(npBar);
  }
  if (time) time.textContent = fmtTime(Player.currentTime);
  if (dur) dur.textContent = fmtTime(Player.duration);
  if (npTime) npTime.textContent = fmtTime(Player.currentTime);
  if (npDur) npDur.textContent = fmtTime(Player.duration);
  if (mbar) mbar.style.width = pct + "%";
}

/* ─── UI de la barra del reproductor ─── */
function renderPlayerUI() {
  const song = Player.song;
  const album = song ? DB.album(song.albumId) : null;
  const artist = song ? DB.artist(song.artistId) : null;

  const coverStyle = album?.img ? `url('${album.img}')` : "linear-gradient(135deg,#282828,#121212)";
  ["sp2-player-cover", "sp2-mini-cover", "sp2-np-cover"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.backgroundImage = coverStyle;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
    }
  });

  const title = song?.title || "Elige una canción";
  const artName = artist?.name || "Artista";
  setTxt("sp2-player-title", title);
  setTxt("sp2-player-artist", artName);
  setTxt("sp2-mini-title", title);
  setTxt("sp2-mini-artist", artName);
  setTxt("sp2-np-title", title);
  setTxt("sp2-np-artist", artName);

  const contextLabel = Player.context.label || "Spotify Clone";
  setTxt("sp2-np-context", contextLabel);

  const playIco = Player.playing ? icon("pause") : icon("play");
  ["sp2-btn-play", "sp2-mini-play", "sp2-np-play"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      const sp = btn.querySelector("span");
      if (sp) sp.innerHTML = playIco;
      btn.setAttribute("aria-label", Player.playing ? "Pausar" : "Reproducir");
    }
  });

  const liked = !!(song && Player.liked.has(song.id));
  ["sp2-like", "sp2-np-like"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.innerHTML = `<span class="text-[18px]">${icon(liked ? "heart" : "heart-outline")}</span>`;
      btn.classList.toggle("text-[#1ed760]", liked);
      btn.classList.toggle("text-[#a7a7a7]", !liked);
      btn.setAttribute("aria-pressed", liked ? "true" : "false");
    }
  });

  ["sp2-btn-shuffle", "sp2-np-shuffle"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.classList.toggle("text-[#1ed760]", Player.shuffle);
      btn.classList.toggle("text-[#a7a7a7]", !Player.shuffle);
      btn.setAttribute("aria-pressed", Player.shuffle ? "true" : "false");
    }
  });

  ["sp2-btn-repeat", "sp2-np-repeat"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      const span = btn.querySelector("span");
      if (span) span.innerHTML = icon(Player.repeat === "one" ? "repeat-one" : "repeat");
      btn.classList.toggle("text-[#1ed760]", Player.repeat !== "none");
      btn.classList.toggle("text-[#a7a7a7]", Player.repeat === "none");
      btn.setAttribute("aria-label", Player.repeat === "none" ? "Repetir" : Player.repeat === "one" ? "Repetir una canción" : "Repetir cola");
    }
  });

  const volEl = document.getElementById("sp2-volume");
  if (volEl) {
    volEl.value = Player.volume * 100;
    if (typeof updateSliderFill === "function") updateSliderFill(volEl);
  }
  updateVolumeIcon();

  const playerCover = document.getElementById("sp2-player-cover");
  if (playerCover) {
    playerCover.setAttribute("aria-label", song ? `Portada de ${album?.title || title}` : "Sin canción");
    playerCover.title = song && song.albumId ? "Abrir álbum" : "";
  }

  updateProgressUI();
}

function setTxt(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

function updateVolumeIcon() {
  const btn = document.getElementById("sp2-btn-mute");
  if (!btn) return;
  const v = Player.volume;
  const ico = v === 0 ? "volume-off" : v < 0.4 ? "volume-low" : "volume";
  btn.innerHTML = `<span class="text-[18px]">${icon(ico)}</span>`;
  btn.setAttribute("aria-label", v === 0 ? "Activar sonido" : "Silenciar");
  btn.setAttribute("aria-pressed", v === 0 ? "true" : "false");
}

function renderLikeButtons() {
  document.querySelectorAll("[data-like]").forEach(btn => {
    const id = btn.getAttribute("data-like");
    const liked = Player.liked.has(id);
    btn.innerHTML = `<span class="text-[16px]">${icon(liked ? "heart" : "heart-outline")}</span>`;
    btn.classList.toggle("text-[#1ed760]", liked);
    btn.classList.toggle("text-[#a7a7a7]", !liked);
    btn.classList.toggle("opacity-100", liked);
    btn.setAttribute("aria-pressed", liked ? "true" : "false");
  });
}

function setActiveSongRow() {
  document.querySelectorAll(".sp2-song-row").forEach(row => {
    const id = row.getAttribute("data-play-song");
    row.classList.toggle("bg-white/[0.05]", Player.song?.id === id);
  });
}
