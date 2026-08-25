(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const loader = $('loader');
  const loaderBar = $('loaderBar');
  const loaderPercent = $('loaderPercent');
  const loaderStatus = $('loaderStatus');
  const welcome = $('welcome');
  const world = $('world');
  const enterButton = $('enterButton');
  const map = $('schoolMap');
  const particles = $('particles');
  const dialog = $('zoneDialog');
  const dialogClose = $('dialogClose');
  const dialogAction = $('dialogAction');
  const zoneIcon = $('zoneIcon');
  const zoneKicker = $('zoneKicker');
  const zoneTitle = $('zoneTitle');
  const zoneText = $('zoneText');
  const tooltip = $('zoneTooltip');

  const zones = {
    school: { icon:'✦', kicker:'ГЛАВНОЕ ЗДАНИЕ', title:'Математическая школа №1', text:'Центральное пространство школы имени Х. И. Ибрагимова. Здесь объединяются учеба, кружки, технологии, творчество и спорт.' },
    club: { icon:'∑', kicker:'КРУЖОК', title:'Клуб математиков', text:'Пространство для математических кружков, олимпиадной подготовки и решения нестандартных задач.' },
    magic: { icon:'✦', kicker:'НАПРАВЛЕНИЕ', title:'Волшебство', text:'Творческое пространство для исследовательских, образовательных и авторских проектов.' },
    medicine: { icon:'✚', kicker:'КРУЖОК', title:'Медицинский кружок', text:'Знакомство с естественными науками, исследовательской работой и проектной деятельностью.' },
    chess: { icon:'♞', kicker:'ИНТЕЛЛЕКТУАЛЬНЫЙ СПОРТ', title:'Шахматы в школе', text:'Тренировка логики, стратегии, концентрации и аналитического мышления.' },
    ai: { icon:'AI', kicker:'ТЕХНОЛОГИИ', title:'AI Course', text:'Направление, посвященное искусственному интеллекту, данным и современным цифровым технологиям.' },
    python: { icon:'⌘', kicker:'ПРОГРАММИРОВАНИЕ', title:'Python District', text:'Программирование, алгоритмическое мышление и практическая разработка цифровых проектов.' },
    exam: { icon:'★', kicker:'ДОСТИЖЕНИЯ', title:'Exam Arena', text:'Подготовка к экзаменам, интеллектуальным соревнованиям и системной проверке знаний.' },
    animation: { icon:'◉', kicker:'ТВОРЧЕСТВО', title:'Студия «Мульт-анимация»', text:'Создание анимации, визуальных историй и цифровых творческих проектов.' },
    vocal: { icon:'♫', kicker:'ИСКУССТВО', title:'Вокал', text:'Развитие музыкальных способностей, слуха, голоса и сценического мастерства.' },
    robotics: { icon:'⚙', kicker:'ТЕХНОЛОГИИ', title:'Robotics Hub', text:'Инженерное пространство для робототехники, конструирования и практической работы с технологиями.' },
    english: { icon:'A', kicker:'ЯЗЫКИ', title:'English A-Z', text:'Изучение английского языка и развитие коммуникативных навыков.' },
    judo: { icon:'◈', kicker:'СПОРТ', title:'Дзюдо', text:'Спортивная подготовка, дисциплина, координация и развитие физических качеств.' },
    dance: { icon:'♢', kicker:'КУЛЬТУРА', title:'Танцы народов Кавказа', text:'Знакомство с культурным наследием и традициями народного танца.' },
    basketball: { icon:'◌', kicker:'СПОРТ', title:'Баскетбол', text:'Тренировки, командная работа и развитие игровых навыков.' },
    volleyball: { icon:'◍', kicker:'СПОРТ', title:'Волейбол', text:'Командная спортивная секция и регулярные тренировки.' }
  };

  let booted = false;

  function setProgress(value, status) {
    const n = Math.max(0, Math.min(100, Math.round(value)));
    loaderBar.style.width = n + '%';
    loaderPercent.textContent = n + '%';
    if (status) loaderStatus.textContent = status;
  }

  function preloadMap() {
    return new Promise((resolve, reject) => {
      if (map.complete) {
        map.naturalWidth ? resolve() : reject(new Error('Map image failed to load'));
        return;
      }
      map.addEventListener('load', resolve, { once:true });
      map.addEventListener('error', () => reject(new Error('Map image failed to load')), { once:true });
    });
  }

  async function boot() {
    if (booted) return;
    booted = true;
    const stages = [
      [10, 'ПОДГОТОВКА ПРОСТРАНСТВА'],
      [28, 'ЗАГРУЗКА КАРТЫ'],
      [52, 'ПРОВЕРКА ИНТЕРАКТИВНЫХ ЗОН'],
      [76, 'ВКЛЮЧЕНИЕ ОСВЕЩЕНИЯ'],
      [92, 'АКТИВАЦИЯ ПРОСТРАНСТВА']
    ];
    try {
      const imageReady = preloadMap();
      for (const [value, status] of stages) {
        setProgress(value, status);
        await new Promise(r => setTimeout(r, 300));
      }
      await imageReady;
      setProgress(100, 'КАРТА ГОТОВА');
      await new Promise(r => setTimeout(r, 550));
      loader.classList.add('is-leaving');
      await new Promise(r => setTimeout(r, 650));
      loader.hidden = true;
      welcome.hidden = false;
    } catch (error) {
      console.error(error);
      loaderStatus.textContent = 'НЕ УДАЛОСЬ ЗАГРУЗИТЬ КАРТУ';
      loaderPercent.textContent = '—';
    }
  }

  function enterWorld() {
    welcome.classList.add('is-leaving');
    setTimeout(() => {
      welcome.hidden = true;
      world.hidden = false;
      world.classList.add('is-visible', 'entering');
      requestAnimationFrame(() => createParticles());
      setTimeout(() => {
        world.classList.remove('entering');
        world.classList.add('ready');
      }, 2150);
    }, 520);
  }

  function createParticles() {
    if (particles.dataset.ready) return;
    particles.dataset.ready = '1';
    const palette = ['#ffd77e', '#9edcff', '#a783ff', '#72d9a3'];
    for (let i = 0; i < 52; i++) {
      const p = document.createElement('i');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = 55 + Math.random() * 50 + '%';
      p.style.setProperty('--dx', ((Math.random() - .5) * 90) + 'px');
      p.style.setProperty('--dur', (7 + Math.random() * 9) + 's');
      p.style.setProperty('--delay', (-Math.random() * 12) + 's');
      p.style.setProperty('--particle', palette[Math.floor(Math.random() * palette.length)]);
      particles.appendChild(p);
    }
  }

  function openZone(id, button) {
    const zone = zones[id];
    if (!zone) return;
    document.querySelectorAll('.hotspot.active').forEach(el => el.classList.remove('active'));
    if (button) button.classList.add('active');
    zoneIcon.textContent = zone.icon;
    zoneKicker.textContent = zone.kicker;
    zoneTitle.textContent = zone.title;
    zoneText.textContent = zone.text;
    tooltip.style.display = 'none';
    if (!dialog.open) dialog.showModal();
  }

  document.querySelectorAll('.hotspot').forEach(button => {
    const zone = zones[button.dataset.zone];
    button.addEventListener('click', () => openZone(button.dataset.zone, button));
    button.addEventListener('pointerenter', () => {
      if (!zone || !world.classList.contains('ready')) return;
      tooltip.textContent = zone.title;
      tooltip.style.left = `calc(${button.style.getPropertyValue('--x')} + 10px)`;
      tooltip.style.top = `calc(${button.style.getPropertyValue('--y')} + 10px)`;
      tooltip.style.display = 'block';
    });
    button.addEventListener('pointerleave', () => { tooltip.style.display = 'none'; });
  });

  enterButton.addEventListener('click', enterWorld);
  dialogClose.addEventListener('click', () => dialog.close());
  dialogAction.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.querySelectorAll('.hotspot.active').forEach(el => el.classList.remove('active')));
  dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    const inside = rect.top <= event.clientY && event.clientY <= rect.bottom && rect.left <= event.clientX && event.clientX <= rect.right;
    if (!inside) dialog.close();
  });

  // Intentionally no keydown movement, no wheel zoom, no pinch zoom and no drag camera.
  // Browser-level shortcuts are left untouched; only explicit map zones are interactive.
  boot();
})();
