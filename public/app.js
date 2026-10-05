const PRAYERS = [
  { key: 'Fajr', name: 'الفجر' },
  { key: 'Dhuhr', name: 'الظهر' },
  { key: 'Asr', name: 'العصر' },
  { key: 'Maghrib', name: 'المغرب' },
  { key: 'Isha', name: 'العشاء' }
];

const state = {
  coords: JSON.parse(localStorage.getItem('salat.coords') || 'null'),
  timings: null,
  enabledPrayers: JSON.parse(localStorage.getItem('salat.enabled') || JSON.stringify(PRAYERS.map(p => p.key))),
  nextPrayer: null,
  qiblaBearing: null,
  heading: 0,
  audioCtx: null,
  alarmTimer: null,
  snoozeTimer: null,
  voice: SalatUtils.readSetting('salat.voice', 'alafasy'),
  volume: Math.min(1, Math.max(.1, Number(SalatUtils.readSetting('salat.volume', '1')) || 1))
};

const $ = (id) => document.getElementById(id);
let adhanAttempt = 0;
const el = {
  locationLabel: $('locationLabel'), todayLabel: $('todayLabel'), nextPrayerName: $('nextPrayerName'),
  nextPrayerTime: $('nextPrayerTime'), countdown: $('countdown'), prayerList: $('prayerList'),
  alarmScreen: $('alarmScreen'), alarmClock: $('alarmClock'), alarmPrayer: $('alarmPrayer'),
  qiblaArrow: $('qiblaArrow'), qiblaDegrees: $('qiblaDegrees'), qiblaHint: $('qiblaHint'),
  prayerToggles: $('prayerToggles'), toast: $('toast'),
  adhanAudio: $('adhanAudio'), alarmAudioStatus: $('alarmAudioStatus'), playAdhanBtn: $('playAdhanBtn')
};

function toast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.toast.classList.remove('show'), 2600);
}

function switchView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === viewId));
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === viewId);
    if (b.dataset.view === viewId) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  if (viewId !== 'settingsView') stopPreview();
  document.dispatchEvent(new CustomEvent('salat:viewchange', { detail: viewId }));
}

document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
$('settingsBtn').addEventListener('click', () => switchView('settingsView'));

function formatToday() {
  try {
    return new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  } catch { return ''; }
}
el.todayLabel.textContent = formatToday();

function renderToggles() {
  el.prayerToggles.innerHTML = PRAYERS.map(p => `
    <div class="toggle-row">
      <span>صلاة ${p.name}</span>
      <label class="switch">
        <input type="checkbox" data-prayer="${p.key}" ${state.enabledPrayers.includes(p.key) ? 'checked' : ''}>
        <span class="slider"></span>
      </label>
    </div>`).join('');

  el.prayerToggles.querySelectorAll('input').forEach(input => input.addEventListener('change', async () => {
    state.enabledPrayers = [...el.prayerToggles.querySelectorAll('input:checked')].map(x => x.dataset.prayer);
    localStorage.setItem('salat.enabled', JSON.stringify(state.enabledPrayers));
    renderPrayerList();
    await syncPushSubscription(false);
  }));
}

function renderPrayerList() {
  const tracker = typeof SalatCompanion !== 'undefined' ? SalatCompanion : null;
  const nowMin = getNowMinutes();
  el.prayerList.innerHTML = PRAYERS.map(p => {
    const enabled = state.enabledPrayers.includes(p.key);
    const isNext = state.nextPrayer?.key === p.key;
    const time = SalatUtils.formatTime(state.timings?.[p.key]);
    const prayed = tracker ? tracker.isPrayed(p.key) : false;
    const arrived = Boolean(state.timings?.[p.key]) && minutesOf(state.timings[p.key]) <= nowMin;
    const check = tracker ? `<button class="pray-check${prayed ? ' done' : ''}" data-pray="${p.key}" aria-pressed="${prayed}" ${arrived || prayed ? '' : 'disabled'} aria-label="${prayed ? `إلغاء تسجيل صلاة ${p.name}` : `صلّيت ${p.name}`}" title="${arrived || prayed ? 'صلّيت؟' : 'لم يدخل الوقت بعد'}">✓</button>` : '';
    return `<div class="prayer-row ${isNext ? 'next' : ''} ${prayed ? 'prayed' : ''}">
      <div class="prayer-meta"><span class="prayer-dot"></span><div><b>${p.name}</b><div class="muted" style="font-size:11px;margin-top:3px">${prayed ? '✓ صلّيت — تقبّل الله' : enabled ? 'التنبيه مفعّل' : 'التنبيه متوقف'}</div></div></div>
      <div class="prayer-end"><div class="prayer-time">${time}</div>${check}</div>
    </div>`;
  }).join('');
}

