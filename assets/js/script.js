/* =====================================================================
 * Spotify-dos — Controlador principal
 * Navegación multipágina, eventos, modales y controles del reproductor.
 * ================================================================== */

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

let _queueTab = "queue";
let _queueOpen = false;
let _nowPlayingOpen = false;
let _queueCloseTimer = null;
let _npCloseTimer = null;

const sidebarLibState = { filter: "all", query: "" };

function getPage() {
  return document.body.dataset.page || "home";
}

function getParams() {
  return new URLSearchParams(location.search);
}

/* ─── render de la página actual ─── */
function detailPageTitle(tipo, id) {
  const t = (tipo || "").toLowerCase();
  let name = "";
  if (t === "playlist") name = DB.playlist(id)?.name;
  else if (t === "album") name = DB.album(id)?.title;
  else if (t === "artist") name = DB.artist(id)?.name;
  else if (t === "genre") name = DB.genre(id)?.name;
  else if (t === "liked") name = "Canciones que te gustan";
  return name ? `${name} — Spotify Clone` : "Detalle — Spotify Clone";
}

function renderCurrentPage({ resetScroll = true } = {}) {
  const view = $("#sp2-view");
  if (!view) return;

  const page = getPage();
  const params = getParams();
  let html = "";
  let title = "Spotify Clone";

  switch (page) {
    case "search": {
      const q = params.get("q") || "";
      const rawFilter = params.get("filtro") || "all";
      const filter = SEARCH_FILTERS.some(([value]) => value === rawFilter) ? rawFilter : "all";
      searchState.query = q;
      searchState.filter = filter;
      html = renderSearch(q, filter);
      title = q ? `Buscar: ${q} — Spotify Clone` : "Buscar — Spotify Clone";
      break;
    }
    case "library":
      html = renderLibrary();
      title = "Tu biblioteca — Spotify Clone";
      break;
    case "explore":
      html = renderExplore();
      title = "Explorar — Spotify Clone";
      break;
    case "about":
      html = renderAbout();
      title = "Acerca de — Spotify Clone";
      break;
    case "detail": {
      const tipo = params.get("tipo") || "";
      const id = params.get("id") || "";
      html = renderDetail(tipo, id);
      title = detailPageTitle(tipo, id);
      break;
    }
    case "premium":
      html = renderPremium();
      title = "Premium — Spotify Clone";
      break;
    case "account":
      html = renderAccount();
      title = "Cuenta — Spotify Clone";
      break;
    default:
      html = renderHome();
      title = "Inicio — Spotify Clone";
  }

  view.innerHTML = html;
  if (resetScroll) view.scrollTop = 0;
  document.title = title;

  syncHeaderSearch();
  initPageInputs();
  renderSidebar();
  renderPlayerUI();
  renderLikeButtons();
  setActiveSongRow();
  updateAccountUI();
  updateHeaderBg();
}

function rerenderCurrentPage() {
  const view = $("#sp2-view");
  const scroll = view?.scrollTop || 0;
  renderCurrentPage({ resetScroll: false });
  if (view) view.scrollTop = scroll;
}

function syncHeaderSearch() {
  const header = $("#sp2-header-search");
  if (!header) return;
  header.value = getPage() === "search" ? (getParams().get("q") || "") : "";
}

function updateHeaderBg() {
  const header = $("#sp2-topbar");
  const view = $("#sp2-view");
  if (!header || !view) return;
  const alpha = Math.min(view.scrollTop / 120, 1);
  header.style.backgroundColor = `rgba(18,18,18,${alpha})`;
}

/* ─── búsqueda ─── */
function updateSearchUrl() {
  if (getPage() !== "search") return;
  const params = new URLSearchParams();
  if (searchState.query) params.set("q", searchState.query);
  if (searchState.filter !== "all") params.set("filtro", searchState.filter);
  const qs = params.toString();
  history.replaceState(null, "", `buscar.html${qs ? `?${qs}` : ""}`);
}

function updateSearchResults() {
  const results = $("#sp2-search-results");
  if (results) results.innerHTML = searchResultsHtml(searchState.query, searchState.filter);

  document.querySelectorAll("[data-search-filter]").forEach(btn => {
    const on = btn.getAttribute("data-search-filter") === searchState.filter;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });

  document.title = searchState.query
    ? `Buscar: ${searchState.query} — Spotify Clone`
    : "Buscar — Spotify Clone";
}

function onSearchInput(value) {
  searchState.query = value;

  const pageInput = $("#sp2-search-input");
  if (pageInput && pageInput.value !== value) pageInput.value = value;
  const headerInput = $("#sp2-header-search");
  if (headerInput && headerInput.value !== value) headerInput.value = value;

  updateSearchUrl();
  updateSearchResults();
}

