/* =====================================================================
 * Spotify-dos — Script principal (router, eventos, sidebar, etc.)
 * ================================================================== */

// Referencia a los IDs de playlists por defecto (para el modal de creación)
const DEFAULT_USER_PLAYLISTS = ["pl-mia","pl-tarea","pl-toca"];

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

/* ─── router ─── */
const navHist = [];
let navIdx = -1;
let _queueTab = "queue";

function parseHash() {
  const hash = location.hash || "#/";
  const parts = hash.replace(/^#\//, "").split("/");
  return { name: parts[0] || "home", id: parts[1], hash };
}

function routeToHtml(r) {
  switch (r.name) {
    case "search":   return renderSearch(searchState.query);
    case "library":  return renderLibrary();
    case "playlist": return renderPlaylist(r.id);
    case "album":    return renderAlbum(r.id);
    case "artist":   return renderArtist(r.id);
    case "liked":    return renderLiked();
    case "genre":    return renderGenre(r.id);
    case "premium":  return renderPremium();
    case "account":  return renderAccount();
    default:         return renderHome();
  }
}

function applyNavActive(r) {
  const key = ["playlist","album","artist","liked","genre"].includes(r.name) ? "" : r.name;
  $$("[data-nav]").forEach(a => {
    const on = a.getAttribute("data-nav") === key;
    a.classList.toggle("text-white", on);
    a.classList.toggle("text-[#a7a7a7]", !on);
  });
  $$("[data-nav2]").forEach(a => {
    const on = a.getAttribute("data-nav2") === key;
    a.classList.toggle("text-white", on);
    a.classList.toggle("text-[#a7a7a7]", !on);
  });
}

function updateNavBtns() {
  const b = $("#sp2-btn-back"), f = $("#sp2-btn-fwd");
  if (b) b.disabled = navIdx <= 0;
  if (f) f.disabled = navIdx >= navHist.length - 1;
}

function renderRoute() {
  const r = parseHash();
  if (navHist[navIdx] !== r.hash) {
    if (navIdx < navHist.length - 1) navHist.length = navIdx + 1;
    navHist.push(r.hash);
    navIdx = navHist.length - 1;
  }
  const view = $("#sp2-view");
  if (!view) return;
  view.innerHTML = routeToHtml(r);
  view.scrollTop = 0;
  applyNavActive(r);
  updateNavBtns();
  renderLikeButtons();
  setActiveSongRow();
  bindViewEvents(r);
  // anim
  view.style.opacity = "0";
  requestAnimationFrame(() => { view.style.transition = "opacity .15s"; view.style.opacity = "1"; });
  updateHeaderBg();
}

function navigate(link) {
  location.hash = "#/" + link;
}

/* ─── header dinámica (color según scroll) ─── */
function updateHeaderBg() {
  const header = $("#sp2-topbar");
  const view = $("#sp2-view");
  if (!header || !view) return;
  const scroll = view.scrollTop;
  const alpha = Math.min(scroll / 120, 1);
  header.style.backgroundColor = `rgba(18,18,18,${alpha})`;
}

/* ─── sidebar ─── */
function renderSidebar() {
  const list = $("#sp2-lib-list");
  if (!list) return;
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const q = norm(sidebarLibState.query || "");
  const filter = sidebarLibState.filter || "all";
  const items = libraryItems();

  const filtered = items.filter(it => {
    if (filter !== "all" && it.type !== filter && !(filter === "playlist" && it.type === "liked")) return false;
    if (q && !norm(`${it.name} ${it.sub}`).includes(q)) return false;
    return true;
  });

  list.innerHTML = filtered.map(it => {
    const bg   = it.img ? `background-image:url('${it.img}');background-size:cover;background-position:center` : "background:linear-gradient(135deg,#333,#111)";
    const round = it.type === "artist" ? "rounded-full" : "rounded-sm";
    const lnk  = it.type === "liked" ? "liked" : `${it.type}/${it.id}`;
    const isActive = Player.context.id === it.id || (it.type === "liked" && Player.context.type === "liked");
    return `
<a href="#/${lnk}" class="group flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.07] ${isActive ? "bg-white/[0.05]" : ""}" data-link="${lnk}">
  <span class="h-10 w-10 shrink-0 overflow-hidden ${round}" style="${bg}"></span>
  <div class="min-w-0 flex-1 hidden sidebar-expanded:block">
    <p class="truncate text-sm font-semibold leading-tight ${isActive ? "text-[#1ed760]" : "text-white"}">${esc(it.name)}</p>
    <p class="truncate text-xs text-[#a7a7a7]">${esc(it.sub)}</p>
  </div>
</a>`;
  }).join("") || `<p class="px-4 py-6 text-xs text-[#a7a7a7] text-center">Sin resultados</p>`;
}

const sidebarLibState = { filter: "all", query: "" };

/* ─── events dentro de la vista ─── */
function bindViewEvents(r) {
  // search input
  if (r.name === "search") {
    const inp = $("#sp2-search-input");
    if (inp) {
      inp.focus({ preventScroll: true });
      inp.addEventListener("input", () => {
        searchState.query = inp.value;
        $("#sp2-view").innerHTML = renderSearch(searchState.query);
        bindViewEvents(r);
        renderLikeButtons();
      });
    }
  }
  // library search
  const libInp = $("#sp2-lib-search");
  if (libInp) {
    libInp.addEventListener("input", () => {
      libState.query = libInp.value;
      refreshLibPage();
    });
  }
  // lib filter chips on page
  $$("[data-lib-filter-page]").forEach(btn => {
    btn.addEventListener("click", () => {
      libState.filter = btn.getAttribute("data-lib-filter-page");
      refreshLibPage();
    });
  });
  // billing tabs in premium
  $$("[data-billing]").forEach(btn => {
    btn.addEventListener("click", () => {
      Store.set("billing", btn.getAttribute("data-billing"));
      renderRoute();
    });
  });
  // plan selection
  $$("[data-choose-plan]").forEach(btn => {
    btn.addEventListener("click", () => {
      const pid = btn.getAttribute("data-choose-plan");
      Store.set("plan", pid);
      toast(pid === "free" ? "Plan Free activado" : `${DB.plan(pid)?.name || "Premium"} activado 🎉`);
      renderRoute();
      updateAccountUI();
    });
  });
  // settings
  $$("[data-setting]").forEach(inp => {
    inp.addEventListener("change", () => {
      const key = inp.getAttribute("data-setting");
      const s = { ...(Store.get("settings") || {}) };
      s[key] = inp.type === "checkbox" ? inp.checked : inp.value;
      Store.set("settings", s);
      toast("Preferencia guardada");
    });
  });
}

function refreshLibPage() {
  const view = $("#sp2-view");
  const scroll = view.scrollTop;
  view.innerHTML = renderLibrary();
  view.scrollTop = scroll;
  bindViewEvents({ name: "library" });
}

/* ─── click global sobre la vista ─── */
function onViewClick(e) {
  const target = e.target.closest("[data-link],[data-card],[data-play-song],[data-collection-play],[data-shuffle-collection],[data-like],[data-follow-artist],[data-save-album],[data-add-songs],[data-more-context],[data-queue-play],[data-create-playlist],[data-action]");
  if (!target) return;

  if (target.hasAttribute("data-play-song")) {
    e.preventDefault(); e.stopPropagation();
    const sid = target.getAttribute("data-play-song");
    const qType = target.getAttribute("data-queue-type") || "playlist";
    const qId   = target.getAttribute("data-queue-id")   || "pl-topglobal";
    let queueIds = [];
    if (qType === "playlist") queueIds = DB.playlist(qId)?.songIds || [sid];
    else if (qType === "album") queueIds = DB.album(qId)?.songs.map(s => s[0]) || [sid];
    else if (qType === "artist") queueIds = DB.albums.filter(a => a.artistId === qId).flatMap(a => a.songs.map(s => s[0]));
    else if (qType === "liked") queueIds = [...Player.liked];
    else if (qType === "search") queueIds = [sid];
    playSong(sid, queueIds.length ? queueIds : [sid], qType, qId, "");
    renderPlayerUI();
    renderSidebar();
    return;
  }

  if (target.hasAttribute("data-collection-play")) {
    e.preventDefault(); e.stopPropagation();
    const [type, id] = target.getAttribute("data-collection-play").split(":");
    playCollection(type, id);
    renderPlayerUI();
    renderSidebar();
    return;
  }

  if (target.hasAttribute("data-shuffle-collection")) {
    e.preventDefault(); e.stopPropagation();
    const [type, id] = target.getAttribute("data-shuffle-collection").split(":");
    shuffleCollection(type, id);
    renderPlayerUI();
    return;
  }

  if (target.hasAttribute("data-like")) {
    e.preventDefault(); e.stopPropagation();
    toggleLike(target.getAttribute("data-like"));
    renderLikeButtons();
    renderSidebar();
    renderPlayerUI();
    return;
  }

  if (target.hasAttribute("data-follow-artist")) {
    e.preventDefault(); e.stopPropagation();
    toggleSaveArtist(target.getAttribute("data-follow-artist"));
    renderRoute();
    renderSidebar();
    return;
  }

  if (target.hasAttribute("data-save-album")) {
    e.preventDefault(); e.stopPropagation();
    toggleSaveAlbum(target.getAttribute("data-save-album"));
    renderRoute();
    renderSidebar();
    return;
  }

  if (target.hasAttribute("data-queue-play")) {
    e.preventDefault(); e.stopPropagation();
    const sid = target.getAttribute("data-queue-play");
    const song = DB.song(sid);
    if (song) { Player.song = song; Player.index = Player.queue.indexOf(sid); Player.currentTime = 0; Player.duration = song.duration || 180; Player.playing = true; }
    renderPlayerUI();
    renderQueuePanel(_queueTab);
    return;
  }

  if (target.hasAttribute("data-create-playlist")) {
    e.preventDefault(); e.stopPropagation();
    openCreatePlaylistModal();
    return;
  }

  if (target.hasAttribute("data-action")) {
    const act = target.getAttribute("data-action");
    if (act === "logout") { toast("Sesión cerrada (demo)"); }
    return;
  }

  // navigation
  const link = target.getAttribute("data-link") ?? target.getAttribute("href")?.replace(/^#\//, "");
  if (link !== null && link !== undefined) {
    e.preventDefault();
    navigate(link);
  }
}

/* ─── Player UI eventos ─── */
function initPlayerEvents() {
  // play/pause
  ["sp2-btn-play","sp2-mini-play","sp2-np-play"].forEach(id => {
    $("#" + id)?.addEventListener("click", () => { togglePlay(); renderPlayerUI(); });
  });
  // prev/next
  $("#sp2-btn-prev")?.addEventListener("click", () => { playPrev(); renderPlayerUI(); });
  $("#sp2-btn-next")?.addEventListener("click", () => { playNext(); renderPlayerUI(); });
  $("#sp2-np-prev")?.addEventListener("click",  () => { playPrev(); renderPlayerUI(); });
  $("#sp2-np-next")?.addEventListener("click",  () => { playNext(); renderPlayerUI(); });
  // shuffle
  $("#sp2-btn-shuffle")?.addEventListener("click", () => { toggleShuffle(); renderPlayerUI(); });
  // repeat
  $("#sp2-btn-repeat")?.addEventListener("click",  () => { toggleRepeat();  renderPlayerUI(); });
  // mute
  $("#sp2-btn-mute")?.addEventListener("click", () => { toggleMute(); renderPlayerUI(); });
  // volume
  $("#sp2-volume")?.addEventListener("input", e => { setVolume(e.target.value / 100); updateVolumeIcon(); });
  // seek
  $("#sp2-progress")?.addEventListener("input", e => { seekTo((e.target.value / 100) * Player.duration); });
  // like in player
  $("#sp2-like")?.addEventListener("click", () => { if (Player.song) { toggleLike(Player.song.id); renderPlayerUI(); renderLikeButtons(); } });
  $("#sp2-np-like")?.addEventListener("click", () => { if (Player.song) { toggleLike(Player.song.id); renderPlayerUI(); renderLikeButtons(); } });
  // mini player → open now playing
  $("#sp2-mini-player")?.addEventListener("click", e => {
    if (e.target.closest("#sp2-mini-play")) return;
    openNowPlaying();
  });
  // close now playing
  $("#sp2-np-close")?.addEventListener("click", closeNowPlaying);
  // queue panel
  $("#sp2-btn-queue")?.addEventListener("click", () => toggleQueuePanel("queue"));
  $("#sp2-queue-close")?.addEventListener("click", closeQueuePanel);
  $$(".sp2-queue-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      _queueTab = btn.getAttribute("data-queue-tab");
      $$(".sp2-queue-tab").forEach(b => {
        b.classList.toggle("bg-white", b === btn);
        b.classList.toggle("text-black", b === btn);
        b.classList.toggle("bg-white/10", b !== btn);
        b.classList.toggle("text-white", b !== btn);
      });
      renderQueuePanel(_queueTab);
    });
  });
}

