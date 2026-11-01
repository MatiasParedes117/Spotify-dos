/* =====================================================================
 * Spotify-dos — Shell compartido
 * Inyecta header, sidebar, reproductor y navegación en todas las páginas.
 * ================================================================== */

const NAV_ITEMS = [
  { key: "home",    label: "Inicio",     href: "index.html",      icon: "home" },
  { key: "search",  label: "Buscar",     href: "buscar.html",     icon: "search" },
  { key: "library", label: "Biblioteca", href: "biblioteca.html", icon: "library" },
  { key: "explore", label: "Explorar",   href: "explorar.html",   icon: "globe" },
  { key: "about",   label: "Acerca de",  href: "acerca.html",     icon: "info" },
];

const SHELL_ICONS = {
  "sp2-icon-logo": "logo",
  "sp2-ico-back": "chevron-left",
  "sp2-ico-fwd": "chevron-right",
  "sp2-ico-search": "search",
  "sp2-ico-bell": "bell",
  "sp2-ico-chdown": "chevron-down",
  "sp2-ico-user": "user",
  "sp2-ico-star": "premium",
  "sp2-ico-info": "info",
  "sp2-ico-logout": "logout",
  "sp2-ico-lib": "library",
  "sp2-ico-lib-search": "search",
  "sp2-ico-lib-plus": "plus",
  "sp2-ico-libsrch2": "search",
  "sp2-ico-shuffle": "shuffle",
  "sp2-ico-prev": "prev",
  "sp2-ico-play": "play",
  "sp2-ico-next": "next",
  "sp2-ico-repeat": "repeat",
  "sp2-ico-queue": "queue",
  "sp2-ico-devices": "devices",
  "sp2-ico-vol": "volume",
  "sp2-ico-mini-play": "play",
  "sp2-ico-npdown": "chevron-down",
  "sp2-ico-npmore": "more",
  "sp2-ico-npsh": "shuffle",
  "sp2-ico-npprev": "prev",
  "sp2-ico-npplay": "play",
  "sp2-ico-npnext": "next",
  "sp2-ico-nprep": "repeat",
  "sp2-ico-qclose": "close",
  "sp2-ico-install": "download",
};

function topbarHtml() {
  return `
    <a href="index.html" class="sp2-logo-wrap" aria-label="Spotify Clone, ir al inicio">
      <span class="sp2-logo-icon" id="sp2-icon-logo"></span>
      <span class="sp2-logo-text">Spotify<span>.</span></span>
    </a>

    <div class="sp2-history-actions">
      <button id="sp2-btn-back" class="sp2-nav-btn" aria-label="Atrás" title="Atrás">
        <span id="sp2-ico-back"></span>
      </button>
      <button id="sp2-btn-fwd" class="sp2-nav-btn" aria-label="Adelante" title="Adelante">
        <span id="sp2-ico-fwd"></span>
      </button>
    </div>

    <form id="sp2-header-search-form" class="sp2-search-bar" role="search">
      <span class="sp2-search-icon" id="sp2-ico-search"></span>
      <input id="sp2-header-search" type="search" autocomplete="off"
        placeholder="¿Qué quieres escuchar?" aria-label="Buscar en Spotify Clone" />
      <kbd class="sp2-kbd">Ctrl K</kbd>
    </form>

    <div class="sp2-topbar-actions">
      <a href="premium.html" class="sp2-premium-link topbar-desktop">Explorar Premium</a>

      <button type="button" id="sp2-install-btn" class="sp2-tool-btn topbar-desktop" aria-label="Instalar app" title="Instalar app">
        <span id="sp2-ico-install"></span>
      </button>

      <div class="relative">
        <button type="button" id="sp2-notif-btn" class="sp2-tool-btn sp2-notif-btn" aria-label="Notificaciones" aria-haspopup="true" aria-expanded="false" title="Notificaciones">
          <span id="sp2-ico-bell"></span>
          <span class="sp2-notif-dot" aria-hidden="true"></span>
        </button>
        <div id="sp2-notif-menu" class="sp2-dropdown sp2-dropdown--wide hidden" role="menu" aria-label="Notificaciones">
          <p class="sp2-dropdown-label">Novedades</p>
          <button type="button" class="sp2-menu-item" data-notif-action="new-release" role="menuitem">
            <span class="text-[#1ed760]">${icon("radio")}</span>
            <span>Nuevo álbum de Bad Bunny disponible</span>
          </button>
          <button type="button" class="sp2-menu-item" data-notif-action="playlist" role="menuitem">
            <span class="text-[#1ed760]">${icon("add-list")}</span>
            <span>Tu Daily Mix 1 se actualizó</span>
          </button>
          <button type="button" class="sp2-menu-item" data-notif-action="premium" role="menuitem">
            <span class="text-[#1ed760]">${icon("premium")}</span>
            <span>Conoce los planes Premium</span>
          </button>
        </div>
      </div>

      <div class="relative">
        <button type="button" class="sp2-profile-btn" id="sp2-profile-btn" aria-label="Menú de perfil" aria-haspopup="true" aria-expanded="false">
          <span class="sp2-avatar">MP</span>
          <span id="sp2-ico-chdown" class="topbar-desktop sp2-profile-caret"></span>
        </button>
        <div id="sp2-profile-menu" class="sp2-dropdown hidden" role="menu" aria-label="Perfil">
          <div class="sp2-dropdown-profile">
            <p class="sp2-dropdown-name">Matyaz Paredes</p>
            <p id="sp2-profile-plan" class="sp2-dropdown-plan">Plan Free</p>
          </div>
          <div class="sp2-menu-divider"></div>
          <a class="sp2-menu-item" href="cuenta.html" role="menuitem"><span id="sp2-ico-user" class="sp2-menu-icon"></span> Cuenta</a>
          <a class="sp2-menu-item" href="premium.html" role="menuitem"><span id="sp2-ico-star" class="sp2-menu-icon"></span> Planes Premium</a>
          <a class="sp2-menu-item" href="acerca.html" role="menuitem"><span id="sp2-ico-info" class="sp2-menu-icon"></span> Acerca del proyecto</a>
          <div class="sp2-menu-divider"></div>
          <button type="button" class="sp2-menu-item" data-action="logout" role="menuitem"><span id="sp2-ico-logout" class="sp2-menu-icon"></span> Cerrar sesión</button>
        </div>
      </div>
    </div>`;
}