function onSearchFilter(value) {
  if (!SEARCH_FILTERS.some(([f]) => f === value)) return;
  searchState.filter = value;
  updateSearchUrl();
  updateSearchResults();
}

function updateLibraryResults() {
  const results = $("#sp2-library-results");
  if (results) results.innerHTML = libraryRowsHtml();

  const count = $("#sp2-library-count");
  if (count) count.textContent = `${libraryItems().length} elementos`;

  document.querySelectorAll("[data-lib-filter-page]").forEach(btn => {
    const on = btn.getAttribute("data-lib-filter-page") === libState.filter;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
}

function initPageInputs() {
  if (getPage() === "search") {
    const input = $("#sp2-search-input");
    input?.addEventListener("input", () => onSearchInput(input.value));
    $("#sp2-search-form")?.addEventListener("submit", e => {
      e.preventDefault();
      onSearchInput(input?.value || "");
    });
  }

  if (getPage() === "library") {
    const input = $("#sp2-lib-search");
    input?.addEventListener("input", () => {
      libState.query = input.value;
      updateLibraryResults();
    });
  }
}

/* ─── sidebar ─── */
function renderSidebar() {
  const list = $("#sp2-lib-list");
  if (!list) return;

  const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const q = norm(sidebarLibState.query || "");
  const filter = sidebarLibState.filter || "all";

  const filtered = libraryItems().filter(it => {
    if (filter !== "all" && it.type !== filter && !(filter === "playlist" && it.type === "liked")) return false;
    if (q && !norm(`${it.name} ${it.sub}`).includes(q)) return false;
    return true;
  });

  if (!filtered.length) {
    list.innerHTML = `<p class="px-4 py-6 text-center text-xs text-[#a7a7a7]">Sin resultados</p>`;
    return;
  }

  list.innerHTML = filtered.map(it => {
    const bg = it.img
      ? `background-image:url('${it.img}');background-size:cover;background-position:center`
      : "background:linear-gradient(135deg,#333,#111)";
    const round = it.type === "artist" ? "rounded-full" : "rounded-sm";
    const href = it.type === "liked" ? routeUrl("liked/liked") : routeUrl(`${it.type}/${it.id}`);
    const isActive = Player.context.id === it.id || (it.type === "liked" && Player.context.type === "liked");
    return `
<a href="${href}" class="sp2-side-item group flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.07] ${isActive ? "bg-white/[0.05]" : ""}" ${isActive ? 'aria-current="true"' : ""}>
  <span class="h-10 w-10 shrink-0 overflow-hidden ${round}" style="${bg}"></span>
  <div class="min-w-0 flex-1">
    <p class="truncate text-sm font-semibold leading-tight ${isActive ? "text-[#1ed760]" : "text-white"}">${esc(it.name)}</p>
    <p class="truncate text-xs text-[#a7a7a7]">${esc(it.sub)}</p>
  </div>
</a>`;
  }).join("");
}

function initSidebar() {
  $$("[data-lib-chip]").forEach(btn => {
    btn.addEventListener("click", () => {
      sidebarLibState.filter = btn.getAttribute("data-lib-chip");
      $$("[data-lib-chip]").forEach(b => {
        const on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      renderSidebar();
    });
  });

  $("#sp2-lib-search-btn")?.addEventListener("click", () => {
    const wrap = $("#sp2-lib-search-wrap");
    if (!wrap) return;
    wrap.classList.toggle("hidden");
    if (!wrap.classList.contains("hidden")) $("#sp2-lib-search-sidebar")?.focus();
  });

  $("#sp2-lib-search-sidebar")?.addEventListener("input", e => {
    sidebarLibState.query = e.target.value;
    renderSidebar();
  });

  $("#sp2-lib-create")?.addEventListener("click", openCreatePlaylistModal);
}

/* ─── header ─── */
function initHeader() {
  const form = $("#sp2-header-search-form");
  const input = $("#sp2-header-search");

  form?.addEventListener("submit", e => {
    e.preventDefault();
    const q = input?.value.trim() || "";
    if (getPage() === "search") {
      onSearchInput(q);
      return;
    }
    location.href = q ? `buscar.html?q=${encodeURIComponent(q)}` : "buscar.html";
  });

  input?.addEventListener("input", () => {
    if (getPage() === "search") onSearchInput(input.value);
  });

  $("#sp2-btn-back")?.addEventListener("click", () => {
    if (history.length > 1) history.back();
    else location.href = "index.html";
  });
  $("#sp2-btn-fwd")?.addEventListener("click", () => history.forward());

  const back = $("#sp2-btn-back");
  if (back && history.length <= 1) back.disabled = true;
}

/* ─── menús del header ─── */
function closeMenus() {
  ["sp2-profile-menu", "sp2-notif-menu"].forEach(id => {
    document.getElementById(id)?.classList.add("hidden");
  });
  ["sp2-profile-btn", "sp2-notif-btn"].forEach(id => {
    document.getElementById(id)?.setAttribute("aria-expanded", "false");
  });
}

function setupDropdown(btnId, menuId) {
  const btn = document.getElementById(btnId);
  const menu = document.getElementById(menuId);
  if (!btn || !menu) return;

  btn.addEventListener("click", e => {
    e.stopPropagation();
    const willOpen = menu.classList.contains("hidden");
    closeMenus();
    if (willOpen) {
      menu.classList.remove("hidden");
      btn.setAttribute("aria-expanded", "true");
    }
  });

}

function initHeaderMenus() {
  setupDropdown("sp2-profile-btn", "sp2-profile-menu");
  setupDropdown("sp2-notif-btn", "sp2-notif-menu");
}

/* ─── acciones globales ─── */
function collectionSongIds(type, id) {
  if (type === "playlist") return [...(DB.playlist(id)?.songIds || [])];
  if (type === "album") return [...(DB.album(id)?.songs.map(s => s[0]) || [])];
  if (type === "artist") return DB.albums.filter(a => a.artistId === id).flatMap(a => a.songs.map(s => s[0]));
  if (type === "liked") return [...Player.liked];
  return [];
}

function collectionLabel(type, id) {
  if (type === "playlist") return DB.playlist(id)?.name || "Playlist";
  if (type === "album") return DB.album(id)?.title || "Álbum";
  if (type === "artist") return DB.artist(id)?.name || "Artista";
  if (type === "liked") return "Canciones que te gustan";
  return "";
}

function playCollectionFromType(type, id) {
  const label = collectionLabel(type, id);
  const ids = collectionSongIds(type, id);
  if (!ids.length) { toast("Esta colección no tiene canciones"); return; }
  playSong(ids[0], ids, type, id, label);
}

function onPlaySongClick(target) {
  const sid = target.getAttribute("data-play-song");
  if (!sid) return;
  const qType = target.getAttribute("data-queue-type") || "playlist";
  const qId = target.getAttribute("data-queue-id") || "pl-topglobal";

  if (Player.song?.id === sid) {
    togglePlay();
    return;
  }

  let queueIds = [sid];
  if (qType === "playlist") queueIds = collectionSongIds("playlist", qId);
  else if (qType === "album") queueIds = collectionSongIds("album", qId);
  else if (qType === "artist") queueIds = collectionSongIds("artist", qId);
  else if (qType === "liked") queueIds = collectionSongIds("liked", "liked");
  else if (qType === "search") queueIds = DB.search(searchState.query).songs.map(s => s.id);

  playSong(sid, queueIds.length ? queueIds : [sid], qType, qId, collectionLabel(qType, qId));
}

function onDocumentClick(e) {
  // Los enlaces reales navegan por su cuenta.
  if (e.target.closest("a[href]")) return;

  if (e.target.closest("[data-modal-close]")) {
    e.preventDefault();
    closeModal();
    return;
  }

  const likeBtn = e.target.closest("[data-like]");
  if (likeBtn) {
    e.preventDefault();
    toggleLike(likeBtn.getAttribute("data-like"));
    return;
  }

  const collectionBtn = e.target.closest("[data-collection-play]");
  if (collectionBtn) {
    e.preventDefault();
    const [type, id] = collectionBtn.getAttribute("data-collection-play").split(":");
    const sameContext = Player.context.type === type && Player.context.id === id;
    if (sameContext && Player.song) togglePlay();
    else playCollectionFromType(type, id);
    return;
  }

  const shuffleBtn = e.target.closest("[data-shuffle-collection]");
  if (shuffleBtn) {
    e.preventDefault();
    const [type, id] = shuffleBtn.getAttribute("data-shuffle-collection").split(":");
    shuffleCollection(type, id);
    return;
  }

  const followBtn = e.target.closest("[data-follow-artist]");
  if (followBtn) {
    e.preventDefault();
    toggleSaveArtist(followBtn.getAttribute("data-follow-artist"));
    rerenderCurrentPage();
    return;
  }

  const saveAlbumBtn = e.target.closest("[data-save-album]");
  if (saveAlbumBtn) {
    e.preventDefault();
    toggleSaveAlbum(saveAlbumBtn.getAttribute("data-save-album"));
    rerenderCurrentPage();
    return;
  }

  const addSongsBtn = e.target.closest("[data-add-songs]");
  if (addSongsBtn) {
    e.preventDefault();
    openAddSongsModal(addSongsBtn.getAttribute("data-add-songs"));
    return;
  }

  const moreBtn = e.target.closest("[data-more-context]");
  if (moreBtn) {
    e.preventDefault();
    openContextMenu(moreBtn.getAttribute("data-more-context"));
    return;
  }

  const createBtn = e.target.closest("[data-create-playlist]");
  if (createBtn) {
    e.preventDefault();
    openCreatePlaylistModal();
    return;
  }

  const notifBtn = e.target.closest("[data-notif-action]");
  if (notifBtn) {
    e.preventDefault();
    handleNotification(notifBtn.getAttribute("data-notif-action"));
    return;
  }

  const actionBtn = e.target.closest("[data-action]");
  if (actionBtn) {
    e.preventDefault();
    const action = actionBtn.getAttribute("data-action");
    if (action === "logout") openLogoutModal();
    return;
  }

  const queueBtn = e.target.closest("[data-queue-play]");
  if (queueBtn) {
    e.preventDefault();
    const sid = queueBtn.getAttribute("data-queue-play");
    const idx = Player.queue.indexOf(sid);
    const song = DB.song(sid);
    if (song) {
      Player.index = idx >= 0 ? idx : Player.index;
      Player.song = song;
      Player.currentTime = 0;
      Player.duration = song.duration || 180;
      Player.playing = true;
      dispatchPlayerChange();
      if (_queueOpen) renderQueuePanel(_queueTab);
    }
    return;
  }

  const songBtn = e.target.closest("[data-play-song]");
  if (songBtn) {
    e.preventDefault();
    onPlaySongClick(songBtn);
    return;
  }

  const searchChip = e.target.closest("[data-search-filter]");
  if (searchChip) {
    e.preventDefault();
    onSearchFilter(searchChip.getAttribute("data-search-filter"));
    return;
  }

  const libChip = e.target.closest("[data-lib-filter-page]");
  if (libChip) {
    e.preventDefault();
    libState.filter = libChip.getAttribute("data-lib-filter-page");
    updateLibraryResults();
    return;
  }

  const billing = e.target.closest("[data-billing]");
  if (billing) {
    e.preventDefault();
    Store.set("billing", billing.getAttribute("data-billing"));
    rerenderCurrentPage();
    return;
  }

  const planBtn = e.target.closest("[data-choose-plan]");
  if (planBtn) {
    e.preventDefault();
    choosePlan(planBtn.getAttribute("data-choose-plan"));
    return;
  }

}

function onDocumentChange(e) {
  const input = e.target.closest("[data-setting]");
  if (!input) return;
  const key = input.getAttribute("data-setting");
  const settings = { ...(Store.get("settings") || {}) };
  settings[key] = input.type === "checkbox" ? input.checked : input.value;
  Store.set("settings", settings);
  toast("Preferencia guardada");
}

function choosePlan(pid) {
  if (pid === "free") {
    Store.set("plan", "free");
    toast("Plan Free activado");
  } else {
    const plan = DB.plan(pid);
    if (!plan) return;
    Store.set("plan", pid);
    toast(`${plan.name} activado (demo académica) 🎉`);
  }
  updateAccountUI();
  if (getPage() === "premium" || getPage() === "account") rerenderCurrentPage();
}

function handleNotification(action) {
  closeMenus();
  const dot = $(".sp2-notif-dot");
  if (dot) dot.style.display = "none";
  if (action === "new-release") location.href = routeUrl("album/al-uvst");
  else if (action === "playlist") location.href = routeUrl("playlist/pl-daily1");
  else if (action === "premium") location.href = "premium.html";
}

/* ─── modal genérico ─── */
function openModal(content, label = "Diálogo") {
  const modal = $("#sp2-modal");
  if (!modal) return null;
  closeMenus();
  modal.innerHTML = `<div class="sp2-modal-card" role="dialog" aria-modal="true" aria-label="${esc(label)}">${content}</div>`;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.classList.add("sp2-modal-open");

  const card = modal.firstElementChild;
  modal.onclick = e => { if (e.target === modal) closeModal(); };
  // Enfoca primero el campo editable y, si no hay, el primer control útil.
  const focusTarget =
    card?.querySelector("input:not([type=hidden]), textarea, select") ||
    card?.querySelector("button, a[href]");
  if (focusTarget) {
    // Evita el salto visual: el foco se aplica cuando el modal ya es visible.
    focusTarget.focus({ preventScroll: true });
  }
  return card;
}

function closeModal() {
  const modal = $("#sp2-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  modal.innerHTML = "";
  modal.onclick = null;
  document.body.classList.remove("sp2-modal-open");
}

function modalHead(eyebrow, title, subtitle = "") {
  return `<div class="sp2-modal-head">
    <div class="min-w-0">
      <p class="sp2-eyebrow">${esc(eyebrow)}</p>
      <h2>${esc(title)}</h2>
      ${subtitle ? `<p class="sp2-modal-subtitle">${subtitle}</p>` : ""}
    </div>
    <button type="button" class="sp2-modal-close" data-modal-close aria-label="Cerrar">${icon("close")}</button>
  </div>`;
}

/* ─── crear playlist ─── */
function openCreatePlaylistModal() {
  const card = openModal(`
    <form id="sp2-create-form">
      ${modalHead("Tu biblioteca", "Crear playlist", "Dale un nombre y, si quieres, una descripción.")}
      <label class="sp2-modal-label" for="sp2-pl-name">Nombre</label>
      <input id="sp2-pl-name" type="text" maxlength="60" required placeholder="Mi playlist" class="sp2-modal-input"/>
      <label class="sp2-modal-label" for="sp2-pl-desc">Descripción (opcional)</label>
      <textarea id="sp2-pl-desc" rows="3" maxlength="200" placeholder="Dale una descripción a tu playlist..." class="sp2-modal-input sp2-modal-textarea"></textarea>
      <div class="sp2-modal-actions">
        <button type="button" class="sp2-btn-secondary" data-modal-close>Cancelar</button>
        <button type="submit" class="sp2-btn-primary">Crear playlist</button>
      </div>
    </form>`, "Crear playlist");

  card?.querySelector("#sp2-create-form")?.addEventListener("submit", e => {
    e.preventDefault();
    const name = card.querySelector("#sp2-pl-name")?.value.trim();
    if (!name) { toast("Escribe un nombre para la playlist"); return; }
    const desc = card.querySelector("#sp2-pl-desc")?.value.trim() || "";
    const id = "pl-user-" + Date.now();
    DB.userPlaylists.push({ id, name, desc, owner: "Matyaz Paredes", img: null, songIds: [] });
    persistUserPlaylists();
    closeModal();
    toast(`Playlist "${name}" creada 🎉`);
    renderSidebar();
    location.href = routeUrl(`playlist/${id}`);
  });
}

function persistUserPlaylists() {
  Store.set("userPlaylists", DB.userPlaylists.map(p => ({
    id: p.id,
    name: p.name,
    desc: p.desc || "",
    owner: p.owner || "Matyaz Paredes",
    img: p.img || null,
    songIds: [...(p.songIds || [])],
  })));
}

/* ─── agregar canciones ─── */
function addSongsListHtml(pl, query = "") {
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const nq = norm(query);
  const songs = DB.songs.filter(s => {
    if (!nq) return true;
    const artist = DB.artist(s.artistId)?.name || "";
    return norm(`${s.title} ${artist}`).includes(nq);
  });

  if (!songs.length) {
    return `<p class="px-4 py-10 text-center text-sm text-[#a7a7a7]">No encontramos canciones para “${esc(query)}”.</p>`;
  }

  return songs.map(s => {
    const album = DB.album(s.albumId);
    const artist = DB.artist(s.artistId);
    const inPlaylist = pl.songIds.includes(s.id);
    return `<button type="button" class="sp2-add-song-row" data-add-song="${s.id}" aria-pressed="${inPlaylist}">
      <span class="h-10 w-10 shrink-0 rounded bg-cover bg-center" style="${coverBg(album || {}, "album")}"></span>
      <span class="min-w-0 flex-1 text-left">
        <span class="block truncate text-sm font-bold text-white">${esc(s.title)}</span>
        <span class="block truncate text-xs text-[#a7a7a7]">${esc(artist?.name || "")} · ${esc(album?.title || "")}</span>
      </span>
      <span class="sp2-add-song-action ${inPlaylist ? "added" : ""}">
        ${inPlaylist ? `${icon("check")} Agregada` : `${icon("plus")} Agregar`}
      </span>
    </button>`;
  }).join("");
}

function openAddSongsModal(playlistId) {
  const pl = DB.userPlaylists.find(p => p.id === playlistId);
  if (!pl) { toast("Solo puedes editar playlists creadas por ti"); return; }

  const card = openModal(`
    ${modalHead("Playlist", "Agregar canciones", `${esc(pl.name)} · <span id="sp2-add-count">${pl.songIds.length}</span> canciones`)}
    <div class="sp2-modal-search">
      <span>${icon("search")}</span>
      <input id="sp2-add-song-search" type="search" placeholder="Busca una canción o artista" aria-label="Buscar canción para agregar"/>
    </div>
    <div id="sp2-add-song-list" class="sp2-modal-list">${addSongsListHtml(pl)}</div>
    <div class="sp2-modal-actions">
      <button type="button" class="sp2-btn-primary" data-modal-close>Listo</button>
    </div>`, "Agregar canciones");

  if (!card) return;

  const list = card.querySelector("#sp2-add-song-list");
  const search = card.querySelector("#sp2-add-song-search");
  const count = card.querySelector("#sp2-add-count");

  const refresh = () => {
    if (list) list.innerHTML = addSongsListHtml(pl, search?.value || "");
    if (count) count.textContent = String(pl.songIds.length);
  };

  search?.addEventListener("input", refresh);

  list?.addEventListener("click", e => {
    const btn = e.target.closest("[data-add-song]");
    if (!btn) return;
    const sid = btn.getAttribute("data-add-song");
    const idx = pl.songIds.indexOf(sid);
    if (idx >= 0) {
      pl.songIds.splice(idx, 1);
      toast("Canción quitada de la playlist");
    } else {
      pl.songIds.push(sid);
      toast("Canción agregada a la playlist");
    }
    persistUserPlaylists();

    if (Player.context.type === "playlist" && Player.context.id === pl.id) {
      const current = Player.song?.id;
      Player.queue = [...pl.songIds];
      Player.index = Math.max(0, Player.queue.indexOf(current));
      savePlayerState();
      if (_queueOpen) renderQueuePanel(_queueTab);
    }

    refresh();
    if (getPage() === "detail" && getParams().get("tipo") === "playlist" && getParams().get("id") === pl.id) {
      rerenderCurrentPage();
    }
  });
}

/* ─── menú contextual ─── */
function openContextMenu(value) {
  const [type, id] = String(value || "").split(":");
  if (!type || !id) return;

  const label = collectionLabel(type, id);
  if (!label) return;

  const card = openModal(`
    ${modalHead("Opciones", label, type === "liked" ? "Playlist" : type.charAt(0).toUpperCase() + type.slice(1))}
    <div class="sp2-context-list">
      <button type="button" class="sp2-context-item" data-ctx="play"><span>${icon("play")}</span> Reproducir</button>
      <button type="button" class="sp2-context-item" data-ctx="shuffle"><span>${icon("shuffle")}</span> Reproducir en aleatorio</button>
      <button type="button" class="sp2-context-item" data-ctx="queue"><span>${icon("queue")}</span> Agregar a la cola</button>
      <button type="button" class="sp2-context-item" data-ctx="open"><span>${icon("external")}</span> Abrir detalles</button>
      <button type="button" class="sp2-context-item" data-ctx="share"><span>${icon("share")}</span> Copiar enlace</button>
    </div>`, "Opciones");

  if (!card) return;

  card.querySelectorAll("[data-ctx]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-ctx");
      if (action === "play") {
        closeModal();
        playCollectionFromType(type, id);
      } else if (action === "shuffle") {
        closeModal();
        shuffleCollection(type, id);
      } else if (action === "queue") {
        const ids = collectionSongIds(type, id);
        if (!ids.length) { toast("No hay canciones para agregar"); return; }
        Player.queue.push(...ids);
        dispatchPlayerChange();
        if (_queueOpen) renderQueuePanel(_queueTab);
        closeModal();
        toast(`${ids.length} canciones agregadas a la cola`);
      } else if (action === "open") {
        closeModal();
        location.href = routeUrl(`${type}/${id}`);
      } else if (action === "share") {
        copyText(new URL(routeUrl(`${type}/${id}`), location.href).href);
        closeModal();
      }
    });
  });
}

function copyText(text) {
  const done = () => toast("Enlace copiado al portapapeles");
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    done();
  } catch {
    toast("No se pudo copiar el enlace");
  }
}