let _nowPlayingOpen = false;
function openNowPlaying() {
  const np = $("#sp2-now-playing");
  if (!np) return;
  np.classList.remove("translate-y-full", "invisible");
  np.classList.add("translate-y-0");
  _nowPlayingOpen = true;
  renderPlayerUI();
}
function closeNowPlaying() {
  const np = $("#sp2-now-playing");
  if (!np) return;
  np.classList.add("translate-y-full");
  np.classList.remove("translate-y-0");
  setTimeout(() => np.classList.add("invisible"), 300);
  _nowPlayingOpen = false;
}

let _queueOpen = false;
function toggleQueuePanel(tab = "queue") {
  _queueOpen ? closeQueuePanel() : openQueuePanel(tab);
}
function openQueuePanel(tab = "queue") {
  const panel = $("#sp2-queue-panel");
  if (!panel) return;
  panel.classList.remove("translate-x-full", "invisible");
  panel.classList.add("translate-x-0");
  _queueOpen = true;
  _queueTab = tab;
  renderQueuePanel(tab);
}
function closeQueuePanel() {
  const panel = $("#sp2-queue-panel");
  if (!panel) return;
  panel.classList.add("translate-x-full");
  panel.classList.remove("translate-x-0");
  setTimeout(() => panel.classList.add("invisible"), 300);
  _queueOpen = false;
}

