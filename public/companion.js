// Prayer tracker (صلّيت؟), post-prayer adhkar and theme/reminder settings.
const SalatCompanion = (() => {
  const PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const PRAYER_NAMES = { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };
  const WEEKDAYS = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
  const KEEP_DAYS = 60;
  const REMINDER_OPTIONS = [0, 5, 10, 15, 20, 30];

  // Each dhikr is verified against the linked narration.
  const ADHKAR = [
    { id: 'istighfar', text: 'أستغفر الله', count: 3, source: 'صحيح مسلم ٥٩١', url: 'https://sunnah.com/muslim:591' },
    { id: 'salam', text: 'اللهم أنت السلام ومنك السلام، تباركت ذا الجلال والإكرام', count: 1, source: 'صحيح مسلم ٥٩١', url: 'https://sunnah.com/muslim:591' },
    { id: 'tahlil', text: 'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير، اللهم لا مانع لما أعطيت، ولا معطي لما منعت، ولا ينفع ذا الجد منك الجد', count: 1, source: 'صحيح البخاري ٨٤٤', url: 'https://sunnah.com/bukhari:844' },
    { id: 'tasbih', text: 'سبحان الله', count: 33, source: 'صحيح مسلم ٥٩٧', url: 'https://sunnah.com/muslim:597a' },
    { id: 'tahmid', text: 'الحمد لله', count: 33, source: 'صحيح مسلم ٥٩٧', url: 'https://sunnah.com/muslim:597a' },
    { id: 'takbir', text: 'الله أكبر', count: 33, source: 'صحيح مسلم ٥٩٧', url: 'https://sunnah.com/muslim:597a' },
    { id: 'tamam', text: 'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير', note: 'تمام المائة', count: 1, source: 'صحيح مسلم ٥٩٧', url: 'https://sunnah.com/muslim:597a' },
    { id: 'dua', text: 'اللهم أعني على ذكرك وشكرك وحسن عبادتك', count: 1, source: 'سنن أبي داود ١٥٢٢', url: 'https://sunnah.com/abudawud:1522' },
    { id: 'muawwidhat', text: 'قراءة المعوّذات: الإخلاص، والفلق، والناس', count: 1, source: 'سنن أبي داود ١٥٢٣', url: 'https://sunnah.com/abudawud:1523' }
  ];

  const num = (n) => new Intl.NumberFormat('ar-EG', { useGrouping: false }).format(n);

  function dateKey(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function addDays(d, n) {
    const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    copy.setDate(copy.getDate() + n);
    return copy;
  }

  function togglePrayed(log, prayer, date = new Date()) {
    if (!PRAYER_KEYS.includes(prayer)) return { log, done: false };
    const key = dateKey(date);
    const next = { ...log };
    const day = new Set(next[key] || []);
    const done = !day.has(prayer);
    if (done) day.add(prayer); else day.delete(prayer);
    next[key] = PRAYER_KEYS.filter(p => day.has(p));
    if (!next[key].length) delete next[key];
    return { log: next, done };
  }

  function countFor(log, date) {
    return (log[dateKey(date)] || []).filter(p => PRAYER_KEYS.includes(p)).length;
  }

  function week(log, today = new Date()) {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i - 6);
      const done = new Set(log[dateKey(d)] || []);
      return { key: dateKey(d), label: WEEKDAYS[d.getDay()], isToday: i === 6, prayers: PRAYER_KEYS.map(p => done.has(p)) };
    });
  }

  // Consecutive days with all five prayers, ending today (if complete) or yesterday.
  function streak(log, today = new Date()) {
    let d = countFor(log, today) === 5 ? today : addDays(today, -1);
    let n = 0;
    while (countFor(log, d) === 5) { n++; d = addDays(d, -1); }
    return n;
  }

  function prune(log, today = new Date()) {
    const oldest = dateKey(addDays(today, -KEEP_DAYS));
    return Object.fromEntries(Object.entries(log).filter(([k]) => k >= oldest));
  }

  function daysText(n) {
    if (n === 1) return 'يوم واحد';
    if (n === 2) return 'يومان';
    if (n <= 10) return `${num(n)} أيام`;
    return `${num(n)} يومًا`;
  }

  function minutesText(n) {
    return n >= 3 && n <= 10 ? `${num(n)} دقائق` : `${num(n)} دقيقة`;
  }

  function streakText(n) {
    return n ? `🔥 ${daysText(n)} متتالية بالصلوات الخمس` : 'ابدأ سلسلتك: سجّل الصلوات الخمس اليوم 🌱';
  }

  // ---------- storage ----------
  function read(key, fallback) {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, value); return true; } catch { return false; }
  }
  function readLog() {
    try { return JSON.parse(read('salat.log', '{}')) || {}; } catch { return {}; }
  }
  function saveLog(log) { write('salat.log', JSON.stringify(prune(log))); }
  function isPrayed(prayer, date = new Date()) { return (readLog()[dateKey(date)] || []).includes(prayer); }
  function reminderMinutes() {
    const v = Number(read('salat.reminderBefore', '10'));
    return REMINDER_OPTIONS.includes(v) ? v : 10;
  }

  const api = { PRAYER_KEYS, ADHKAR, REMINDER_OPTIONS, minutesText, dateKey, togglePrayed, countFor, week, streak, prune, streakText, isPrayed, reminderMinutes };

  if (typeof document === 'undefined' || !document.getElementById('trackerCard')) return api;

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const say = (msg) => (typeof toast === 'function' ? toast(msg) : null);

  function renderTracker() {
    const log = readLog();
    const today = new Date();
    $('trackerToday').textContent = `${num(countFor(log, today))} من ${num(5)} اليوم`;
    $('trackerWeek').innerHTML = week(log, today).map(day => `
      <div class="tracker-day${day.isToday ? ' today' : ''}" title="${day.key}">
        <div class="tracker-dots">${day.prayers.map((done, i) => `<span class="${done ? 'done' : ''}" aria-label="${PRAYER_NAMES[PRAYER_KEYS[i]]} ${done ? 'تمت' : 'لم تسجّل'}"></span>`).join('')}</div>
        <small>${day.isToday ? 'اليوم' : day.label}</small>
      </div>`).join('');
    $('trackerStreak').textContent = streakText(streak(log, today));
  }

  // ----- adhkar sheet -----
  const sheet = $('adhkarSheet');
  let remaining = {};
  let lastFocus = null;

  function renderAdhkar() {
    const total = ADHKAR.reduce((s, d) => s + d.count, 0);
    const left = ADHKAR.reduce((s, d) => s + remaining[d.id], 0);
    $('adhkarProgress').style.width = `${Math.round(((total - left) / total) * 100)}%`;
    $('adhkarList').innerHTML = ADHKAR.map(d => {
      const r = remaining[d.id];
      const done = r === 0;
      return `<article class="dhikr-card${done ? ' done' : ''}">
        <button class="dhikr-tap" data-dhikr="${d.id}" ${done ? 'aria-disabled="true"' : ''} aria-label="${d.text} — المتبقي ${num(r)}">
          ${d.note ? `<span class="dhikr-note">${d.note}</span>` : ''}
          <span class="dhikr-text">${d.text}</span>
          <span class="dhikr-count">${done ? '✓ تم' : d.count > 1 ? `${num(d.count - r)} / ${num(d.count)}` : 'اضغط عند الانتهاء'}</span>
        </button>
        <a class="dhikr-source" href="${d.url}" target="_blank" rel="noopener noreferrer">${d.source} ↗</a>
      </article>`;
    }).join('');
    const finished = left === 0;
    $('adhkarDone').hidden = !finished;
  }

  function resetAdhkar() {
    remaining = Object.fromEntries(ADHKAR.map(d => [d.id, d.count]));
    renderAdhkar();
  }

  function openAdhkar(prayer) {
    $('adhkarTitle').textContent = prayer ? `أذكار بعد صلاة ${PRAYER_NAMES[prayer]}` : 'أذكار بعد الصلاة';
    $('adhkarAuto').checked = read('salat.autoAdhkar', '1') !== '0';
    resetAdhkar();
    lastFocus = document.activeElement;
    sheet.hidden = false;
    requestAnimationFrame(() => sheet.classList.add('show'));
    document.body.classList.add('sheet-open');
    $('closeAdhkarBtn').focus();
  }

  function closeAdhkar() {
    sheet.classList.remove('show');
    document.body.classList.remove('sheet-open');
    setTimeout(() => { sheet.hidden = true; }, 220);
    if (lastFocus?.focus) lastFocus.focus();
  }

  $('adhkarList').addEventListener('click', (e) => {
    const btn = e.target.closest('.dhikr-tap');
    if (!btn) return;
    const id = btn.dataset.dhikr;
    if (!remaining[id]) return;
    remaining[id]--;
    try { if (navigator.vibrate) navigator.vibrate(remaining[id] ? 12 : [20, 40, 20]); } catch {}
    renderAdhkar();
    const again = $('adhkarList').querySelector(`[data-dhikr="${id}"]`);
    if (again && remaining[id]) again.focus();
  });
  $('closeAdhkarBtn').addEventListener('click', closeAdhkar);
  $('resetAdhkarBtn').addEventListener('click', resetAdhkar);
  $('adhkarAuto').addEventListener('change', () => write('salat.autoAdhkar', $('adhkarAuto').checked ? '1' : '0'));
  sheet.addEventListener('click', (e) => { if (e.target === sheet) closeAdhkar(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) closeAdhkar(); });
  $('openAdhkarBtn').addEventListener('click', () => openAdhkar(null));

  // ----- صلّيت؟ -----
  $('prayerList').addEventListener('click', (e) => {
    const btn = e.target.closest('.pray-check');
    if (!btn || btn.disabled) return;
    const prayer = btn.dataset.pray;
    const { log, done } = togglePrayed(readLog(), prayer);
    saveLog(log);
    if (typeof renderPrayerList === 'function') renderPrayerList();
    renderTracker();
    if (done) {
      say(`تقبّل الله صلاة ${PRAYER_NAMES[prayer]} 🤲`);
      if (read('salat.autoAdhkar', '1') !== '0') setTimeout(() => openAdhkar(prayer), 350);
    }
  });

  // ----- theme -----
  const THEME_ICONS = { auto: '🌗', day: '☀️', night: '🌙' };
  const THEME_LABELS = { auto: 'تلقائي', day: 'نهاري', night: 'ليلي' };
  function renderThemeControls() {
    const mode = SalatTheme.currentMode();
    $('themeBtn').textContent = THEME_ICONS[mode];
    $('themeBtn').setAttribute('aria-label', `المظهر: ${THEME_LABELS[mode]} — اضغط للتغيير`);
    document.querySelectorAll('.theme-option').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  }
  function setTheme(mode) {
    const swap = () => { SalatTheme.setMode(mode); renderThemeControls(); };
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // Cross-fade the whole screen where supported; otherwise a short fade on the shell.
    if (document.startViewTransition && !reduce) { document.startViewTransition(swap); return; }
    swap();
    if (!reduce) {
      document.documentElement.classList.remove('theme-fade');
      void document.documentElement.offsetWidth;
      document.documentElement.classList.add('theme-fade');
    }
  }
  $('themeBtn').addEventListener('click', () => {
    const order = SalatTheme.MODES;
    const next = order[(order.indexOf(SalatTheme.currentMode()) + 1) % order.length];
    setTheme(next);
    say(`المظهر: ${THEME_LABELS[next]}${next === 'auto' ? ' — ليلي من المغرب للفجر' : ''}`);
  });
  document.querySelectorAll('.theme-option').forEach(b => b.addEventListener('click', () => setTheme(b.dataset.mode)));
  document.addEventListener('salat:timings', (e) => SalatTheme.apply(e.detail));
  try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => SalatTheme.apply()); } catch {}

  // ----- reminder before prayer -----
  const reminderSelect = $('reminderSelect');
  reminderSelect.innerHTML = REMINDER_OPTIONS.map(v => `<option value="${v}">${v ? `قبلها بـ ${minutesText(v)}` : 'بدون تذكير'}</option>`).join('');
  reminderSelect.value = String(reminderMinutes());
  reminderSelect.addEventListener('change', async () => {
    write('salat.reminderBefore', reminderSelect.value);
    if (typeof syncPushSubscription === 'function') {
      try { await syncPushSubscription(false); } catch {}
    }
    say(Number(reminderSelect.value) ? `سيصلك تذكير قبل كل صلاة بـ ${minutesText(Number(reminderSelect.value))}` : 'تم إلغاء التذكير قبل الصلاة');
  });

  // Day changes at midnight / when returning to the app.
  setInterval(() => { SalatTheme.apply(); renderTracker(); }, 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { SalatTheme.apply(); renderTracker(); } });

  renderThemeControls();
  renderTracker();
  return { ...api, openAdhkar, renderTracker };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = SalatCompanion;