/* ─── dispositivos ─── */
function openDevicesModal() {
  const current = Store.get("device") || "Este navegador";
  const devices = ["Este navegador", "Sala de estar", "Audífonos Bluetooth", "Parlante del auto"];
  const card = openModal(`
    ${modalHead("Reproducción", "Dispositivos", "Elige dónde quieres escuchar esta demo.")}
    <div class="sp2-context-list">
      ${devices.map(d => `<button type="button" class="sp2-context-item ${d === current ? "active" : ""}" data-device="${esc(d)}">
        <span>${icon(d === "Este navegador" ? "devices" : "speaker")}</span>
        <span class="flex-1 text-left">${esc(d)}</span>
        ${d === current ? `<span class="text-[#1ed760]">${icon("check")}</span>` : ""}
      </button>`).join("")}
    </div>
    <p class="mt-3 px-1 text-xs text-[#a7a7a7]">La selección es simulada; no se envía audio a otros dispositivos.</p>`, "Dispositivos");

  if (!card) return;
  card.querySelectorAll("[data-device]").forEach(btn => {
    btn.addEventListener("click", () => {
      const device = btn.getAttribute("data-device");
      Store.set("device", device);
      closeModal();
      toast(`Reproduciendo en ${device} (simulado)`);
      const devicesBtn = $("#sp2-player-devices");
      if (devicesBtn) devicesBtn.title = `Dispositivos · ${device}`;
    });
  });
}