function minutesOf(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function getNowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}

function updateNextPrayer() {
  if (!state.timings) return;
  const now = getNowMinutes();
  const list = PRAYERS.map(p => ({ ...p, time: state.timings[p.key], min: minutesOf(state.timings[p.key]) }));
  let next = list.find(x => x.min > now);
  let diff;
  if (!next) {
    next = list[0];
    diff = (24 * 60 - now) + next.min;
  } else diff = next.min - now;

  state.nextPrayer = next;
  el.nextPrayerName.textContent = `صلاة ${next.name}`;
  el.nextPrayerTime.textContent = SalatUtils.formatTime(next.time);
  const h = Math.floor(diff / 60);
  const m = Math.max(0, Math.floor(diff % 60));
  el.countdown.textContent = h > 0 ? `متبقي ${h} س و ${m} د` : `متبقي ${m} دقيقة`;
  renderPrayerList();
}

async function loadTimes() {
  if (!state.coords) {
    renderPrayerList();
    return;
  }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo';
    const res = await fetch(`/api/timings?lat=${encodeURIComponent(state.coords.lat)}&lng=${encodeURIComponent(state.coords.lng)}&tz=${encodeURIComponent(tz)}`);
    if (!res.ok) throw new Error('timings failed');
    const data = await res.json();
    state.timings = data.timings;
    SalatUtils.saveSetting('salat.lastTimings', JSON.stringify(data.timings));
    document.dispatchEvent(new CustomEvent('salat:timings', { detail: data.timings }));
    updateNextPrayer();
  } catch (err) {
    toast('تعذر تحميل مواقيت الصلاة الآن');
  }
}

function calcQiblaBearing(lat, lng) {
  const kaabaLat = 21.422487 * Math.PI / 180;
  const kaabaLng = 39.826206 * Math.PI / 180;
  const phi = lat * Math.PI / 180;
  const lambda = lng * Math.PI / 180;
  const y = Math.sin(kaabaLng - lambda);
  const x = Math.cos(phi) * Math.tan(kaabaLat) - Math.sin(phi) * Math.cos(kaabaLng - lambda);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function updateQiblaUI() {
  if (!state.coords) return;
  state.qiblaBearing = calcQiblaBearing(state.coords.lat, state.coords.lng);
  el.qiblaDegrees.textContent = `${Math.round(state.qiblaBearing)}°`;
  const rotation = state.qiblaBearing - state.heading;
  el.qiblaArrow.style.transform = `rotate(${rotation}deg)`;
  el.qiblaHint.textContent = `حرّك الهاتف أفقيًا حتى يشير السهم إلى 🕋`;
}

async function requestLocation() {
  if (!navigator.geolocation) return toast('المتصفح لا يدعم تحديد الموقع');
  toast('جاري تحديد موقعك…');
  navigator.geolocation.getCurrentPosition(async (pos) => {
    state.coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    localStorage.setItem('salat.coords', JSON.stringify(state.coords));
    el.locationLabel.textContent = 'موقعك الحالي';
    updateQiblaUI();
    await loadTimes();
    await syncPushSubscription(false);
    toast('تم تحديث مواقيت الصلاة والقبلة');
  }, (err) => {
    console.warn(err);
    toast('فعّل إذن الموقع للتطبيق ثم حاول مرة أخرى');
  }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 15 * 60 * 1000 });
}
$('locateBtn').addEventListener('click', requestLocation);

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.register('/sw.js');
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