function sidebarHtml() {
  return `
    <div class="sp2-lib-header">
      <a class="sp2-lib-title-btn" href="biblioteca.html" aria-label="Tu biblioteca">
        <span id="sp2-ico-lib" class="sp2-lib-title-icon"></span>
        <span>Tu biblioteca</span>
      </a>
      <button type="button" class="sp2-lib-icon-btn" id="sp2-lib-search-btn" aria-label="Buscar en tu biblioteca" title="Buscar">
        <span id="sp2-ico-lib-search"></span>
      </button>
      <button type="button" class="sp2-lib-icon-btn" id="sp2-lib-create" aria-label="Crear playlist" title="Crear playlist">
        <span id="sp2-ico-lib-plus"></span>
      </button>
    </div>

    <div id="sp2-lib-search-wrap" class="sp2-lib-search-wrap hidden">
      <div class="sp2-lib-search-field">
        <span class="sp2-lib-search-icon" id="sp2-ico-libsrch2"></span>
        <input id="sp2-lib-search-sidebar" type="search" placeholder="Buscar en tu biblioteca" aria-label="Buscar biblioteca" />
      </div>
    </div>

    <div class="sp2-lib-chips" role="group" aria-label="Filtrar biblioteca">
      <button type="button" class="sp2-lib-chip active" data-lib-chip="all" aria-pressed="true">Todas</button>
      <button type="button" class="sp2-lib-chip" data-lib-chip="playlist" aria-pressed="false">Playlists</button>
      <button type="button" class="sp2-lib-chip" data-lib-chip="album" aria-pressed="false">Álbumes</button>
      <button type="button" class="sp2-lib-chip" data-lib-chip="artist" aria-pressed="false">Artistas</button>
    </div>

    <div id="sp2-lib-list" class="sp2-lib-list scroll-area"></div>

    <nav class="sp2-side-links" aria-label="Secciones principales">
      ${NAV_ITEMS.map(item => `
        <a href="${item.href}" class="sp2-side-link" data-nav-page="${item.key}">
          <span class="sp2-side-link-icon">${icon(item.icon)}</span>
          <span>${item.label}</span>
        </a>`).join("")}
    </nav>`;
}