/* ─── cerrar sesión ─── */
function openLogoutModal() {
  const card = openModal(`
    ${modalHead("Cuenta", "Cerrar sesión", "Esta acción es simulada.")}
    <p class="text-sm leading-relaxed text-[#a7a7a7]">No existe autenticación real en este proyecto. Tus playlists, likes y preferencias seguirán guardados en este navegador.</p>
    <div class="sp2-modal-actions">
      <button type="button" class="sp2-btn-secondary" data-modal-close>Cancelar</button>
      <button type="button" id="sp2-confirm-logout" class="sp2-btn-primary">Cerrar sesión</button>
    </div>`, "Cerrar sesión");

  card?.querySelector("#sp2-confirm-logout")?.addEventListener("click", () => {
    closeModal();
    closeMenus();
    toast("Sesión cerrada (demo). Tus datos locales se mantienen.");
  });
}

/* ─── controles del reproductor ─── */
function openNowPlaying() {
  const np = $("#sp2-now-playing");
  if (!np) return;
  clearTimeout(_npCloseTimer);
  np.classList.remove("invisible", "translate-y-full");
  np.classList.add("translate-y-0");
  np.setAttribute("aria-hidden", "false");
  document.body.classList.add("sp2-np-open");
  _nowPlayingOpen = true;
  renderPlayerUI();
  setTimeout(() => $("#sp2-np-close")?.focus(), 50);
}