/* ─── sidebar library chips ─── */
function initSidebarChips() {
  $$("[data-lib-chip]").forEach(btn => {
    btn.addEventListener("click", () => {
      sidebarLibState.filter = btn.getAttribute("data-lib-chip");
      $$("[data-lib-chip]").forEach(b => {
        b.classList.toggle("bg-white", b === btn);
        b.classList.toggle("text-black", b === btn);
        b.classList.toggle("bg-white/10", b !== btn);
        b.classList.toggle("text-white", b !== btn);
      });
      renderSidebar();
    });
  });

  // sidebar search toggle
  $("#sp2-lib-search-btn")?.addEventListener("click", () => {
    const wrap = $("#sp2-lib-search-wrap");
    wrap?.classList.toggle("hidden");
    if (!wrap?.classList.contains("hidden")) {
      const inp = $("#sp2-lib-search-sidebar");
      inp?.focus();
      inp?.addEventListener("input", () => { sidebarLibState.query = inp.value; renderSidebar(); });
    }
  });

  // create playlist
  $("#sp2-lib-create")?.addEventListener("click", openCreatePlaylistModal);
}

/* ─── header search ─── */
function initHeaderSearch() {
  const inp = $("#sp2-header-search");
  if (!inp) return;
  inp.addEventListener("focus", () => { if (parseHash().name !== "search") navigate("search"); });
  inp.addEventListener("input", () => {
    searchState.query = inp.value;
    if (parseHash().name === "search") {
      const v = $("#sp2-view");
      v.innerHTML = renderSearch(searchState.query);
      bindViewEvents({ name: "search" });
      renderLikeButtons();
    }
  });
}

