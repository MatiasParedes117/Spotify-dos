/* =====================================================================
 * Spotify-dos — Reproductor de audio simulado
 * ================================================================== */

const Player = {
  audio: new Audio(),
  song: null,
  queue: [],
  index: -1,
  context: { type: "", id: "", label: "" },
  playing: false,
  shuffle: false,
  repeat: "none",   // "none" | "all" | "one"
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  liked: new Set(Store.get("liked") || []),

  get progress() {
    return this.duration > 0 ? this.currentTime / this.duration : 0;
  },
};

/* ─── helpers ─── */
function fmtTime(sec) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function dispatchPlayerChange() {
  window.dispatchEvent(new CustomEvent("sp2:playerchange"));
}

/* ─── play song ─── */
function playSong(songId, queueIds, contextType, contextId, contextLabel) {
  const song = DB.song(songId);
  if (!song) return;

  Player.queue = queueIds && queueIds.length ? [...queueIds] : [songId];
  Player.index = Player.queue.indexOf(songId);
  if (Player.index < 0) { Player.queue.unshift(songId); Player.index = 0; }

  Player.context = { type: contextType || "", id: contextId || "", label: contextLabel || "" };
  Player.song = song;
  Player.playing = true;
  Player.currentTime = 0;
  Player.duration = song.duration || 180;
  Player.audio.pause();

  dispatchPlayerChange();
}

function playCollection(type, id) {
  let ids = [];
  let label = "";
  if (type === "playlist") {
    const p = DB.playlist(id);
    if (!p) return;
    ids = [...p.songIds];
    label = p.name;
  } else if (type === "album") {
    const a = DB.album(id);
    if (!a) return;
    ids = a.songs.map(s => s[0]);
    label = a.title;
  } else if (type === "artist") {
    const a = DB.artist(id);
    if (!a) return;
    const albums = DB.albums.filter(al => al.artistId === id);
    ids = albums.flatMap(al => al.songs.map(s => s[0]));
    label = a.name;
  } else if (type === "liked") {
    ids = [...Player.liked];
    label = "Canciones que te gustan";
  }
  if (!ids.length) return toast("Esta colección no tiene canciones");
  playSong(ids[0], ids, type, id, label);
}

function shuffleCollection(type, id) {
  let ids = [];
  if (type === "playlist") ids = [...(DB.playlist(id)?.songIds || [])];
  else if (type === "album") ids = DB.album(id)?.songs.map(s => s[0]) || [];
  else if (type === "artist") {
    const albums = DB.albums.filter(al => al.artistId === id);
    ids = albums.flatMap(al => al.songs.map(s => s[0]));
  } else if (type === "liked") ids = [...Player.liked];
  if (!ids.length) return toast("Sin canciones");
  const shuffled = [...ids].sort(() => Math.random() - 0.5);
  Player.shuffle = true;
  playSong(shuffled[0], shuffled, type, id, "");
}

/* ─── controls ─── */
function togglePlay() {
  if (!Player.song) return toast("Elige una canción primero");
  Player.playing = !Player.playing;
  dispatchPlayerChange();
}

function playNext() {
  if (!Player.queue.length) return;
  let next = Player.index + 1;
  if (next >= Player.queue.length) {
    if (Player.repeat === "all") next = 0; else { Player.playing = false; dispatchPlayerChange(); return; }
  }
  const song = DB.song(Player.queue[next]);
  if (!song) return;
  Player.index = next;
  Player.song = song;
  Player.currentTime = 0;
  Player.duration = song.duration || 180;
  Player.playing = true;
  dispatchPlayerChange();
}

function playPrev() {
  if (Player.currentTime > 3) { Player.currentTime = 0; dispatchPlayerChange(); return; }
  if (!Player.queue.length) return;
  let prev = Player.index - 1;
  if (prev < 0) prev = Player.repeat === "all" ? Player.queue.length - 1 : 0;
  const song = DB.song(Player.queue[prev]);
  if (!song) return;
  Player.index = prev;
  Player.song = song;
  Player.currentTime = 0;
  Player.duration = song.duration || 180;
  Player.playing = true;
  dispatchPlayerChange();
}

function toggleRepeat() {
  const map = { none: "all", all: "one", one: "none" };
  Player.repeat = map[Player.repeat] || "none";
  dispatchPlayerChange();
}

function toggleShuffle() {
  Player.shuffle = !Player.shuffle;
  if (Player.shuffle && Player.queue.length > 1) {
    const cur = Player.queue[Player.index];
    const rest = Player.queue.filter(id => id !== cur).sort(() => Math.random() - 0.5);
    Player.queue = [cur, ...rest];
    Player.index = 0;
  }
  dispatchPlayerChange();
}

function seekTo(t) {
  Player.currentTime = Math.max(0, Math.min(t, Player.duration));
  dispatchPlayerChange();
}

function setVolume(v) {
  Player.volume = Math.max(0, Math.min(1, v));
  Player.audio.volume = Player.volume;
  dispatchPlayerChange();
}

function toggleLike(songId) {
  if (Player.liked.has(songId)) Player.liked.delete(songId);
  else Player.liked.add(songId);
  Store.set("liked", [...Player.liked]);
  dispatchPlayerChange();
}

function toggleMute() {
  if (Player.audio.volume > 0) {
    Player._prevVol = Player.volume;
    setVolume(0);
  } else {
    setVolume(Player._prevVol || 0.7);
  }
}

/* ─── timer ─── */
let _lastTick = Date.now();
function tick() {
  if (!Player.playing || !Player.song) return;
  const now = Date.now();
  const delta = (now - _lastTick) / 1000;
  _lastTick = now;
  Player.currentTime = Math.min(Player.currentTime + delta, Player.duration);
  if (Player.currentTime >= Player.duration) {
    if (Player.repeat === "one") Player.currentTime = 0;
    else playNext();
  }
  updateProgressUI();
}
setInterval(() => { _lastTick = Date.now(); tick(); }, 250);

/* ─── saved artists ─── */
function toggleSaveArtist(id) {
  const saved = new Set(Store.get("savedArtists") || []);
  if (saved.has(id)) { saved.delete(id); toast("Dejaste de seguir al artista"); }
  else { saved.add(id); toast("Siguiendo al artista"); }
  Store.set("savedArtists", [...saved]);
  dispatchPlayerChange();
}

function toggleSaveAlbum(id) {
  const saved = new Set(Store.get("savedAlbums") || []);
  if (saved.has(id)) { saved.delete(id); toast("Álbum eliminado de tu biblioteca"); }
  else { saved.add(id); toast("Álbum guardado en tu biblioteca"); }
  Store.set("savedAlbums", [...saved]);
  dispatchPlayerChange();
}