async function syncPushSubscription(interactive = true) {
  if (!state.coords) {
    if (interactive) toast('حدّد موقعك أولًا');
    return;
  }
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    if (interactive) toast('جهازك لا يدعم Web Push في هذا الوضع');
    return;
  }

  const config = await fetch('/api/config').then(r => r.json());
  if (!config.pushConfigured || !config.vapidPublicKey) {
    if (interactive) toast('فعّل مفاتيح VAPID على Railway أولًا');
    return;
  }

  let permission = Notification.permission;
  if (interactive && permission !== 'granted') permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    if (interactive) toast('لم يتم السماح بالإشعارات');
    return;
  }

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.vapidPublicKey)
    });
  }

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo';
  const res = await fetch('/api/subscriptions', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription: sub, lat: state.coords.lat, lng: state.coords.lng, timeZone: tz, enabledPrayers: state.enabledPrayers,
      reminderMinutes: typeof SalatCompanion !== 'undefined' ? SalatCompanion.reminderMinutes() : 10
    })
  });
  if (interactive) toast(res.ok ? 'تم تفعيل تنبيهات الصلاة ✅' : 'تعذر حفظ إعداد التنبيهات');
}
$('enableNotificationsBtn').addEventListener('click', async () => {
  await primeAdhanAudio();
  await syncPushSubscription(true);
});

$('disableNotificationsBtn').addEventListener('click', async () => {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch('/api/unsubscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ endpoint: sub.endpoint }) });
      await sub.unsubscribe();
    }
    toast('تم إيقاف التنبيهات');
  } catch { toast('تعذر إيقاف التنبيهات'); }
});

function setupAudio() {
  if (!state.audioCtx) state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (state.audioCtx.state === 'suspended') state.audioCtx.resume();
}

function playAlarmTone() {
  setupAudio();
  const ctx = state.audioCtx;
  const start = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, start);
  master.gain.exponentialRampToValueAtTime(0.2, start + 0.03);
  master.connect(ctx.destination);

  for (let i = 0; i < 12; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = start + i * 0.55;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(i % 2 ? 659 : 523, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.5, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
    osc.connect(gain).connect(master);
    osc.start(t); osc.stop(t + 0.42);
  }
  master.gain.exponentialRampToValueAtTime(0.0001, start + 7);
}

async function primeAdhanAudio() {
  const audio = el.adhanAudio;
  if (!audio) return;
  try {
    audio.muted = true;
    audio.volume = 0;
    const p = audio.play();
    if (p) await p;
    audio.pause();
    audio.currentTime = 0;
  } catch (_) {
    // Priming is best-effort. The alarm screen still exposes a manual play button.
  } finally {
    audio.muted = false;
    audio.volume = state.volume;
  }
}

function stopAdhan() {
  adhanAttempt++;
  if (!el.adhanAudio) return;
  try {
    el.adhanAudio.pause();
    el.adhanAudio.currentTime = 0;
  } catch (_) {}
}

const previewAudio = $('previewAudio');
let previewAttempt = 0;
function stopPreview() {
  previewAttempt++;
  previewAudio.pause();
  previewAudio.currentTime = 0;
  if ($('previewAdhanBtn').getAttribute('aria-pressed') === 'true') $('previewAdhanStatus').textContent = 'تم إيقاف المعاينة.';
  $('previewAdhanBtn').textContent = '▶ استمع للصوت';
  $('previewAdhanBtn').setAttribute('aria-pressed', 'false');
}

function selectedVoice() {
  return SalatUtils.voices.find(voice => voice.id === state.voice) || SalatUtils.voices[0];
}

function configureAdhan() {
  stopPreview();
  stopAdhan();
  const voice = selectedVoice();
  el.adhanAudio.src = voice.url;
  previewAudio.src = voice.url;
  el.adhanAudio.volume = previewAudio.volume = state.volume;
  $('adhanVoiceSelect').value = voice.id;
  $('adhanVolume').value = Math.round(state.volume * 100);
  $('adhanVolumeValue').textContent = `${Math.round(state.volume * 100).toLocaleString('ar-EG')}٪`;
}

