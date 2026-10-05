// Loaded in <head> without defer so the right theme is applied before first paint.
const SalatTheme = (() => {
  const MODES = ['auto', 'day', 'night'];
  const COLORS = { day: '#f3eefb', night: '#081321' };

  function toMinutes(hhmm) {
    const m = /^(\d{1,2}):(\d{2})/.exec(String(hhmm || ''));
    return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
  }

  // Auto: night from Maghrib until Fajr when prayer times are known,
  // otherwise follow the phone's setting, otherwise 18:00–05:00.
  function resolve(mode, { timings = null, now = new Date(), systemDark = null } = {}) {
    if (mode === 'day' || mode === 'night') return mode;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const fajr = toMinutes(timings?.Fajr);
    const maghrib = toMinutes(timings?.Maghrib);
    if (Number.isFinite(fajr) && Number.isFinite(maghrib)) {
      return nowMin >= maghrib || nowMin < fajr ? 'night' : 'day';
    }
    if (typeof systemDark === 'boolean') return systemDark ? 'night' : 'day';
    return nowMin >= 18 * 60 || nowMin < 5 * 60 ? 'night' : 'day';
  }

  function readStored(key, fallback) {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  }

  function currentMode() {
    const mode = readStored('salat.theme', 'auto');
    return MODES.includes(mode) ? mode : 'auto';
  }

  function cachedTimings() {
    try { return JSON.parse(readStored('salat.lastTimings', 'null')); } catch { return null; }
  }

  function systemPrefersDark() {
    try { return window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : null; } catch { return null; }
  }

  function apply(timings) {
    if (typeof document === 'undefined') return null;
    const theme = resolve(currentMode(), { timings: timings || cachedTimings(), systemDark: systemPrefersDark() });
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.themeMode = currentMode();
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', COLORS[theme]);
    return theme;
  }

  function setMode(mode) {
    if (!MODES.includes(mode)) return null;
    try { localStorage.setItem('salat.theme', mode); } catch {}
    return apply();
  }

  if (typeof document !== 'undefined') apply();
  return { MODES, resolve, apply, setMode, currentMode, toMinutes };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = SalatTheme;