/* ─── back/forward ─── */
function initBackForward() {
  $("#sp2-btn-back")?.addEventListener("click", () => {
    if (navIdx > 0) { navIdx--; location.hash = navHist[navIdx]; }
  });
  $("#sp2-btn-fwd")?.addEventListener("click", () => {
    if (navIdx < navHist.length - 1) { navIdx++; location.hash = navHist[navIdx]; }
  });
}

/* ─── profile menu ─── */
function initProfileMenu() {
  const btn  = $("#sp2-profile-btn");
  const menu = $("#sp2-profile-menu");
  if (!btn || !menu) return;
  btn.addEventListener("click", e => { e.stopPropagation(); menu.classList.toggle("hidden"); });
  document.addEventListener("click", () => menu?.classList.add("hidden"));
  menu.querySelectorAll("[data-menu-link]").forEach(item => {
    item.addEventListener("click", () => { navigate(item.getAttribute("data-menu-link")); menu.classList.add("hidden"); });
  });
}

/* ─── account UI ─── */
function updateAccountUI() {
  const plan = Store.get("plan") || "free";
  const planName = plan === "free" ? "Plan Free" : (DB.plan(plan)?.name || "Premium");
  const el = $("#sp2-profile-plan");
  if (el) el.textContent = planName;
}