function playerHtml() {
  return `
    <div class="sp2-player-left">
      <button type="button" id="sp2-player-cover" class="sp2-player-cover" aria-label="Portada"></button>
      <div class="sp2-player-meta">
        <p id="sp2-player-title" class="sp2-player-title">Elige una canción</p>
        <p id="sp2-player-artist" class="sp2-player-artist">Artista</p>
      </div>
      <button type="button" id="sp2-like" class="sp2-tool-btn sp2-like-btn" aria-label="Me gusta" aria-pressed="false"></button>
    </div>

    <div class="sp2-player-center">
      <div class="sp2-ctrl-row">
        <button type="button" id="sp2-btn-shuffle" class="sp2-ctrl-btn" aria-label="Aleatorio" title="Aleatorio" aria-pressed="false"><span id="sp2-ico-shuffle"></span></button>
        <button type="button" id="sp2-btn-prev" class="sp2-ctrl-btn sp2-ctrl-strong" aria-label="Anterior" title="Anterior"><span id="sp2-ico-prev"></span></button>
        <button type="button" id="sp2-btn-play" class="sp2-play-main" aria-label="Reproducir">
          <span id="sp2-ico-play"></span>
        </button>
        <button type="button" id="sp2-btn-next" class="sp2-ctrl-btn sp2-ctrl-strong" aria-label="Siguiente" title="Siguiente"><span id="sp2-ico-next"></span></button>
        <button type="button" id="sp2-btn-repeat" class="sp2-ctrl-btn" aria-label="Repetir" title="Repetir" aria-pressed="false"><span id="sp2-ico-repeat"></span></button>
      </div>
      <div class="sp2-progress-row">
        <span id="sp2-time" class="sp2-time">0:00</span>
        <input id="sp2-progress" class="sp2-slider" type="range" min="0" max="100" step="0.1" value="0" aria-label="Progreso de reproducción"/>
        <span id="sp2-dur" class="sp2-time sp2-time-right">0:00</span>
      </div>
    </div>

    <div class="sp2-player-right">
      <button type="button" id="sp2-btn-queue" class="sp2-tool-btn" aria-label="Cola de reproducción" title="Cola"><span id="sp2-ico-queue"></span></button>
      <button type="button" id="sp2-player-devices" class="sp2-tool-btn" aria-label="Dispositivos" title="Dispositivos"><span id="sp2-ico-devices"></span></button>
      <button type="button" id="sp2-btn-mute" class="sp2-tool-btn" aria-label="Silenciar" title="Silenciar"><span id="sp2-ico-vol"></span></button>
      <input id="sp2-volume" class="sp2-slider sp2-vol" type="range" min="0" max="100" value="70" aria-label="Volumen"/>
    </div>`;
}

function miniPlayerHtml() {
  return `
    <span class="sp2-mini-bar" id="sp2-mini-bar"></span>
    <div id="sp2-mini-cover" class="sp2-mini-cover"></div>
    <div class="sp2-mini-meta">
      <p id="sp2-mini-title" class="sp2-mini-title">Elige una canción</p>
      <p id="sp2-mini-artist" class="sp2-mini-artist">Artista</p>
    </div>
    <button type="button" id="sp2-mini-play" class="sp2-mini-play" aria-label="Reproducir / Pausar">
      <span id="sp2-ico-mini-play"></span>
    </button>`;
}

function bottomNavHtml(page) {
  return NAV_ITEMS.map(item => `
    <a href="${item.href}" class="sp2-bottom-link ${page === item.key ? "active" : ""}"
      ${page === item.key ? 'aria-current="page"' : ""}>
      <span class="ico" id="sp2-ico-bn-${item.key}"></span>
      <span class="sp2-bottom-label">${item.label}</span>
    </a>`).join("");
}

