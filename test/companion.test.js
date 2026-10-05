const test = require('node:test');
const assert = require('node:assert/strict');
const SalatTheme = require('../public/theme.js');
const SalatCompanion = require('../public/companion.js');
const { isReminderDue, isWithinSendWindow, cleanReminderMinutes, minutesText } = require('../server.js');

const timings = { Fajr: '05:24', Dhuhr: '12:43', Asr: '16:06', Maghrib: '18:36', Isha: '19:53' };
const at = (h, m, day = 5) => new Date(2026, 9, day, h, m);

test('auto theme is night from Maghrib until Fajr, day otherwise', () => {
  assert.equal(SalatTheme.resolve('auto', { timings, now: at(18, 35) }), 'day');
  assert.equal(SalatTheme.resolve('auto', { timings, now: at(18, 36) }), 'night');
  assert.equal(SalatTheme.resolve('auto', { timings, now: at(2, 0) }), 'night');
  assert.equal(SalatTheme.resolve('auto', { timings, now: at(5, 24) }), 'day');
});

test('fixed modes ignore time; auto without timings follows the phone, then the clock', () => {
  assert.equal(SalatTheme.resolve('day', { timings, now: at(23, 0) }), 'day');
  assert.equal(SalatTheme.resolve('night', { timings, now: at(12, 0) }), 'night');
  assert.equal(SalatTheme.resolve('auto', { now: at(12, 0), systemDark: true }), 'night');
  assert.equal(SalatTheme.resolve('auto', { now: at(12, 0) }), 'day');
  assert.equal(SalatTheme.resolve('auto', { now: at(20, 0) }), 'night');
});

test('marking a prayer toggles it for that day only', () => {
  const day = at(13, 0);
  let { log, done } = SalatCompanion.togglePrayed({}, 'Dhuhr', day);
  assert.equal(done, true);
  assert.deepEqual(log['2026-10-05'], ['Dhuhr']);
  ({ log } = SalatCompanion.togglePrayed(log, 'Fajr', day));
  assert.deepEqual(log['2026-10-05'], ['Fajr', 'Dhuhr']);
  ({ log, done } = SalatCompanion.togglePrayed(log, 'Dhuhr', day));
  assert.equal(done, false);
  assert.deepEqual(log['2026-10-05'], ['Fajr']);
  assert.equal(SalatCompanion.togglePrayed(log, 'Witr', day).done, false);
});

test('streak counts full days ending today, or yesterday while today is in progress', () => {
  const all = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const log = { '2026-10-02': all, '2026-10-03': all, '2026-10-04': all, '2026-10-05': ['Fajr'] };
  assert.equal(SalatCompanion.streak(log, at(13, 0)), 3);
  log['2026-10-05'] = all;
  assert.equal(SalatCompanion.streak(log, at(21, 0)), 4);
  log['2026-10-03'] = ['Fajr'];
  assert.equal(SalatCompanion.streak(log, at(21, 0)), 2);
  assert.equal(SalatCompanion.streak({}, at(21, 0)), 0);
});

test('week view covers the last 7 days ending today, and old log days are pruned', () => {
  const log = { '2026-10-05': ['Fajr', 'Asr'], '2026-09-29': ['Isha'], '2026-06-01': ['Fajr'] };
  const week = SalatCompanion.week(log, at(13, 0));
  assert.equal(week.length, 7);
  assert.equal(week[0].key, '2026-09-29');
  assert.deepEqual(week[0].prayers, [false, false, false, false, true]);
  assert.equal(week[6].isToday, true);
  assert.deepEqual(week[6].prayers, [true, false, true, false, false]);
  assert.deepEqual(Object.keys(SalatCompanion.prune(log, at(13, 0))).sort(), ['2026-09-29', '2026-10-05']);
});

test('post-prayer adhkar total 100 tasbih/tahmid/takbir/tamam and all have sources', () => {
  const ids = Object.fromEntries(SalatCompanion.ADHKAR.map(d => [d.id, d.count]));
  assert.equal(ids.tasbih + ids.tahmid + ids.takbir + ids.tamam, 100);
  assert.equal(ids.istighfar, 3);
  for (const d of SalatCompanion.ADHKAR) assert.match(d.url, /^https:\/\/sunnah\.com\//);
});

test('pre-prayer reminder fires before the adhan only, once window', () => {
  assert.equal(isReminderDue('18:36', '18:26', 10), true);
  assert.equal(isReminderDue('18:36', '18:30', 10), true);
  assert.equal(isReminderDue('18:36', '18:31', 10), false);
  assert.equal(isReminderDue('18:36', '18:25', 10), false);
  assert.equal(isReminderDue('18:36', '18:31', 5), true);
  assert.equal(isReminderDue('18:36', '18:36', 5), false);
  assert.equal(isReminderDue('18:36', '18:26', 0), false);
});

test('adhan push tolerates a restart for 10 minutes after the prayer time', () => {
  assert.equal(isWithinSendWindow('19:53', '19:53'), true);
  assert.equal(isWithinSendWindow('19:53', '20:02'), true);
  assert.equal(isWithinSendWindow('19:53', '20:03'), false);
  assert.equal(isWithinSendWindow('19:53', '19:52'), false);
});

test('reminder minutes are validated and phrased in correct Arabic', () => {
  assert.equal(cleanReminderMinutes('15'), 15);
  assert.equal(cleanReminderMinutes(7), 0);
  assert.equal(cleanReminderMinutes(undefined, 10), 10);
  assert.equal(minutesText(10), '١٠ دقائق');
  assert.equal(minutesText(15), '١٥ دقيقة');
  assert.equal(SalatCompanion.minutesText(5), '٥ دقائق');
});