/* ─── crear playlist modal ─── */
function openCreatePlaylistModal() {
  const modal = $("#sp2-modal");
  if (!modal) return;
  modal.innerHTML = `
<div class="bg-[#282828] rounded-2xl p-7 w-full max-w-md shadow-2xl" id="sp2-modal-card">
  <h2 class="text-xl font-black text-white mb-5">Crear playlist</h2>
  <div class="mb-4">
    <label class="text-xs font-bold uppercase tracking-wider text-[#a7a7a7] block mb-2">Nombre</label>
    <input id="sp2-pl-name" type="text" placeholder="Mi playlist" maxlength="60"
      class="w-full rounded-lg bg-white/10 border border-white/20 text-white px-4 py-3 text-sm placeholder:text-[#a7a7a7] focus:outline-none focus:border-white/50"/>
  </div>
  <div class="mb-5">
    <label class="text-xs font-bold uppercase tracking-wider text-[#a7a7a7] block mb-2">Descripción (opcional)</label>
    <textarea id="sp2-pl-desc" placeholder="Dale una descripción a tu playlist..." rows="3" maxlength="200"
      class="w-full rounded-lg bg-white/10 border border-white/20 text-white px-4 py-3 text-sm placeholder:text-[#a7a7a7] focus:outline-none focus:border-white/50 resize-none"></textarea>
  </div>
  <div class="flex gap-3 justify-end">
    <button id="sp2-modal-cancel" class="rounded-full border border-white/30 px-5 py-2.5 text-sm font-bold text-white hover:border-white transition">Cancelar</button>
    <button id="sp2-modal-save"   class="rounded-full bg-[#1ed760] px-5 py-2.5 text-sm font-black text-black hover:bg-[#3be477] transition">Crear</button>
  </div>
</div>`;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  $("#sp2-pl-name")?.focus();
  $("#sp2-modal-cancel")?.addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  $("#sp2-modal-save")?.addEventListener("click", () => {
    const name = $("#sp2-pl-name")?.value?.trim();
    if (!name) { toast("Escribe un nombre para la playlist"); return; }
    const desc = $("#sp2-pl-desc")?.value?.trim() || "";
    const id = "pl-user-" + Date.now();
    const newPl = { id, name, desc, owner: "Matyaz Paredes", img: null, songIds: [] };
    DB.userPlaylists.push(newPl);
    Store.set("userPlaylists", DB.userPlaylists.filter(p => !DEFAULT_USER_PLAYLISTS.some(d => d.id === p.id)));
    toast(`Playlist "${name}" creada 🎉`);
    closeModal();
    renderSidebar();
    navigate(`playlist/${id}`);
  });
}

function closeModal() {
  const modal = $("#sp2-modal");
  modal?.classList.add("hidden");
  modal?.classList.remove("flex");
}

/* ─── keyboard ─── */
function initKeyboard() {
  document.addEventListener("keydown", e => {
    const tag = (e.target.tagName || "").toLowerCase();
    const typing = tag === "input" || tag === "textarea" || tag === "select";

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      navigate("search");
      setTimeout(() => $("#sp2-search-input")?.focus(), 100);
      return;
    }
    if (e.key === "Escape") { closeModal(); closeQueuePanel(); closeNowPlaying(); return; }
    if (typing) return;
    if (e.code === "Space") { e.preventDefault(); togglePlay(); renderPlayerUI(); }
    else if (e.code === "ArrowRight") { e.preventDefault(); seekTo(Player.currentTime + 5); }
    else if (e.code === "ArrowLeft")  { e.preventDefault(); seekTo(Player.currentTime - 5); }
    else if (e.code === "ArrowUp")    { e.preventDefault(); setVolume(Player.volume + 0.05); updateVolumeIcon(); }
    else if (e.code === "ArrowDown")  { e.preventDefault(); setVolume(Player.volume - 0.05); updateVolumeIcon(); }
  });
}

/* ─── player change event ─── */
window.addEventListener("sp2:playerchange", () => {
  renderPlayerUI();
  renderLikeButtons();
  setActiveSongRow();
  renderSidebar();
  if (_queueOpen) renderQueuePanel(_queueTab);
  updateAccountUI();
});

/* ─── hashchange ─── */
window.addEventListener("hashchange", () => {
  renderRoute();
  renderSidebar();
  closeNowPlaying();
});

/* ─── scroll on view for header ─── */
/* ─── INIT ─── */
function init() {
  initPlayerEvents();
  initBackForward();
  initSidebarChips();
  initHeaderSearch();
  initProfileMenu();
  initKeyboard();
  updateAccountUI();

  const view = $("#sp2-view");
  view?.addEventListener("click", onViewClick);
  view?.addEventListener("scroll", updateHeaderBg, { passive: true });

  renderSidebar();
  renderRoute();
  renderPlayerUI();
}

document.addEventListener("DOMContentLoaded", init);