function nowPlayingHtml() {
  return `
    <div class="sp2-np-top">
      <button type="button" id="sp2-np-close" class="sp2-np-icon-btn" aria-label="Cerrar"><span id="sp2-ico-npdown"></span></button>
      <div class="sp2-np-context-wrap">
        <p class="sp2-np-eyebrow">Reproduciendo desde</p>
        <p id="sp2-np-context" class="sp2-np-context">Spotify Clone</p>
      </div>
      <button type="button" id="sp2-np-more" class="sp2-np-icon-btn" aria-label="Más opciones"><span id="sp2-ico-npmore"></span></button>
    </div>

    <div class="sp2-np-body">
      <div class="sp2-np-cover-wrap">
        <div id="sp2-np-cover"></div>
      </div>

      <div class="sp2-np-meta">
        <div class="min-w-0">
          <p id="sp2-np-title" class="sp2-np-title">Elige una canción</p>
          <p id="sp2-np-artist" class="sp2-np-artist">Artista</p>
        </div>
        <button type="button" id="sp2-np-like" class="sp2-np-icon-btn" aria-label="Me gusta" aria-pressed="false"></button>
      </div>

      <div>
        <div class="sp2-np-progress-row">
          <span id="sp2-np-time" class="sp2-time">0:00</span>
          <input id="sp2-np-progress" class="sp2-slider" type="range" min="0" max="100" step="0.1" value="0" aria-label="Progreso"/>
          <span id="sp2-np-dur" class="sp2-time sp2-time-right">0:00</span>
        </div>
      </div>

      <div class="sp2-np-controls">
        <button type="button" id="sp2-np-shuffle" class="sp2-np-ctrl" aria-label="Aleatorio" aria-pressed="false"><span id="sp2-ico-npsh"></span></button>
        <button type="button" id="sp2-np-prev" class="sp2-np-ctrl sp2-np-ctrl-strong" aria-label="Anterior"><span id="sp2-ico-npprev"></span></button>
        <button type="button" id="sp2-np-play" class="sp2-np-play" aria-label="Reproducir">
          <span id="sp2-ico-npplay"></span>
        </button>
        <button type="button" id="sp2-np-next" class="sp2-np-ctrl sp2-np-ctrl-strong" aria-label="Siguiente"><span id="sp2-ico-npnext"></span></button>
        <button type="button" id="sp2-np-repeat" class="sp2-np-ctrl" aria-label="Repetir" aria-pressed="false"><span id="sp2-ico-nprep"></span></button>
      </div>
    </div>`;
}

function queuePanelHtml() {
  return `
    <div class="sp2-queue-head">
      <h2 class="sp2-queue-title">Cola de reproducción</h2>
      <button type="button" id="sp2-queue-close" class="sp2-queue-close" aria-label="Cerrar">
        <span id="sp2-ico-qclose"></span>
      </button>
    </div>
    <div class="sp2-queue-tabs" role="tablist" aria-label="Panel del reproductor">
      <button type="button" class="sp2-queue-tab active" data-queue-tab="queue" role="tab" aria-selected="true">Cola</button>
      <button type="button" class="sp2-queue-tab" data-queue-tab="lyrics" role="tab" aria-selected="false">Letra</button>
    </div>
    <div id="sp2-queue-content" class="sp2-queue-content scroll-area"></div>`;
}

function injectShellIcons() {
  for (const [id, name] of Object.entries(SHELL_ICONS)) {
    const el = document.getElementById(id);
    if (el && ICONS[name]) el.innerHTML = ICONS[name];
  }
  const likeBtn = document.getElementById("sp2-like");
  if (likeBtn) likeBtn.innerHTML = `<span class="text-[18px]">${icon("heart-outline")}</span>`;
  const npLikeBtn = document.getElementById("sp2-np-like");
  if (npLikeBtn) npLikeBtn.innerHTML = `<span class="text-[20px]">${icon("heart-outline")}</span>`;
}

function updateSliderFill(el) {
  if (!el) return;
  const min = Number(el.min) || 0;
  const max = Number(el.max) || 100;
  const v = ((Number(el.value) - min) / (max - min || 1)) * 100;
  el.style.setProperty("--pct", v + "%");
}

function mountShell() {
  const page = document.body.dataset.page || "home";
  const topbar = document.getElementById("sp2-topbar");
  const sidebar = document.getElementById("sp2-sidebar");
  const player = document.getElementById("sp2-player");
  const mini = document.getElementById("sp2-mini-player");
  const bottomNav = document.getElementById("sp2-bottom-nav");
  const nowPlaying = document.getElementById("sp2-now-playing");
  const queue = document.getElementById("sp2-queue-panel");

  if (topbar) topbar.innerHTML = topbarHtml();
  if (sidebar) sidebar.innerHTML = sidebarHtml();
  if (player) player.innerHTML = playerHtml();
  if (mini) mini.innerHTML = miniPlayerHtml();
  if (bottomNav) bottomNav.innerHTML = bottomNavHtml(page);
  if (nowPlaying) nowPlaying.innerHTML = nowPlayingHtml();
  if (queue) queue.innerHTML = queuePanelHtml();

  injectShellIcons();

  document.querySelectorAll("[data-nav-page]").forEach(link => {
    const active = link.getAttribute("data-nav-page") === page;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
  });

  ["sp2-progress", "sp2-np-progress", "sp2-volume"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    updateSliderFill(el);
    el.addEventListener("input", () => updateSliderFill(el));
  });

  return page;
}