function closeNowPlaying() {
  const np = $("#sp2-now-playing");
  if (!np || !_nowPlayingOpen) return;
  np.classList.add("translate-y-full");
  np.classList.remove("translate-y-0");
  np.setAttribute("aria-hidden", "true");
  document.body.classList.remove("sp2-np-open");
  _nowPlayingOpen = false;
  _npCloseTimer = setTimeout(() => np.classList.add("invisible"), 320);
}

function openQueuePanel(tab = "queue") {
  const panel = $("#sp2-queue-panel");
  if (!panel) return;
  clearTimeout(_queueCloseTimer);
  panel.classList.remove("translate-x-full", "invisible");
  panel.classList.add("translate-x-0");
  panel.setAttribute("aria-hidden", "false");
  _queueOpen = true;
  _queueTab = tab;
  renderQueuePanel(tab);
  setTimeout(() => $("#sp2-queue-close")?.focus(), 50);
}

function closeQueuePanel() {
  const panel = $("#sp2-queue-panel");
  if (!panel || !_queueOpen) return;
  panel.classList.add("translate-x-full");
  panel.classList.remove("translate-x-0");
  panel.setAttribute("aria-hidden", "true");
  _queueOpen = false;
  _queueCloseTimer = setTimeout(() => panel.classList.add("invisible"), 320);
}

