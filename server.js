const express = require('express');
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');
const SalatUtils = require('./public/utils.js');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, 'data', 'subscriptions.json');
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

app.use(express.json({ limit: '256kb' }));
app.use(express.static(path.join(__dirname, 'public')));

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} else {
  console.warn('[push] VAPID keys are missing. Background push notifications are disabled until configured.');
}

function ensureDataFile() {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, '[]', 'utf8');
}

function readSubscriptions() {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('[data] Failed to read subscriptions:', err.message);
    return [];
  }
}

function writeSubscriptions(items) {
  ensureDataFile();
  const tmp = `${DATA_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(items, null, 2), 'utf8');
  fs.renameSync(tmp, DATA_PATH);
}

function isValidLatLng(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, pushConfigured: Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) });
});

app.get('/api/config', (_req, res) => {
  res.json({ vapidPublicKey: VAPID_PUBLIC_KEY, pushConfigured: Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) });
});

const timingsCache = new Map();

function localDateParts(timeZone = 'Africa/Cairo') {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date());
  const obj = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return {
    dateApi: `${obj.day}-${obj.month}-${obj.year}`,
    dateKey: `${obj.year}-${obj.month}-${obj.day}`,
    hhmm: `${obj.hour}:${obj.minute}`
  };
}

async function getPrayerTimes(lat, lng, dateApi) {
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}:${dateApi}`;
  const cached = timingsCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < 6 * 60 * 60 * 1000) return cached.data;

  // Method 5 = Egyptian General Authority of Survey. Tuneable from the client later if needed.
  const url = new URL(`https://api.aladhan.com/v1/timings/${dateApi}`);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set('method', '5');
  url.searchParams.set('school', '0');

  const response = await fetch(url, { headers: { 'User-Agent': 'SalatReminder/1.0' } });
  if (!response.ok) throw new Error(`Prayer API returned ${response.status}`);
  const json = await response.json();
  const t = json?.data?.timings;
  if (!t) throw new Error('Prayer API returned no timings');

  const data = {
    Fajr: String(t.Fajr).slice(0, 5),
    Dhuhr: String(t.Dhuhr).slice(0, 5),
    Asr: String(t.Asr).slice(0, 5),
    Maghrib: String(t.Maghrib).slice(0, 5),
    Isha: String(t.Isha).slice(0, 5)
  };
  timingsCache.set(cacheKey, { ts: Date.now(), data });
  return data;
}

app.get('/api/timings', async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const timeZone = String(req.query.tz || 'Africa/Cairo');
    if (!isValidLatLng(lat, lng)) return res.status(400).json({ error: 'Invalid coordinates' });
    const { dateApi } = localDateParts(timeZone);
    const timings = await getPrayerTimes(lat, lng, dateApi);
    res.json({ date: dateApi, timings });
  } catch (err) {
    console.error('[timings]', err.message);
    res.status(502).json({ error: 'Could not load prayer times' });
  }
});

app.post('/api/subscriptions', (req, res) => {
  try {
    const { subscription, lat, lng, timeZone, enabledPrayers, reminderMinutes } = req.body || {};
    const latitude = Number(lat);
    const longitude = Number(lng);

    if (!subscription?.endpoint) return res.status(400).json({ error: 'Missing push subscription' });
    if (!isValidLatLng(latitude, longitude)) return res.status(400).json({ error: 'Invalid coordinates' });

    const cleanPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].filter(p => enabledPrayers?.includes(p));
    const items = readSubscriptions();
    const existingIndex = items.findIndex(x => x.subscription?.endpoint === subscription.endpoint);
    const record = {
      subscription,
      lat: latitude,
      lng: longitude,
      timeZone: timeZone || 'Africa/Cairo',
      enabledPrayers: cleanPrayers.length ? cleanPrayers : ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
      reminderMinutes: cleanReminderMinutes(reminderMinutes, existingIndex >= 0 ? items[existingIndex].reminderMinutes : 0),
      snooze: existingIndex >= 0 ? items[existingIndex].snooze : undefined,
      lastSent: existingIndex >= 0 ? (items[existingIndex].lastSent || {}) : {},
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) items[existingIndex] = record;
    else items.push(record);
    writeSubscriptions(items);
    res.json({ ok: true });
  } catch (err) {
    console.error('[subscription]', err.message);
    res.status(500).json({ error: 'Could not save subscription' });
  }
});

app.post('/api/unsubscribe', (req, res) => {
  try {
    const endpoint = req.body?.endpoint;
    if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });
    const items = readSubscriptions().filter(x => x.subscription?.endpoint !== endpoint);
    writeSubscriptions(items);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not unsubscribe' });
  }
});

const prayerNames = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء'
};

const SNOOZE_MS = 5 * 60 * 1000;
// A prayer push is still sent if the server was restarting/redeploying during the exact minute.
const SEND_WINDOW_MIN = 10;

function hhmmToMinutes(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN;
}

function isWithinSendWindow(prayerTime, nowHhmm) {
  const diff = hhmmToMinutes(nowHhmm) - hhmmToMinutes(prayerTime);
  return diff >= 0 && diff < SEND_WINDOW_MIN;
}

const REMINDER_OPTIONS = [0, 5, 10, 15, 20, 30];
function cleanReminderMinutes(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return REMINDER_OPTIONS.includes(fallback) ? fallback : 0;
  const n = Number(value);
  return REMINDER_OPTIONS.includes(n) ? n : 0;
}

// Pre-prayer reminder: due from (prayer - N min) for a few minutes, and always before the adhan itself.
function isReminderDue(prayerTime, nowHhmm, minutesBefore) {
  if (!minutesBefore) return false;
  const diff = hhmmToMinutes(nowHhmm) - (hhmmToMinutes(prayerTime) - minutesBefore);
  return diff >= 0 && diff < Math.min(5, minutesBefore);
}