SalatUtils.voices.forEach(voice => {
  const option = document.createElement('option');
  option.value = voice.id;
  option.textContent = voice.name;
  $('adhanVoiceSelect').append(option);
});
configureAdhan();
$('adhanVoiceSelect').addEventListener('change', () => {
  state.voice = $('adhanVoiceSelect').value;
  const saved = SalatUtils.saveSetting('salat.voice', state.voice);
  configureAdhan();
  $('previewAdhanStatus').textContent = saved ? 'تم حفظ الصوت. اضغط للاستماع وتجربته.' : 'تم تغيير الصوت لهذه الزيارة؛ تعذر حفظه على الجهاز.';
});
$('adhanVolume').addEventListener('input', () => {
  state.volume = Number($('adhanVolume').value) / 100;
  el.adhanAudio.volume = previewAudio.volume = state.volume;
  $('adhanVolumeValue').textContent = `${Math.round(state.volume * 100).toLocaleString('ar-EG')}٪`;
  SalatUtils.saveSetting('salat.volume', String(state.volume));
});
$('previewAdhanBtn').addEventListener('click', async () => {
  if ($('previewAdhanBtn').getAttribute('aria-pressed') === 'true') {
    stopPreview();
    $('previewAdhanStatus').textContent = 'تم إيقاف المعاينة.';
    return;
  }
  const attempt = ++previewAttempt;
  $('previewAdhanBtn').textContent = '■ إيقاف الصوت';
  $('previewAdhanBtn').setAttribute('aria-pressed', 'true');
  $('previewAdhanStatus').textContent = 'جاري تحميل الصوت…';
  try {
    await previewAudio.play();
    if (attempt !== previewAttempt) return;
    $('previewAdhanStatus').textContent = `تستمع الآن إلى: ${selectedVoice().name}`;
  } catch {
    if (attempt !== previewAttempt) return;
    stopPreview();
    $('previewAdhanStatus').textContent = 'تعذر تشغيل التسجيل. تحقق من الإنترنت أو جرّب صوتًا آخر.';
  }
});
previewAudio.addEventListener('ended', () => {
  stopPreview();
  $('previewAdhanStatus').textContent = 'انتهت المعاينة.';
});
previewAudio.addEventListener('error', () => {
  if ($('previewAdhanBtn').getAttribute('aria-pressed') !== 'true') return;
  stopPreview();
  $('previewAdhanStatus').textContent = 'تعذر تحميل التسجيل. تحقق من الإنترنت أو جرّب صوتًا آخر.';
});

async function startAdhan() {
  const audio = el.adhanAudio;
  if (!audio) {
    el.alarmAudioStatus.textContent = 'تعذر تحميل الأذان';
    el.playAdhanBtn.hidden = false;
    playAlarmTone();
    return false;
  }

  stopAdhan();
  const attempt = adhanAttempt;
  audio.muted = false;
  audio.volume = state.volume;
  el.alarmAudioStatus.textContent = 'جاري تشغيل الأذان…';
  el.playAdhanBtn.hidden = true;

  try {
    const playPromise = audio.play();
    if (playPromise) await playPromise;
    if (attempt !== adhanAttempt) return false;
    if (state.audioCtx && state.audioCtx.state === 'running') state.audioCtx.suspend().catch(() => {});
    el.alarmAudioStatus.textContent = '🔊 الأذان يعمل الآن';
    return true;
  } catch (err) {
    if (attempt !== adhanAttempt) return false;
    console.warn('Adhan autoplay blocked or failed:', err);
    el.alarmAudioStatus.textContent = 'اضغط تشغيل الأذان — المتصفح منع التشغيل التلقائي';
    el.playAdhanBtn.hidden = false;
    playAlarmTone();
    return false;
  }
}

function showAlarm(prayerKey, manual = false) {
  stopPreview();
  document.dispatchEvent(new Event('salat:alarm'));
  const p = PRAYERS.find(x => x.key === prayerKey) || PRAYERS[0];
  el.alarmPrayer.textContent = `صلاة ${p.name}`;
  el.alarmScreen.classList.add('show');
  el.alarmScreen.setAttribute('aria-hidden', 'false');
  updateAlarmClock();
  clearInterval(state.alarmTimer);
  state.alarmTimer = setInterval(updateAlarmClock, 1000);
  try { if (navigator.vibrate) navigator.vibrate([700, 400, 700, 400, 900]); } catch {}
  startAdhan();
  if (!manual) localStorage.setItem(`salat.rang.${new Date().toDateString()}.${prayerKey}`, '1');
}