function toggleQueuePanel(tab = "queue") {
  if (_queueOpen) closeQueuePanel();
  else openQueuePanel(tab);
}

function refreshCollectionPlayIcons() {
  document.querySelectorAll("[data-collection-play]").forEach(btn => {
    const [type, id] = btn.getAttribute("data-collection-play").split(":");
    const active = Player.context.type === type && Player.context.id === id;
    const span = btn.querySelector("span");
    if (span) span.innerHTML = icon(active && Player.playing ? "pause" : "play");
  });
}

function initPlayerEvents() {
  ["sp2-btn-play", "sp2-mini-play", "sp2-np-play"].forEach(id => {
    const btn = document.getElementById(id);
    btn?.addEventListener("click", e => {
      if (id === "sp2-mini-play") e.stopPropagation();
      togglePlay();
    });
  });

  ["sp2-btn-prev", "sp2-np-prev"].forEach(id => {
    document.getElementById(id)?.addEventListener("click", () => playPrev());
  });
  ["sp2-btn-next", "sp2-np-next"].forEach(id => {
    document.getElementById(id)?.addEventListener("click", () => playNext());
  });
  ["sp2-btn-shuffle", "sp2-np-shuffle"].forEach(id => {
    document.getElementById(id)?.addEventListener("click", () => toggleShuffle());
  });
  ["sp2-btn-repeat", "sp2-np-repeat"].forEach(id => {
    document.getElementById(id)?.addEventListener("click", () => toggleRepeat());
  });

  $("#sp2-btn-mute")?.addEventListener("click", () => toggleMute());

  $("#sp2-volume")?.addEventListener("input", e => setVolume(Number(e.target.value) / 100));

  $("#sp2-progress")?.addEventListener("input", e => {
    seekTo((Number(e.target.value) / 100) * Player.duration);
  });
  $("#sp2-np-progress")?.addEventListener("input", e => {
    seekTo((Number(e.target.value) / 100) * Player.duration);
  });

  ["sp2-like", "sp2-np-like"].forEach(id => {
    document.getElementById(id)?.addEventListener("click", () => {
      if (Player.song) toggleLike(Player.song.id);
      else toast("Elige una canción primero");
    });
  });

  $("#sp2-btn-queue")?.addEventListener("click", () => toggleQueuePanel("queue"));
  $("#sp2-queue-close")?.addEventListener("click", closeQueuePanel);
  $("#sp2-np-close")?.addEventListener("click", closeNowPlaying);

  $$(".sp2-queue-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      _queueTab = btn.getAttribute("data-queue-tab") || "queue";
      renderQueuePanel(_queueTab);
    });
  });

  const mini = $("#sp2-mini-player");
  mini?.addEventListener("click", e => {
    if (e.target.closest("#sp2-mini-play")) return;
    openNowPlaying();
  });
  mini?.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openNowPlaying();
    }
  });

  const openCurrentAlbum = () => {
    if (Player.song?.albumId) location.href = routeUrl(`album/${Player.song.albumId}`);
    else toast("Elige una canción primero");
  };

  const playerCover = $("#sp2-player-cover");
  playerCover?.addEventListener("click", openCurrentAlbum);
  $("#sp2-player-title")?.addEventListener("click", openCurrentAlbum);
  $("#sp2-player-artist")?.addEventListener("click", () => {
    if (Player.song?.artistId) location.href = routeUrl(`artist/${Player.song.artistId}`);
    else toast("Elige una canción primero");
  });

  $("#sp2-player-devices")?.addEventListener("click", openDevicesModal);

  $("#sp2-install-btn")?.addEventListener("click", () => {
    toast("Esta demo es una web estática. Usa el menú del navegador para agregarla a tu pantalla de inicio.");
  });

  $("#sp2-np-more")?.addEventListener("click", () => {
    if (!Player.song) { toast("Elige una canción primero"); return; }
    const type = Player.context.type || "playlist";
    const id = Player.context.id || "pl-topglobal";
    if (type === "playlist" || type === "album" || type === "artist" || type === "liked") {
      openContextMenu(`${type}:${id}`);
    } else {
      openContextMenu(`playlist:pl-topglobal`);
    }
  });
}

