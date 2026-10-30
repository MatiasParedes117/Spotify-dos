/* =====================================================================
 * Spotify-dos — Componentes de tarjetas reutilizables
 * ================================================================== */

function esc(s) {
  return String(s).replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])
  );
}

/* ─── imagen de portada ─── */
function coverSrc(item, type) {
  if (item?.img) return `url('${item.img}')`;
  // fallback gradient
  const colors = {
    "a-badbunny":"#18181b","a-karolg":"#ec4899","a-taylorswift":"#7c3aed",
    "a-weeknd":"#991b1b","a-feid":"#065f46","a-dualipa":"#1d4ed8",
    "a-rosalia":"#9d174d","a-kendrick":"#78350f","a-sza":"#4c1d95",
    "a-coldplay":"#1e40af","a-monlaferte":"#dc2626","a-bunkers":"#374151",
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
    ((type === "song"    && Player.song.id === item.id) ||
     (type === "album"   && Player.song.albumId === item.id) ||
     (type === "artist"  && Player.song.artistId === item.id) ||
     (type === "playlist"&& Player.context.id === item.id));

  const roundCls = round || type === "artist" ? "rounded-full" : "rounded-md";
  const title    = esc(type === "album" ? item.title : item.name);
  const sub      = esc(subtext || "");
  const pt       = playTarget || `${type}:${item.id}`;
  const lnk      = href || `${type}/${item.id}`;

  return `
<article class="sp2-card group relative flex flex-col gap-2 cursor-pointer rounded-lg p-3 transition-all duration-200 hover:bg-white/[0.08] ${isActive ? "bg-white/[0.06]" : ""}"
  data-link="${lnk}" data-card="${pt}">
  <div class="relative w-full aspect-square overflow-hidden ${roundCls} shadow-lg mb-1">
    <div class="absolute inset-0 ${roundCls}" style="${coverBg(item, type)}"></div>
    <div class="absolute inset-0 ${roundCls} bg-black/0 group-hover:bg-black/20 transition-colors duration-200"></div>
    <button class="sp2-play-btn absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-xl translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 hover:bg-[#3be477]"
      data-collection-play="${pt}" aria-label="Reproducir ${title}" tabindex="-1">
      <span class="flex h-5 w-5 items-center justify-center ml-0.5 text-[18px]">${icon(isActive && Player.playing ? "pause" : "play")}</span>
    </button>
  </div>
  <div class="min-w-0">
    <p class="truncate text-sm font-bold text-white leading-tight ${isActive ? "text-[#1ed760]" : ""}">${title}</p>
    <p class="truncate text-xs text-[#a7a7a7] mt-0.5 leading-snug">${sub}</p>
  </div>
</article>`;
}

/* ─── fila de canción ─── */
function songRowHtml(song, index, opts = {}) {
  const album  = DB.album(song.albumId);
  const artist = DB.artist(song.artistId);
  const isActive = Player.song?.id === song.id;
  const isLiked  = Player.liked.has(song.id);
  const qType    = opts.queueType || "playlist";
  const qId      = opts.queueId   || "pl-topglobal";
  const showAlbum = opts.showAlbum !== false;

  return `
<div class="sp2-song-row group grid items-center gap-3 rounded-md px-4 py-2 transition-colors hover:bg-white/[0.07] ${isActive ? "bg-white/[0.05]" : ""}"
  style="grid-template-columns: 1.5rem 2.5rem minmax(0,1fr) ${showAlbum ? "minmax(0,1fr)" : ""} 4rem 2rem"
  data-play-song="${song.id}" data-queue-type="${qType}" data-queue-id="${qId}">
  <span class="text-center text-sm tabular-nums ${isActive ? "text-[#1ed760]" : "text-[#a7a7a7]"} group-hover:hidden select-none">${isActive && Player.playing ? icon("volume-low") : index + 1}</span>
  <button class="hidden group-hover:flex h-6 w-6 items-center justify-center text-white" data-play-song="${song.id}" data-queue-type="${qType}" data-queue-id="${qId}">
    <span class="text-[18px]">${icon(isActive && Player.playing ? "pause" : "play")}</span>
  </button>
  <span class="h-10 w-10 shrink-0 rounded bg-cover bg-center shadow" style="${coverBg(album || {}, "album")}"></span>
  <div class="min-w-0">
    <p class="truncate text-sm font-bold leading-tight ${isActive ? "text-[#1ed760]" : "text-white"}">${esc(song.title)}</p>
    <p class="truncate text-xs text-[#a7a7a7] leading-snug hover:underline cursor-pointer" data-link="artist/${song.artistId}">${esc(artist?.name || "")}</p>
  </div>
  ${showAlbum ? `<p class="hidden sm:block truncate text-sm text-[#a7a7a7] hover:text-white hover:underline cursor-pointer" data-link="album/${song.albumId}">${esc(album?.title || "")}</p>` : ""}
  <span class="text-xs tabular-nums text-[#a7a7a7] text-right">${fmtTime(song.duration)}</span>
  <button class="opacity-0 group-hover:opacity-100 ${isLiked ? "!opacity-100 text-[#1ed760]" : "text-[#a7a7a7] hover:text-white"} transition-opacity" data-like="${song.id}" aria-label="Me gusta">
    <span class="text-[16px]">${icon(isLiked ? "heart" : "heart-outline")}</span>
  </button>
</div>`;
}

/* ─── header de sección ─── */
function sectionHeader(title, href = "") {
  return `<div class="flex items-end justify-between mb-4 mt-2">
    <h2 class="text-xl font-black text-white">${esc(title)}</h2>
    ${href ? `<a href="#/${href}" class="text-xs font-bold text-[#a7a7a7] hover:text-white uppercase tracking-wider transition-colors">Ver todo</a>` : ""}
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
    ${img ? `<div class="mx-auto h-44 w-44 shrink-0 sm:mx-0 sm:h-[220px] sm:w-[220px] overflow-hidden ${kind==="Artista" ? "rounded-full" : "rounded-lg"} shadow-2xl ring-1 ring-white/10">
      <div class="h-full w-full" style="background-image:url('${img}');background-size:cover;background-position:center"></div>
    </div>` : ""}
    <div class="min-w-0 text-center sm:text-left">
      ${badge ? `<p class="mb-1 text-xs font-bold uppercase tracking-widest text-white/70">${badge}</p>` : ""}
      <p class="text-[11px] font-bold uppercase tracking-wider text-white/60">${esc(kind)}</p>
      <h1 class="mt-1 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl break-words">${esc(name)}</h1>
      ${meta ? `<div class="mt-3 text-sm text-white/80 flex flex-wrap gap-x-3 gap-y-1 justify-center sm:justify-start">${meta}</div>` : ""}
      ${extra ? `<p class="mt-2 text-sm text-[#a7a7a7] max-w-xl">${extra}</p>` : ""}
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
<div class="sticky top-0 z-20 flex items-center gap-3 px-4 py-5 sm:px-8"
  style="background:linear-gradient(to bottom, rgba(18,18,18,.92) 80%, transparent)">
  <button class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-2xl transition-transform hover:scale-105 active:scale-95"
    data-collection-play="${type}:${id}" aria-label="Reproducir">
    <span class="ml-0.5 flex h-6 w-6 items-center justify-center text-[22px]">${icon(isPlaying ? "pause" : "play")}</span>
  </button>
  <button class="flex h-9 w-9 items-center justify-center rounded-full text-[#a7a7a7] transition hover:scale-110 hover:text-white"
    data-shuffle-collection="${type}:${id}" aria-label="Mezclar" title="Aleatorio">
    <span class="text-[22px]">${icon("shuffle")}</span>
  </button>
  ${opts.follow ? `<button class="rounded-full border px-5 py-1.5 text-sm font-bold transition-all hover:scale-105
      ${saved ? "border-[#1ed760] text-[#1ed760] hover:border-white hover:text-white" : "border-white/40 text-white hover:border-white"}"
      data-follow-artist="${id}">${saved ? "Siguiendo" : "Seguir"}</button>` : ""}
  ${opts.saveAlbum ? `<button class="rounded-full text-[26px] transition hover:scale-110
      ${savedAlbum ? "text-[#1ed760]" : "text-[#a7a7a7] hover:text-white"}"
      data-save-album="${id}" aria-label="${savedAlbum ? "Guardado" : "Guardar en biblioteca"}">
      <span>${icon(savedAlbum ? "heart" : "heart-outline")}</span>
    </button>` : ""}
  ${opts.custom ? `<button class="rounded-full border border-white/40 px-4 py-1.5 text-sm font-bold text-white hover:scale-105 hover:border-white transition-all"
    data-add-songs="${id}">Agregar canciones</button>` : ""}
  <button class="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-[#a7a7a7] hover:text-white transition hover:scale-110"
    data-more-context="${type}:${id}" aria-label="Más opciones">
    <span class="text-[22px]">${icon("more")}</span>
  </button>
</div>`;
}

/* ─── tabla de canciones con cabecera ─── */
function songTableHtml(songs, opts = {}) {
  const showAlbum = opts.showAlbum !== false;
  return `
<div class="px-4 pb-8 sm:px-8">
  <div class="mb-2 grid items-center gap-3 border-b border-white/10 pb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-[#a7a7a7]"
    style="grid-template-columns: 1.5rem 2.5rem minmax(0,1fr) ${showAlbum ? "minmax(0,1fr)" : ""} 4rem 2rem">
    <span class="text-center">#</span>
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
  const sub  = type === "artist" ? "Artista" : type === "album" ? `Álbum · ${esc(DB.artist(item.artistId)?.name || "")}` : "Playlist";
  const lnk  = `${type}/${item.id}`;
  const isActive = Player.context.id === item.id;
  const round = type === "artist" ? "rounded-full" : "rounded-sm";

  return `
<a href="#/${lnk}" class="flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.07] ${isActive ? "bg-white/[0.05]" : ""}" data-link="${lnk}">
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

/* ─── update progress bar UI ─── */
function updateProgressUI() {
  const pct = Player.duration > 0 ? (Player.currentTime / Player.duration) * 100 : 0;

  const bar   = document.getElementById("sp2-progress");
  const time  = document.getElementById("sp2-time");
  const dur   = document.getElementById("sp2-dur");
  const mbar  = document.getElementById("sp2-mini-bar");

  if (bar)  bar.value = pct;
  if (time) time.textContent = fmtTime(Player.currentTime);
  if (dur)  dur.textContent  = fmtTime(Player.duration);
  if (mbar) mbar.style.width = pct + "%";
}

/* ─── update player bar UI ─── */
function renderPlayerUI() {
  const song   = Player.song;
  const album  = song ? DB.album(song.albumId) : null;
  const artist = song ? DB.artist(song.artistId) : null;

  // cover
  const coverStyle = album?.img ? `url('${album.img}')` : "linear-gradient(135deg,#282828,#121212)";
  ["sp2-player-cover","sp2-mini-cover","sp2-np-cover"].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.backgroundImage = coverStyle; el.style.backgroundSize = "cover"; el.style.backgroundPosition = "center"; }
  });

  // title / artist
  const title  = song?.title  || "Elige una canción";
  const artName= artist?.name || "";
  setTxt("sp2-player-title",  title);
  setTxt("sp2-player-artist", artName);
  setTxt("sp2-mini-title",    title);
  setTxt("sp2-mini-artist",   artName);
  setTxt("sp2-np-title",      title);
  setTxt("sp2-np-artist",     artName);

  // play/pause icons
  const playIco = Player.playing ? icon("pause") : icon("play");
  ["sp2-btn-play","sp2-mini-play","sp2-np-play"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) { const sp = btn.querySelector("span"); if (sp) sp.innerHTML = playIco; }
  });

  // like button
  const liked = song && Player.liked.has(song.id);
  ["sp2-like","sp2-np-like"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.innerHTML = `<span class="text-[18px]">${icon(liked ? "heart" : "heart-outline")}</span>`;
      btn.classList.toggle("text-[#1ed760]", liked);
      btn.classList.toggle("text-[#a7a7a7]", !liked);
    }
  });

  // shuffle
  const shufBtn = document.getElementById("sp2-btn-shuffle");
  if (shufBtn) shufBtn.classList.toggle("text-[#1ed760]", Player.shuffle);

  // repeat
  const repBtn = document.getElementById("sp2-btn-repeat");
  if (repBtn) {
    repBtn.innerHTML = `<span class="text-[18px]">${icon(Player.repeat === "one" ? "repeat-one" : "repeat")}</span>`;
    repBtn.classList.toggle("text-[#1ed760]", Player.repeat !== "none");
  }

  // volume
  const volEl = document.getElementById("sp2-volume");
  if (volEl) volEl.value = Player.volume * 100;
  updateVolumeIcon();

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
}

function renderLikeButtons() {
  document.querySelectorAll("[data-like]").forEach(btn => {
    const id = btn.getAttribute("data-like");
    const liked = Player.liked.has(id);
    btn.innerHTML = `<span class="text-[16px]">${icon(liked ? "heart" : "heart-outline")}</span>`;
    btn.classList.toggle("text-[#1ed760]", liked);
    btn.classList.toggle("text-[#a7a7a7]", !liked);
    btn.classList.toggle("opacity-100", liked);
  });
}

function setActiveSongRow() {
  document.querySelectorAll(".sp2-song-row").forEach(row => {
    const id = row.getAttribute("data-play-song");
    row.classList.toggle("bg-white/[0.05]", Player.song?.id === id);
  });
}
