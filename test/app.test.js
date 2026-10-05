const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function appHarness(saved = {}) {
  const elements = new Map();
  const stored = new Map(Object.entries(saved));
  function element(id) {
    if (elements.has(id)) return elements.get(id);
    const classes = new Set();
    const attributes = new Map();
    const item = {
      textContent: '', innerHTML: '', value: '', currentTime: 0, volume: 1, paused: true,
      handlers: {},
      classList: { add: value => classes.add(value), remove: value => classes.delete(value), contains: value => classes.has(value), toggle: () => {} },
      addEventListener: (type, listener) => { item.handlers[type] = listener; },
      setAttribute: (key, value) => attributes.set(key, value),
      getAttribute: key => attributes.get(key),
      removeAttribute: key => attributes.delete(key),
      append: () => {}, querySelectorAll: () => [],
      pause: () => { item.paused = true; },
      play: () => { item.paused = false; return Promise.resolve(); }
    };
    elements.set(id, item);
    return item;
  }
  class Clock extends Date {
    constructor(...args) { if (args.length) super(...args); else super(2026, 9, 5, 15, 40, 0); }
  }
  const context = vm.createContext({
    document: { getElementById: element, createElement: () => element(Symbol()), querySelectorAll: () => [], addEventListener: () => {}, dispatchEvent: () => {}, hidden: false },
    localStorage: { getItem: key => stored.get(key) ?? null, setItem: (key,value) => stored.set(key,value) },
    navigator: {}, window: { addEventListener: () => {} }, location: { search: '' },
    console, Intl, Date: Clock, URLSearchParams, Event,
    setInterval: () => 0, clearInterval: () => {}, setTimeout: () => 0, clearTimeout: () => {}
  });
  for (const file of ['utils.js', 'app.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'public', file), 'utf8'), context);
  }
  return { context, element, stored, run: code => vm.runInContext(code, context) };
}

test('Asr still triggers at 15:40 while all displayed times use 12-hour Arabic', () => {
  const app = appHarness();
  app.run("state.timings = {Fajr:'04:45',Dhuhr:'12:30',Asr:'15:40',Maghrib:'18:10',Isha:'19:30'}; window.rang = []; showAlarm = key => window.rang.push(key); updateNextPrayer(); checkForegroundAlarm();");
  assert.equal(app.element('nextPrayerTime').textContent, '٦:١٠ م');
  assert.ok(app.element('prayerList').innerHTML.includes('٣:٤٠ م'));
  assert.equal(app.run('window.rang.join()'), 'Asr');
  assert.equal(app.run('state.timings.Asr'), '15:40');
  app.run('updateAlarmClock()');
  assert.equal(app.element('alarmClock').textContent, '٣:٤٠ م');
});

test('saved reciter and volume apply to both playback elements and survive audio priming', async () => {
  const app = appHarness({ 'salat.voice': 'nafees', 'salat.volume': '0.35' });
  assert.equal(app.element('adhanAudio').src, '/audio/nafees.mp3');
  assert.equal(app.element('previewAudio').src, app.element('adhanAudio').src);
  assert.equal(app.element('previewAudio').volume, 0.35);
  await app.run('primeAdhanAudio()');
  assert.equal(app.element('adhanAudio').volume, 0.35);
  assert.equal(app.element('adhanAudio').muted, false);
});

test('stopping a pending preview prevents a late play result from replacing the stopped UI', async () => {
  const app = appHarness();
  let resolvePlay;
  app.element('previewAudio').play = () => new Promise(resolve => { resolvePlay = resolve; });
  const pending = app.element('previewAdhanBtn').handlers.click();
  app.run('stopPreview()');
  resolvePlay();
  await pending;
  assert.equal(app.element('previewAdhanBtn').getAttribute('aria-pressed'), 'false');
  assert.equal(app.element('previewAdhanBtn').textContent, '▶ استمع للصوت');
  assert.ok(!app.element('previewAdhanStatus').textContent.includes('تستمع الآن'));
});

test('stopping an alarm during audio loading cancels late playback completion', async () => {
  const app = appHarness();
  let resolvePlay;
  app.element('adhanAudio').play = () => new Promise(resolve => { resolvePlay = resolve; });
  const pending = app.run('startAdhan()');
  app.run('stopAlarm()');
  resolvePlay();
  assert.equal(await pending, false);
  assert.equal(app.element('adhanAudio').paused, true);
  assert.ok(!app.element('alarmAudioStatus').textContent.includes('يعمل الآن'));
});
