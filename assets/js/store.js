/* =====================================================================
 * Spotify-dos — Store (localStorage)
 * ================================================================== */

const Store = {
  get(key) {
    try { return JSON.parse(localStorage.getItem("sp2_" + key)); } catch { return null; }
  },
  set(key, val) {
    try { localStorage.setItem("sp2_" + key, JSON.stringify(val)); } catch {}
  },
  del(key) {
    try { localStorage.removeItem("sp2_" + key); } catch {}
  },
};