/* ─── teclado ─── */
function initKeyboard() {
  document.addEventListener("keydown", e => {
    const tag = (e.target.tagName || "").toLowerCase();
    const typing = tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (getPage() === "search") $("#sp2-search-input")?.focus();
      else location.href = "buscar.html";
      return;
    }

    if (e.key === "Escape") {
      closeModal();
      closeQueuePanel();
      closeNowPlaying();
      closeMenus();
      return;
    }

    if (typing || e.target.closest("button, a, [role='button']")) return;

    if (e.code === "Space") {
      e.preventDefault();
      togglePlay();
    } else if (e.code === "ArrowRight") {
      e.preventDefault();
      seekTo(Player.currentTime + 5);
    } else if (e.code === "ArrowLeft") {
      e.preventDefault();
      seekTo(Player.currentTime - 5);
    } else if (e.code === "ArrowUp") {
      e.preventDefault();
      setVolume(Player.volume + 0.05);
    } else if (e.code === "ArrowDown") {
      e.preventDefault();
      setVolume(Player.volume - 0.05);
    } else if (e.key.toLowerCase() === "m") {
      e.preventDefault();
      toggleMute();
    }
  });

  $("#sp2-view")?.addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const row = e.target.closest("[data-play-song]");
    if (!row || e.target !== row) return;
    e.preventDefault();
    onPlaySongClick(row);
  });
}