function updateAlarmClock() {
  const now = new Date();
  el.alarmClock.textContent = SalatUtils.formatTime(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`);
}

function stopAlarm() {
  el.alarmScreen.classList.remove('show');
  el.alarmScreen.setAttribute('aria-hidden', 'true');
  clearInterval(state.alarmTimer);
  stopAdhan();
  if (state.audioCtx) state.audioCtx.suspend();
}
$('stopAlarmBtn').addEventListener('click', stopAlarm);
el.playAdhanBtn.addEventListener('click', startAdhan);
async function currentPushEndpoint() {
  try {
    if (!('serviceWorker' in navigator)) return null;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager?.getSubscription();
    return sub?.endpoint || null;
  } catch { return null; }
}

async function postSnooze(path, body) {
  const endpoint = await currentPushEndpoint();
  if (!endpoint) return false;
  try {
    const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint, ...body }) });
    return res.ok;
  } catch { return false; }
}

$('snoozeBtn').addEventListener('click', async () => {
  const text = el.alarmPrayer.textContent.replace('صلاة ', '');
  const p = PRAYERS.find(x => x.name === text) || PRAYERS[0];
  stopAlarm();
  clearTimeout(state.snoozeTimer);
  state.snoozeTimer = setTimeout(() => {
    // Page still open and visible: ring here and cancel the server push to avoid a duplicate.
    // If the page is hidden/locked, leave the server snooze so the push notification wakes the phone.
    if (document.hidden) return;
    postSnooze('/api/snooze/cancel', {});
    showAlarm(p.key, true);
  }, 5 * 60 * 1000);
  const serverSnooze = await postSnooze('/api/snooze', { prayer: p.key });
  toast(serverSnooze ? 'تم ضبط الغفوة 5 دقائق — هيوصلك إشعار حتى لو الشاشة مقفولة' : 'تم ضبط الغفوة لمدة 5 دقائق');
});
$('testAlarmBtn').addEventListener('click', () => {
  showAlarm(state.nextPrayer?.key || 'Fajr', true);
});

function checkForegroundAlarm() {
  if (!state.timings) return;
  const now = new Date();
  const hhmm = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', hour12:false });
  for (const p of PRAYERS) {
    if (!state.enabledPrayers.includes(p.key)) continue;
    if (state.timings[p.key] !== hhmm) continue;
    const key = `salat.rang.${now.toDateString()}.${p.key}`;
    if (!localStorage.getItem(key)) showAlarm(p.key, false);
  }
}

async function enableCompass() {
  if (!state.coords) return toast('حدّد موقعك أولًا');
  try {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') return toast('لم يتم السماح باستخدام البوصلة');
    }
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
    toast('تم تفعيل البوصلة');
  } catch {
    toast('تعذر تفعيل البوصلة على هذا الجهاز');
  }
}

function handleOrientation(e) {
  let heading;
  if (typeof e.webkitCompassHeading === 'number') heading = e.webkitCompassHeading;
  else if (typeof e.alpha === 'number') heading = 360 - e.alpha;
  if (typeof heading !== 'number') return;
  state.heading = heading;
  updateQiblaUI();
}
$('enableCompassBtn').addEventListener('click', enableCompass);
$('refreshTimesBtn').addEventListener('click', loadTimes);

if (el.adhanAudio) {
  el.adhanAudio.addEventListener('ended', () => {
    if (el.alarmScreen.classList.contains('show')) el.alarmAudioStatus.textContent = 'انتهى الأذان';
  });
  el.adhanAudio.addEventListener('error', () => {
    if (el.alarmScreen.classList.contains('show')) {
      el.alarmAudioStatus.textContent = 'تعذر تحميل ملف الأذان — اضغط للمحاولة مرة أخرى';
      el.playAdhanBtn.hidden = false;
    }
  });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'OPEN_PRAYER_ALARM' && PRAYERS.some(p => p.key === event.data.prayer)) {
      showAlarm(event.data.prayer, true);
    }
  });
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && el.alarmScreen.classList.contains('show') && el.adhanAudio?.paused) {
    startAdhan();
  }
});

async function init() {
  renderToggles();
  renderPrayerList();
  await registerServiceWorker().catch(err => console.warn('Service worker unavailable:', err));
  if (state.coords) {
    el.locationLabel.textContent = 'الموقع المحفوظ';
    updateQiblaUI();
    await loadTimes();
    syncPushSubscription(false).catch(() => {});
  }

  const params = new URLSearchParams(location.search);
  const alarmParam = params.get('alarm');
  if (alarmParam && PRAYERS.some(p => p.key === alarmParam)) {
    setTimeout(() => showAlarm(alarmParam, true), 250);
  }

  setInterval(() => {
    updateNextPrayer();
    checkForegroundAlarm();
  }, 10000);
}

init();
