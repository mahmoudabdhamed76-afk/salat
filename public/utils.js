const SalatUtils = (() => {
  const voices = [
    { id: 'alafasy', name: 'مشاري راشد العفاسي', url: 'https://cdn.aladhan.com/audio/adhans/a9.mp3' },
    { id: 'nafees', name: 'أحمد النفيس', url: 'https://cdn.aladhan.com/audio/adhans/a1.mp3' },
    { id: 'zahrani', name: 'منصور الزهراني', url: 'https://cdn.aladhan.com/audio/adhans/a11-mansour-al-zahrani.mp3' },
    { id: 'classic', name: 'الأذان الأصلي', url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a9/Muslim_calling_to_prayer.ogg/Muslim_calling_to_prayer.ogg.mp3' }
  ];
  function formatTime(time) {
    const match = /^(\d{1,2}):(\d{2})$/.exec(String(time));
    if (!match) return '--:--';
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour > 23 || minute > 59) return '--:--';
    const digits = new Intl.NumberFormat('ar-EG', { useGrouping: false });
    return `${digits.format(hour % 12 || 12)}:${digits.format(minute).padStart(2, '٠')} ${hour >= 12 ? 'م' : 'ص'}`;
  }
  function readSetting(key, fallback) {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  }
  function saveSetting(key, value) {
    try { localStorage.setItem(key, value); return true; } catch { return false; }
  }
  return { voices, formatTime, readSetting, saveSetting };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = SalatUtils;