/* ─── cambios del reproductor ─── */
function onPlayerChange() {
  renderPlayerUI();
  renderLikeButtons();
  setActiveSongRow();
  renderSidebar();
  updateAccountUI();
  refreshCollectionPlayIcons();
  if (_queueOpen) renderQueuePanel(_queueTab);
}

function updateAccountUI() {
  const plan = Store.get("plan") || "free";
  const planName = plan === "free" ? "Plan Free" : (DB.plan(plan)?.name || "Premium");
  const el = $("#sp2-profile-plan");
  if (el) el.textContent = planName;
}

/* ─── init ─── */
function init() {
  mountShell();

  initHeader();
  initHeaderMenus();
  initSidebar();
  initPlayerEvents();
  initKeyboard();

  document.addEventListener("click", onDocumentClick);
  document.addEventListener("change", onDocumentChange);
  document.addEventListener("click", e => {
    if (e.target.closest("#sp2-profile-btn, #sp2-notif-btn, #sp2-profile-menu, #sp2-notif-menu")) return;
    closeMenus();
  });

  window.addEventListener("sp2:playerchange", onPlayerChange);

  const view = $("#sp2-view");
  view?.addEventListener("scroll", updateHeaderBg, { passive: true });

  renderCurrentPage();
  renderPlayerUI();
  updateAccountUI();
  updateHeaderBg();

  const device = Store.get("device");
  const devicesBtn = $("#sp2-player-devices");
  if (device && devicesBtn) devicesBtn.title = `Dispositivos · ${device}`;

  document.body.classList.add("sp2-ready");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
