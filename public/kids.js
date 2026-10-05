(() => {
  const lessons = {
    wudu: {
      title: 'وضوئي الجميل', source: 'https://sunnah.com/bukhari:159',
      note: 'ابدأ بنية الوضوء في قلبك، وقل بسم الله. تعلّم الخطوات مع أحد والديك، ولا تسرف في الماء.',
      steps: [
        ['نغسل الكفّين', 'اغسل كفّيك ثلاث مرات، ونظّف ما بين الأصابع.', 'hands', 'نبدأ بنظافة اليدين 💧'],
        ['نتمضمض', 'ضع قليلًا من الماء في فمك، وحرّكه برفق ثم أخرجه. كرّر ثلاث مرات.', 'mouth', 'قليل من الماء يكفي'],
        ['ننظّف الأنف', 'استنشق قليلًا من الماء برفق، ثم أخرجه. كرّر ثلاث مرات بمساعدة أحد والديك.', 'nose', 'بلطف، بدون مبالغة'],
        ['نغسل الوجه', 'اغسل وجهك من منبت الشعر إلى الذقن، ومن الأذن إلى الأذن، ثلاث مرات.', 'face', 'كل الوجه، بهدوء'],
        ['نغسل الذراعين', 'اغسل اليد اليمنى إلى المرفق، ثم اليسرى إلى المرفق، ثلاث مرات لكل يد.', 'arms', 'المرفق جزء من الغسل'],
        ['نمسح الرأس', 'بلّل يديك وامسح الرأس من الأمام إلى الخلف ثم عُد إلى الأمام، مرة واحدة.', 'head', 'مسح، وليس غسلًا'],
        ['نمسح الأذنين', 'امسح أذنيك من الداخل والخارج برفق بيديك المبلّلتين، مرة واحدة.', 'ears', 'برفق حول الأذن'],
        ['نغسل القدمين', 'اغسل القدم اليمنى ثم اليسرى مع الكعبين، ثلاث مرات لكل قدم، ونظّف بين الأصابع.', 'feet', 'أحسنت! وضوؤك اكتمل ⭐']
      ]
    },
    prayer: {
      title: 'نتعلّم صلاة الفجر', source: 'https://sunnah.com/muslim:397a',
      note: 'مثال مبسّط لصلاة الفجر: ركعتان. توضّأ أولًا، وتأكد من طهارة المكان والملابس وستر العورة، واستقبل القبلة. تعلّم القراءة والتشهد مع أحد والديك.',
      steps: [
        ['نستعد للصلاة', 'قف باتجاه القبلة، وانْوِ صلاة الفجر في قلبك. خذ وقتك ولا تتعجّل.', 'stand', 'الفجر ركعتان'],
        ['تكبيرة الإحرام', 'ارفع يديك عند التكبير، ثم ضع اليمنى على اليسرى وأنت قائم.', 'takbir', 'الله أكبر'],
        ['القراءة · الركعة الأولى', 'اقرأ سورة الفاتحة، ثم ما تيسّر من القرآن. تعلّم القراءة الصحيحة مع أحد والديك.', 'read', 'نقرأ بهدوء'],
        ['الركوع · الركعة الأولى', 'قل الله أكبر واركع، وضع يديك على ركبتيك واجعل ظهرك مستقيمًا. اطمئن في الركوع.', 'bow', 'سبحان ربي العظيم'],
        ['نعتدل من الركوع', 'ارفع من الركوع حتى تقف مستقيمًا. لا تنتقل للسجود قبل أن تطمئن.', 'stand', 'سمع الله لمن حمده · ربنا ولك الحمد'],
        ['السجدة الأولى', 'قل الله أكبر واسجد. ضع الجبهة والأنف والكفّين والركبتين وأطراف القدمين على الأرض.', 'prostrate', 'سبحان ربي الأعلى'],
        ['نجلس بين السجدتين', 'قل الله أكبر وارفع من السجود، ثم اجلس بهدوء حتى تطمئن.', 'sit', 'رب اغفر لي'],
        ['السجدة الثانية', 'قل الله أكبر واسجد مرة ثانية، واطمئن في سجودك.', 'prostrate', 'سبحان ربي الأعلى'],
        ['نقوم للركعة الثانية', 'قل الله أكبر، ثم قُم للركعة الثانية. بقيت ركعة واحدة.', 'stand', 'نكمّل بهدوء'],
        ['القراءة · الركعة الثانية', 'اقرأ سورة الفاتحة، ثم ما تيسّر من القرآن، وأنت قائم.', 'read', 'لكل ركعة فاتحة'],
        ['الركوع · الركعة الثانية', 'قل الله أكبر واركع، وضع يديك على ركبتيك واطمئن.', 'bow', 'سبحان ربي العظيم'],
        ['نعتدل مرة ثانية', 'ارفع من الركوع حتى تقف مستقيمًا، واطمئن قبل السجود.', 'stand', 'سمع الله لمن حمده · ربنا ولك الحمد'],
        ['السجدة الأولى · الركعة الثانية', 'قل الله أكبر واسجد على الأعضاء السبعة، واطمئن.', 'prostrate', 'سبحان ربي الأعلى'],
        ['الجلوس بين السجدتين', 'قل الله أكبر، ثم اجلس بهدوء بين السجدتين.', 'sit', 'رب اغفر لي'],
        ['السجدة الثانية · الركعة الثانية', 'قل الله أكبر واسجد مرة ثانية. بعد هذه السجدة نجلس للتشهد.', 'prostrate', 'سبحان ربي الأعلى'],
        ['التشهد الأخير', 'اجلس واقرأ التشهد كاملًا، ثم الصلاة على النبي ﷺ، وادعُ الله. تعلّم هذه الكلمات مع أحد والديك.', 'sit', 'التحيات لله والصلوات والطيبات…'],
        ['التسليم', 'سلّم عن يمينك ثم عن يسارك، وقل في كل جهة: السلام عليكم ورحمة الله.', 'salam', 'السلام عليكم ورحمة الله']
      ]
    },
    pillars: {
      title: 'أركان الإسلام الخمسة', source: 'https://sunnah.com/bukhari:8',
      note: 'نتعرّف إلى أركان الإسلام معًا. اسأل أحد والديك عن كل ركن، وكيف نعمل به.',
      steps: [
        ['الشهادتان', 'نؤمن بالله وحده، ونؤمن أن محمدًا ﷺ رسول الله.', 'testimony', 'أشهد أن لا إله إلا الله وأن محمدًا رسول الله'],
        ['الصلاة', 'نصلّي خمس صلوات كل يوم: الفجر، الظهر، العصر، المغرب، والعشاء.', 'mosque', 'خمس صلوات في يومنا'],
        ['الزكاة', 'الزكاة حق في المال يدفعه المسلم إذا تحققت شروطها. تعين المحتاجين وتعلّمنا العطاء.', 'charity', 'نحب الخير للآخرين'],
        ['صوم رمضان', 'يصوم المسلم من الفجر إلى المغرب في رمضان. الطفل يتعلّم الصيام بالتدريج مع والديه عندما يستطيع.', 'moon', 'شهر الخير والرحمة'],
        ['الحج', 'يحج المسلم إلى بيت الله الحرام إذا استطاع، مرة في العمر.', 'kaaba', 'بيت الله في مكة 🕋']
      ]
    },
    kindness: {
      title: 'خير صغير كل يوم', source: 'https://sunnah.com/muslim:2626',
      note: 'أعمال صغيرة تجعل يومنا أجمل. جرّب عملًا طيبًا اليوم، واحكِ عنه لأحد والديك.',
      steps: [
        ['نبتسم ونسلّم', 'استقبل الآخرين بوجه بشوش، وقل: السلام عليكم.', 'smile', 'الابتسامة بداية جميلة'],
        ['نقول الصدق', 'قل الحقيقة بلطف. وإذا أخطأت، اعترف بخطئك وحاول إصلاحه.', 'heart', 'أنا أتعلم أن أكون صادقًا'],
        ['نساعد ونشارك', 'ساعد في ترتيب البيت، وشارك ألعابك، واستأذن قبل أخذ شيء يخص غيرك.', 'charity', 'يد تساعد وقلب يحب'],
        ['نحافظ على النظافة', 'رتّب مكانك، وضع القمامة في سلتها، واعتنِ بملابسك وأدواتك.', 'leaf', 'مكان نظيف… يوم جميل']
      ]
    }
  };
  const questions = [
    ['كم صلاة نصلّي كل يوم؟', ['خمس صلوات', 'صلاتان', 'سبع صلوات'], 0, 'الفجر والظهر والعصر والمغرب والعشاء.'],
    ['ماذا نفعل قبل الصلاة؟', ['نركض بسرعة', 'نتوضأ ونستعد', 'نترك المكان متسخًا'], 1, 'نتوضأ، ونستعد في مكان طاهر، ونستقبل القبلة.'],
    ['كم ركعة في صلاة الفجر؟', ['أربع ركعات', 'ثلاث ركعات', 'ركعتان'], 2, 'صلاة الفجر ركعتان.'],
    ['ماذا نقول في الركوع؟', ['سبحان ربي العظيم', 'السلام عليكم', 'رب اغفر لي'], 0, 'نقول سبحان ربي العظيم، ونطمئن في الركوع.'],
    ['ماذا نقول في السجود؟', ['سبحان ربي العظيم', 'سبحان ربي الأعلى', 'السلام عليكم'], 1, 'نقول سبحان ربي الأعلى، ونطمئن في السجود.'],
    ['كم عدد أركان الإسلام؟', ['ثلاثة', 'سبعة', 'خمسة'], 2, 'الشهادتان، الصلاة، الزكاة، صوم رمضان، والحج.'],
    ['كيف نستعمل الماء في الوضوء؟', ['نتركه جاريًا دائمًا', 'نستخدم ما يكفي دون إسراف', 'نرشّه للّعب'], 1, 'نحافظ على الماء ونستخدم ما يكفي للوضوء.'],
    ['ما التصرف الطيب؟', ['مساعدة الآخرين', 'أخذ ألعابهم دون إذن', 'السخرية منهم'], 0, 'نساعد الآخرين ونشاركهم الخير.']
  ];
  const $ = id => document.getElementById(id);
  let lessonKey = 'wudu';
  let stepIndex = 0;
  let questionIndex = 0;
  let autoTimer = null;
  let finished = false;
  let previousPose = null;
  let completed = [];
  let solved = [];
  try {
    const saved = JSON.parse(SalatUtils.readSetting('salat.kids.progress', '{}'));
    completed = [...new Set((Array.isArray(saved.lessons) ? saved.lessons : []).filter(key => Object.hasOwn(lessons, key)))];
    solved = [...new Set((Array.isArray(saved.questions) ? saved.questions : []).filter(index => Number.isInteger(index) && index >= 0 && index < questions.length))];
  } catch { /* A damaged saved progress value must not prevent lessons from opening. */ }

  function rewards() {
    $('kidsStars').textContent = `⭐ ${(completed.length + solved.length).toLocaleString('ar-EG')} نجوم`;
    $('kidsProgress').textContent = `${completed.length.toLocaleString('ar-EG')} من ٤ دروس`;
    document.querySelectorAll('[data-lesson]').forEach(button => {
      button.classList.toggle('completed', completed.includes(button.dataset.lesson));
    });
    return SalatUtils.saveSetting('salat.kids.progress', JSON.stringify({ lessons: completed, questions: solved }));
  }

  const face = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="22" fill="#f2c49b"/><path d="M${cx-21} ${cy-6} Q${cx} ${cy-30} ${cx+21} ${cy-6}" fill="#fbf8ee" stroke="#ded8c9" stroke-width="3"/>`;
  const poses = {
    stand: { head:[180,86], body:'M160 110L200 110L209 186L151 186Z', legs:['M167 192L166 211L165 228','M193 192L194 211L195 228'], arms:['M160 125L154 148L153 170','M200 125L206 148L207 170'] },
    takbir: { head:[180,86], body:'M160 110L200 110L209 186L151 186Z', legs:['M167 192L166 211L165 228','M193 192L194 211L195 228'], arms:['M160 125L143 113L145 84','M200 125L217 113L215 84'] },
    read: { head:[180,86], body:'M160 110L200 110L209 186L151 186Z', legs:['M167 192L166 211L165 228','M193 192L194 211L195 228'], arms:['M160 125L164 155L194 147','M200 125L196 155L172 147'] },
    bow: { head:[235,146], body:'M145 147L210 147L212 174L145 174Z', legs:['M153 180L150 204L148 228','M179 180L178 204L177 228'], arms:['M200 157L190 181L176 199','M208 159L196 183L183 200'] },
    prostrate: { head:[247,215], body:'M154 164L216 186L205 208L143 192Z', legs:['M150 196L176 225L130 228','M154 199L183 228L137 232'], arms:['M210 192L226 220L254 232','M216 195L233 222L261 234'] },
    sit: { head:[187,130], body:'M166 153L206 153L214 202L161 202Z', legs:['M175 207L208 228L157 230','M180 208L216 232L163 234'], arms:['M166 166L159 194L180 208','M205 166L215 195L194 208'] }
  };
  function person(pose) {
    const current = poses[pose] || poses.sit;
    const previous = poses[previousPose] || current;
    const moving = $('kidsMotionToggle').checked && !reduceMotion.matches && previous !== current;
    const animate = (from, to) => moving ? `<animate attributeName="d" from="${from}" to="${to}" dur="0.65s" fill="freeze"/>` : '';
    const path = (to, from, color, width) => `<path d="${to}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${animate(from,to)}</path>`;
    const head = `<g transform="translate(${current.head.join(' ')})">${face(0,0)}${moving ? `<animateTransform attributeName="transform" type="translate" from="${previous.head.join(' ')}" to="${current.head.join(' ')}" dur="0.65s" fill="freeze"/>` : ''}</g>`;
    return current.legs.map((line,i) => path(line,previous.legs[i],'#405c78',18)).join('') + `<path d="${current.body}" fill="#9fe3ca">${animate(previous.body,current.body)}</path>` + current.arms.map((line,i) => path(line,previous.arms[i],'#f2c49b',12)).join('') + head + (pose === 'salam' ? '<path class="kids-salam-wave" d="M234 128q16 4 17 19m-13-28q25 5 25 27" fill="none" stroke="#67bba0" stroke-width="4" stroke-linecap="round"/>' : '');
  }

  function illustration(kind) {
    const prayerPoses = ['stand', 'takbir', 'read', 'bow', 'prostrate', 'sit', 'salam'];
    if (prayerPoses.includes(kind)) return `<rect x="74" y="224" width="212" height="32" rx="13" fill="#b89cec"/><path d="M85 241h190" stroke="#e0d0ff" stroke-width="3" stroke-dasharray="5 7"/><g class="kids-person">${person(kind)}</g>`;
    const waterParts = ['hands', 'mouth', 'nose', 'face', 'arms', 'head', 'ears', 'feet'];
    if (waterParts.includes(kind)) {
      const body = `<path d="M125 210 Q180 162 235 210 L243 249 H117Z" fill="#9fe3ca"/>${face(180, 143)}<path d="M126 235 L147 197 M234 235 L213 197" stroke="#f2c49b" stroke-width="15" stroke-linecap="round"/>`;
      const positions = { hands:[147,197], mouth:[180,154], nose:[180,140], face:[180,143], arms:[226,220], head:[180,121], ears:[203,143], feet:[180,230] };
      const [x,y] = positions[kind];
      let detail = body;
      if (kind === 'hands') detail = '<path d="M102 204 L143 174 Q154 170 165 179 L205 185 Q221 188 210 204 L176 216 L145 213 L114 233Z" fill="#f2c49b" stroke="#d89d72" stroke-width="3"/><path d="M143 181l30 17m-18-23l30 17m-15-22l30 17" stroke="#d89d72" stroke-width="3" stroke-linecap="round"/>';
      if (kind === 'feet') detail = '<path d="M137 143 L171 143 L171 204 Q211 204 219 221 Q224 236 204 237 H137Z" fill="#f2c49b" stroke="#d89d72" stroke-width="3"/><path d="M207 219v15m-9-19v20m-10-22v22" stroke="#d89d72" stroke-width="3"/>';
      return `<path d="M72 77h75v22h-31v26H91v-26H72Z" fill="#728cad"/><rect x="84" y="55" width="41" height="12" rx="6" fill="#728cad"/><path class="kids-water" d="M104 136v38m-11-31v19m22-17v25" fill="none" stroke="#64bdf0" stroke-width="5" stroke-linecap="round"/>${detail}<circle class="kids-focus-ring" cx="${x}" cy="${y}" r="31" fill="none" stroke="#598be0" stroke-width="3" stroke-dasharray="5 5"/><path d="M85 251 Q180 272 275 251" fill="none" stroke="#afd9f2" stroke-width="9" stroke-linecap="round"/>`;
    }
    if (kind === 'mosque') return '<path d="M94 241V148h172v93" fill="#9fe3ca"/><path d="M112 148Q180 45 248 148Z" fill="#778fdd"/><path d="M158 241v-50q22-37 44 0v50" fill="#fbf4e8"/><rect x="74" y="118" width="19" height="124" rx="5" fill="#9fe3ca"/><path d="M70 118l14-28 14 28Z" fill="#778fdd"/><path d="M180 80V55" stroke="#e7be65" stroke-width="4"/><circle cx="184" cy="45" r="11" fill="#e7be65"/><circle cx="190" cy="40" r="10" fill="#fbf4e8"/>';
    if (kind === 'kaaba') return '<path d="M97 117L179 92L261 117V227L179 249L97 225Z" fill="#38455d"/><path d="M179 92V249L261 227V117Z" fill="#25354b"/><path d="M97 143L179 163L261 141V160L179 182L97 162Z" fill="#edc975"/><rect x="116" y="184" width="25" height="39" rx="2" fill="#edc975"/>';
    if (kind === 'moon') return '<circle cx="177" cy="153" r="68" fill="#f2ca70"/><circle cx="207" cy="128" r="61" fill="#fbf4e8"/><path class="kids-float" d="M254 173l7 17 19 1-15 12 5 19-16-11-16 11 5-19-15-12 19-1Z" fill="#94d9bf"/>';
    if (kind === 'testimony') return '<path d="M97 116q40-23 83 0v125q-43-23-83 0ZM180 116q43-23 83 0v125q-43-23-83 0Z" fill="#a7c8ee" stroke="#6c8ab3" stroke-width="4"/><path d="M113 138h48m-48 20h48m-48 20h40m34-40h48m-48 20h48m-48 20h40" stroke="#fbf4e8" stroke-width="6" stroke-linecap="round"/>';
    if (kind === 'charity') return '<path d="M81 214L138 188L192 197q22 9 6 20l-33 1 46 7 53-27q22-7 24 8l-65 39H151L81 238Z" fill="#f2c49b"/><circle class="kids-coin" cx="186" cy="141" r="30" fill="#f2ca70" stroke="#dfaf49" stroke-width="4"/><path d="M186 124v34m-8-17h16" stroke="#fff4cf" stroke-width="4" stroke-linecap="round"/>';
    if (kind === 'leaf') return '<path d="M175 226Q88 148 157 104Q242 121 193 210" fill="#9fe3ca"/><path d="M175 246V146m0 46-27-22m27-1 21-14" fill="none" stroke="#539c82" stroke-width="5" stroke-linecap="round"/><path d="M143 248h74" stroke="#d9c6a8" stroke-width="8" stroke-linecap="round"/>';
    if (kind === 'smile') return '<circle cx="180" cy="167" r="67" fill="#f2ca70"/><circle cx="158" cy="152" r="6" fill="#725940"/><circle cx="202" cy="152" r="6" fill="#725940"/><path d="M151 185q29 34 58 0" fill="none" stroke="#725940" stroke-width="7" stroke-linecap="round"/>';
    return '<path class="kids-heart" d="M180 225L112 163Q91 108 139 109Q163 108 180 132Q197 108 221 109Q269 108 248 163Z" fill="#e99aab"/>';
  }

  function scene(kind, title) {
    return `<svg viewBox="0 0 360 280" role="img" aria-label="${title}"><circle cx="180" cy="152" r="110" fill="#f3ecd9"/><path class="kids-cloud" d="M21 73q0-15 15-15 2-18 21-16 16 0 19 16 17 0 17 15Z" fill="#fff"/><path class="kids-cloud second" d="M262 67q0-12 12-12 2-16 17-14 14 0 16 14 14 0 14 12Z" fill="#fff"/><g class="kids-art">${illustration(kind)}</g><path class="kids-sparkle" d="M285 119v16m-8-8h16M66 197v12m-6-6h12" stroke="#d9af61" stroke-width="3" stroke-linecap="round"/></svg>`;
  }

  function pauseAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
    $('kidsAutoBtn').textContent = '▶ عرض متتابع';
    $('kidsAutoBtn').setAttribute('aria-pressed', 'false');
  }

  function renderStep() {
    const lesson = lessons[lessonKey];
    const [title, text, kind, words] = lesson.steps[stepIndex];
    $('kidsLessonTitle').textContent = lesson.title;
    $('kidsStepCount').textContent = `${(stepIndex+1).toLocaleString('ar-EG')} من ${lesson.steps.length.toLocaleString('ar-EG')}`;
    $('kidsScene').innerHTML = scene(kind, title);
    previousPose = kind;
    $('kidsStepTitle').textContent = title;
    $('kidsStepText').textContent = text;
    $('kidsStepWords').textContent = words;
    $('kidsLessonNote').textContent = lesson.note;
    $('kidsSource').href = lesson.source;
    $('kidsPrevBtn').disabled = stepIndex === 0;
    $('kidsNextBtn').textContent = finished ? 'أعد الدرس ↺' : stepIndex === lesson.steps.length-1 ? 'أنهيت الدرس ⭐' : 'التالي ←';
    $('kidsStepDots').replaceChildren(...lesson.steps.map((_, index) => {
      const dot = document.createElement('span');
      dot.className = index <= stepIndex ? 'seen' : '';
      return dot;
    }));
  }

  function resetCelebration() {
    finished = false;
    $('kidsCelebration').hidden = true;
  }
  document.querySelectorAll('[data-lesson]').forEach(button => button.addEventListener('click', () => {
    pauseAuto();
    lessonKey = button.dataset.lesson;
    stepIndex = 0;
    resetCelebration();
    document.querySelectorAll('[data-lesson]').forEach(topic => {
      const selected = topic === button;
      topic.classList.toggle('selected', selected);
      topic.setAttribute('aria-pressed', String(selected));
    });
    renderStep();
  }));
  $('kidsPrevBtn').addEventListener('click', () => {
    pauseAuto();
    if (stepIndex > 0) stepIndex--;
    resetCelebration();
    renderStep();
  });
  $('kidsNextBtn').addEventListener('click', () => {
    pauseAuto();
    if (finished) {
      stepIndex = 0;
      resetCelebration();
    } else if (stepIndex < lessons[lessonKey].steps.length-1) {
      stepIndex++;
    } else {
      const firstTime = !completed.includes(lessonKey);
      if (firstTime) completed.push(lessonKey);
      const saved = rewards();
      $('kidsCelebration').textContent = `${firstTime ? 'أحسنت! نجمة جديدة لرحلتك ⭐' : 'أحسنت بالمراجعة! نجمتك محفوظة ⭐'}${saved ? '' : ' تقدّمك محفوظ لهذه الزيارة فقط.'}`;
      $('kidsCelebration').hidden = false;
      finished = true;
    }
    renderStep();
  });
  $('kidsAutoBtn').addEventListener('click', () => {
    if (autoTimer) return pauseAuto();
    if (stepIndex === lessons[lessonKey].steps.length-1) stepIndex = 0;
    resetCelebration();
    renderStep();
    $('kidsAutoBtn').textContent = 'Ⅱ إيقاف العرض';
    $('kidsAutoBtn').setAttribute('aria-pressed', 'true');
    autoTimer = setInterval(() => {
      if (stepIndex < lessons[lessonKey].steps.length-1) stepIndex++;
      renderStep();
      if (stepIndex === lessons[lessonKey].steps.length-1) pauseAuto();
    }, 8000);
  });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function updateMotion() {
    $('kidsView').classList.toggle('still', !$('kidsMotionToggle').checked || reduceMotion.matches);
    // Rebuild to remove SVG motion too; CSS alone cannot pause SMIL animations.
    renderStep();
  }
  $('kidsMotionToggle').checked = SalatUtils.readSetting('salat.kids.motion', 'on') === 'on' && !reduceMotion.matches;
  $('kidsMotionToggle').addEventListener('change', () => {
    SalatUtils.saveSetting('salat.kids.motion', $('kidsMotionToggle').checked ? 'on' : 'off');
    updateMotion();
  });
  reduceMotion.addEventListener('change', updateMotion);
  document.addEventListener('salat:viewchange', event => {
    if (event.detail !== 'kidsView') pauseAuto();
  });
  document.addEventListener('salat:alarm', pauseAuto);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseAuto();
  });

  function renderQuestion() {
    const [question, options, correct, explanation] = questions[questionIndex];
    $('kidsQuizCount').textContent = `${(questionIndex+1).toLocaleString('ar-EG')} من ${questions.length.toLocaleString('ar-EG')}`;
    $('kidsQuizQuestion').textContent = question;
    $('kidsQuizFeedback').textContent = '';
    $('kidsQuizFeedback').className = 'kids-feedback';
    $('kidsNextQuestionBtn').disabled = true;
    $('kidsQuizAnswers').replaceChildren(...options.map((option, index) => {
      const button = document.createElement('button');
      button.className = 'kids-answer';
      button.textContent = option;
      button.addEventListener('click', () => {
        if (index !== correct) {
          button.classList.add('try-again');
          button.disabled = true;
          $('kidsQuizFeedback').textContent = 'محاولة جميلة! فكّر قليلًا وجرّب مرة أخرى 💚';
          return;
        }
        button.classList.add('correct');
        const isNew = !solved.includes(questionIndex);
        if (isNew) solved.push(questionIndex);
        rewards();
        $('kidsQuizAnswers').querySelectorAll('button').forEach(answer => answer.disabled = true);
        $('kidsQuizFeedback').classList.add('success');
        $('kidsQuizFeedback').textContent = `أحسنت! ${explanation}${isNew ? ' نجمة جديدة ⭐' : ''}`;
        $('kidsNextQuestionBtn').disabled = false;
      });
      return button;
    }));
  }
  $('kidsNextQuestionBtn').addEventListener('click', () => {
    questionIndex = (questionIndex+1) % questions.length;
    renderQuestion();
  });
  renderStep();
  renderQuestion();
  updateMotion();
  rewards();
})();
