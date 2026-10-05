(() => {
  // Arabic matn verified against the linked Sahih al-Bukhari / Sahih Muslim entries.
  const HADITHS = [
    {
      category: 'الصلاة', narrator: 'أبو موسى الأشعري', book: 'صحيح البخاري', number: '574',
      text: 'مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ.',
      note: 'البردان: صلاة الفجر وصلاة العصر.', url: 'https://sunnah.com/bukhari:574'
    },
    {
      category: 'القرآن', narrator: 'عثمان بن عفان', book: 'صحيح البخاري', number: '5027',
      text: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ.', url: 'https://sunnah.com/bukhari:5027'
    },
    {
      category: 'الأخلاق', narrator: 'عبد الله بن عمرو', book: 'صحيح البخاري', number: '10',
      text: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالْمُهَاجِرُ مَنْ هَجَرَ مَا نَهَى اللَّهُ عَنْهُ.',
      url: 'https://sunnah.com/bukhari:10'
    },
    {
      category: 'الأخلاق', narrator: 'أبو هريرة', book: 'صحيح البخاري', number: '6114',
      text: 'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ.',
      url: 'https://sunnah.com/bukhari:6114'
    },
    {
      category: 'الإيمان', narrator: 'تميم الداري', book: 'صحيح مسلم', number: '55',
      text: '«الدِّينُ النَّصِيحَةُ». قُلْنَا: لِمَنْ؟ قَالَ: «لِلَّهِ وَلِكِتَابِهِ وَلِرَسُولِهِ وَلِأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ».',
      url: 'https://sunnah.com/muslim:55a'
    },
    {
      category: 'الأخلاق', narrator: 'أبو ذر', book: 'صحيح مسلم', number: '2626',
      text: 'لَا تَحْقِرَنَّ مِنَ الْمَعْرُوفِ شَيْئًا وَلَوْ أَنْ تَلْقَى أَخَاكَ بِوَجْهٍ طَلْقٍ.',
      url: 'https://sunnah.com/muslim:2626'
    },
    {
      category: 'الذكر والطهارة', narrator: 'أبو مالك الأشعري', book: 'صحيح مسلم', number: '223',
      text: 'الطُّهُورُ شَطْرُ الْإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلَأُ الْمِيزَانَ، وَسُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ تَمْلَآنِ ـ أَوْ تَمْلَأُ ـ مَا بَيْنَ السَّمَوَاتِ وَالْأَرْضِ، وَالصَّلَاةُ نُورٌ، وَالصَّدَقَةُ بُرْهَانٌ، وَالصَّبْرُ ضِيَاءٌ، وَالْقُرْآنُ حُجَّةٌ لَكَ أَوْ عَلَيْكَ، كُلُّ النَّاسِ يَغْدُو فَبَائِعٌ نَفْسَهُ فَمُعْتِقُهَا أَوْ مُوبِقُهَا.',
      url: 'https://sunnah.com/muslim:223'
    },
    {
      category: 'الإيمان', narrator: 'أنس بن مالك', book: 'صحيح البخاري', number: '13',
      text: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.',
      url: 'https://sunnah.com/bukhari:13'
    }
  ];

  const $ = (id) => document.getElementById(id);
  const search = $('hadithSearch');
  const category = $('hadithCategory');
  const list = $('hadithList');
  let dailyKey;

  function normalize(text) {
    return text.normalize('NFKD').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
      .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
      .replace(/[٠-٩]/g, digit => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit))
      .replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function createContent(hadith) {
    const content = document.createDocumentFragment();
    const meta = document.createElement('div');
    meta.className = 'hadith-meta';
    for (const [className, text] of [['hadith-category', hadith.category], ['hadith-grade', 'صحيح']]) {
      const badge = document.createElement('span');
      badge.className = className;
      badge.textContent = text;
      meta.append(badge);
    }
    const narrator = document.createElement('p');
    narrator.className = 'hadith-narrator';
    narrator.textContent = `الراوي: ${hadith.narrator} · عن النبي ﷺ`;
    const quote = document.createElement('blockquote');
    quote.className = 'hadith-text';
    quote.textContent = hadith.text;
    const footer = document.createElement('div');
    footer.className = 'hadith-footer';
    const source = document.createElement('a');
    source.className = 'hadith-source';
    source.href = hadith.url;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    source.textContent = `${hadith.book} · ${hadith.number} ↗`;
    source.setAttribute('aria-label', `مصدر الحديث: ${hadith.book}، رقم ${hadith.number}، يفتح في نافذة جديدة`);
    footer.append(source);
    if (hadith.note) {
      const note = document.createElement('span');
      note.className = 'hadith-note';
      note.textContent = hadith.note;
      footer.append(note);
    }
    content.append(meta, narrator, quote, footer);
    return content;
  }

  function renderHadiths() {
    const words = normalize(search.value).split(' ').filter(Boolean);
    const matches = HADITHS.filter(hadith => {
      const text = normalize([hadith.text, hadith.narrator, hadith.book, hadith.number, hadith.category, hadith.note || ''].join(' '));
      return (!category.value || hadith.category === category.value) && words.every(word => text.includes(word));
    });
    list.replaceChildren(...matches.map(hadith => {
      const card = document.createElement('article');
      card.className = 'section-card';
      card.append(createContent(hadith));
      return card;
    }));
    $('hadithCount').textContent = `النتائج: ${matches.length.toLocaleString('ar-EG')} من ${HADITHS.length.toLocaleString('ar-EG')}`;
    $('hadithEmpty').hidden = matches.length > 0;
  }

  function renderDailyHadith() {
    const now = new Date();
    // Local calendar date, converted to a day number without DST affecting the rotation.
    const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    if (day === dailyKey) return;
    dailyKey = day;
    $('dailyHadith').replaceChildren(createContent(HADITHS[day % HADITHS.length]));
  }

  search.addEventListener('input', renderHadiths);
  category.addEventListener('change', renderHadiths);
  $('browseHadithBtn').addEventListener('click', () => {
    document.querySelector('[data-view="hadithView"]').click();
    $('hadithHeading').scrollIntoView({ block: 'start' });
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) renderDailyHadith();
  });
  renderHadiths();
  renderDailyHadith();
  setInterval(renderDailyHadith, 60000);
})();