function minutesText(n) {
  const digits = new Intl.NumberFormat('ar-EG', { useGrouping: false }).format(n);
  return n >= 3 && n <= 10 ? `${digits} دقائق` : `${digits} دقيقة`;
}

function pruneLastSent(lastSent, todayKey) {
  for (const key of Object.keys(lastSent || {})) {
    if (!key.startsWith(todayKey)) delete lastSent[key];
  }
}

// Returns 'ok', 'gone' (subscription expired) or 'error'.
async function sendPush(item, payload) {
  try {
    await webpush.sendNotification(item.subscription, JSON.stringify(payload), { TTL: 300, urgency: 'high' });
    return 'ok';
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) return 'gone';
    console.error('[push] send failed:', err.statusCode || '', err.message);
    return 'error';
  }
}

app.post('/api/snooze', (req, res) => {
  try {
    const { endpoint, prayer } = req.body || {};
    if (!endpoint || !prayerNames[prayer]) return res.status(400).json({ error: 'Missing endpoint or prayer' });
    const items = readSubscriptions();
    const item = items.find(x => x.subscription?.endpoint === endpoint);
    if (!item) return res.status(404).json({ error: 'Subscription not found' });
    item.snooze = { prayer, at: Date.now() + SNOOZE_MS };
    writeSubscriptions(items);
    res.json({ ok: true, at: item.snooze.at });
  } catch (err) {
    console.error('[snooze]', err.message);
    res.status(500).json({ error: 'Could not snooze' });
  }
});

app.post('/api/snooze/cancel', (req, res) => {
  try {
    const endpoint = req.body?.endpoint;
    if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });
    const items = readSubscriptions();
    const item = items.find(x => x.subscription?.endpoint === endpoint);
    if (item?.snooze) {
      delete item.snooze;
      writeSubscriptions(items);
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not cancel snooze' });
  }
});

let schedulerBusy = false;
async function runScheduler() {
  if (schedulerBusy || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;
  schedulerBusy = true;
  try {
    const items = readSubscriptions();
    let changed = false;

    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      try {
        // Snoozed alarm: delivered by the server so it works while the phone is locked.
        if (item.snooze && Date.now() >= item.snooze.at) {
          const { prayer } = item.snooze;
          delete item.snooze;
          changed = true;
          const result = await sendPush(item, {
            title: `⏰ صلاة ${prayerNames[prayer]} (بعد الغفوة)`,
            body: `انتهت الغفوة — حان وقت صلاة ${prayerNames[prayer]}`,
            prayer,
            prayerName: prayerNames[prayer],
            tag: `snooze:${prayer}:${Date.now()}`,
            url: `/?alarm=${prayer}`
          });
          if (result === 'gone') {
            items.splice(i, 1);
            console.log('[push] Removed expired subscription');
            continue;
          }
          if (result === 'ok') console.log(`[push] snooze ${prayer} sent`);
        }

        const now = localDateParts(item.timeZone || 'Africa/Cairo');
        const timings = await getPrayerTimes(item.lat, item.lng, now.dateApi);
        const prayers = item.enabledPrayers || Object.keys(prayerNames);

        for (const prayer of prayers) {
          const preKey = `${now.dateKey}:${prayer}:pre`;
          if (isReminderDue(timings[prayer], now.hhmm, item.reminderMinutes) && !item.lastSent?.[preKey]) {
            const result = await sendPush(item, {
              kind: 'reminder',
              title: `🕌 اقتربت صلاة ${prayerNames[prayer]}`,
              body: `باقي ${minutesText(item.reminderMinutes)} على الأذان — ${SalatUtils.formatTime(timings[prayer])}`,
              prayer,
              tag: preKey,
              url: '/'
            });
            if (result === 'gone') {
              items.splice(i, 1);
              changed = true;
              console.log('[push] Removed expired subscription');
              break;
            }
            if (result === 'ok') {
              item.lastSent = item.lastSent || {};
              pruneLastSent(item.lastSent, now.dateKey);
              item.lastSent[preKey] = new Date().toISOString();
              changed = true;
              console.log(`[push] ${prayer} reminder sent`);
            }
          }

          if (!isWithinSendWindow(timings[prayer], now.hhmm)) continue;
          const sentKey = `${now.dateKey}:${prayer}`;
          if (item.lastSent?.[sentKey]) continue;

          const result = await sendPush(item, {
            title: `⏰ صلاة ${prayerNames[prayer]}`,
            body: `حان الآن وقت صلاة ${prayerNames[prayer]}`,
            prayer,
            prayerName: prayerNames[prayer],
            time: timings[prayer],
            tag: sentKey,
            url: `/?alarm=${prayer}`
          });

          if (result === 'gone') {
            items.splice(i, 1);
            changed = true;
            console.log('[push] Removed expired subscription');
            break;
          }
          if (result === 'ok') {
            item.lastSent = item.lastSent || {};
            pruneLastSent(item.lastSent, now.dateKey);
            item.lastSent[sentKey] = new Date().toISOString();
            changed = true;
            console.log(`[push] ${prayer} sent to ${item.subscription.endpoint.slice(0, 40)}...`);
          }
        }
      } catch (err) {
        console.error('[scheduler item]', err.message);
      }
    }

    if (changed) writeSubscriptions(items);
  } finally {
    schedulerBusy = false;
  }
}

if (require.main === module) {
  setInterval(runScheduler, 30 * 1000);
  setTimeout(runScheduler, 5000);
  app.listen(PORT, () => {
    console.log(`Salat Reminder running on port ${PORT}`);
  });
}

module.exports = { app, isWithinSendWindow, isReminderDue, cleanReminderMinutes, minutesText };
