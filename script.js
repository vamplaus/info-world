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
  const autoEnter = $('autoEnter');
  const map = $('schoolMap');
  const particles = $('particles');
  const activityLayer = $('activityLayer');
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
  let entered = false;
  let autoTimer = 0;

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

  function showWelcome() {
    welcome.hidden = false;
    welcome.classList.remove('is-leaving');
    let remaining = 3.5;
    const update = () => {
      if (!autoEnter) return;
      autoEnter.innerHTML = `Вход откроется автоматически <b>${Math.max(0, Math.ceil(remaining))}</b>`;
      remaining -= .25;
      if (!entered && remaining >= 0) setTimeout(update, 250);
    };
    update();
    autoTimer = setTimeout(() => enterWorld(), 3500);
  }

  async function boot() {
    if (booted) return;
    booted = true;
    const stages = [
      [8, 'ПОДГОТОВКА ПРОСТРАНСТВА'],
      [24, 'ЗАГРУЗКА КАРТЫ'],
      [43, 'ПРОВЕРКА ИНТЕРАКТИВНЫХ ТОЧЕК'],
      [64, 'ВКЛЮЧЕНИЕ ОСВЕЩЕНИЯ'],
      [82, 'ЗАПУСК ЖИВОЙ СЦЕНЫ'],
      [94, 'АКТИВАЦИЯ ПРОСТРАНСТВА']
    ];

    try {
      const imageReady = preloadMap();
      for (const [value, status] of stages) {
        setProgress(value, status);
        await wait(340);
      }
      await imageReady;
      setProgress(100, 'КАРТА ГОТОВА');
      await wait(650);
      loader.classList.add('is-leaving');
      await wait(720);
      loader.hidden = true;
      showWelcome();
    } catch (error) {
      console.error(error);
      loaderStatus.textContent = 'НЕ УДАЛОСЬ ЗАГРУЗИТЬ КАРТУ';
      loaderPercent.textContent = '—';
    }
  }

  function enterWorld() {
    if (entered) return;
    entered = true;
    clearTimeout(autoTimer);
    welcome.classList.add('is-leaving');
    setTimeout(() => {
      welcome.hidden = true;
      world.hidden = false;
      world.classList.add('is-visible', 'entering');
      createParticles();
      createActivity();
      setTimeout(() => {
        world.classList.remove('entering');
        world.classList.add('ready');
      }, 2200);
    }, 520);
  }

  function createParticles() {
    if (particles.dataset.ready) return;
    particles.dataset.ready = '1';
    const palette = ['#ffd77e', '#9edcff', '#a783ff', '#72d9a3'];
    for (let i = 0; i < 68; i++) {
      const p = document.createElement('i');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = 48 + Math.random() * 56 + '%';
      p.style.setProperty('--dx', ((Math.random() - .5) * 110) + 'px');
      p.style.setProperty('--dur', (7 + Math.random() * 10) + 's');
      p.style.setProperty('--delay', (-Math.random() * 14) + 's');
      p.style.setProperty('--particle', palette[Math.floor(Math.random() * palette.length)]);
      particles.appendChild(p);
    }
  }

  function addActivity(className, x, y, rgb, options = {}) {
    const el = document.createElement('i');
    el.className = className;
    el.style.setProperty('--x', x + '%');
    el.style.setProperty('--y', y + '%');
    el.style.setProperty('--rgb', rgb);
    for (const [key, value] of Object.entries(options)) {
      el.style.setProperty('--' + key, value);
    }
    activityLayer.appendChild(el);
    return el;
  }

  function createActivity() {
    if (activityLayer.dataset.ready) return;
    activityLayer.dataset.ready = '1';

    const buildings = [
      [49,39,'243,195,94',14,5.8], [24,18,'80,174,255',12,5.2],
      [39,19,'110,231,193',10,4.8], [54,17,'242,115,88',11,5.4],
      [66,18,'228,173,72',11,5.1], [84,18,'155,120,255',16,6.3],
      [15,39,'76,200,255',13,5.0], [15,60,'233,91,154',13,5.7],
      [35,62,'204,124,255',11,4.9], [49,67,'213,108,204',10,4.6],
      [84,52,'69,168,255',14,5.4], [67,65,'90,174,255',13,5.0],
      [12,80,'79,199,255',11,4.8], [31,81,'221,109,255',12,5.1],
      [56,80,'240,163,67',12,5.4], [77,80,'96,182,255',13,5.2]
    ];

    buildings.forEach(([x,y,rgb,size,dur], i) => {
      addActivity('building-aura', x, y, rgb, {
        s: size + '%', dur: dur + 's', delay: (-i * .47) + 's', spin: (7 + i % 5) + 's'
      });
      addActivity('roof-beacon', x, y - size * .30, rgb, {
        dur: (2.1 + (i % 4) * .45) + 's', delay: (-i * .31) + 's', ring: (2.5 + (i % 3) * .6) + 's'
      });
    });

    // Facade lights. The coordinates are localised over the visible buildings rather than using large interactive areas.
    const clusters = [
      [49,39,8.0,7.5,'255,190,74'], [24,18,7.5,8,'81,184,255'], [39,19,6,7,'100,236,199'],
      [54,17,7,8,'255,130,92'], [66,18,6.5,7,'248,197,100'], [84,18,10,10,'166,133,255'],
      [15,39,7,10,'84,202,255'], [15,60,8,9,'245,101,167'], [35,62,6,7,'215,139,255'],
      [49,67,5,7,'232,121,214'], [84,52,8,9,'77,180,255'], [67,65,7,8,'111,190,255'],
      [12,80,5,7,'99,210,255'], [31,81,7,6,'231,130,255'], [56,80,6,7,'255,183,82'], [77,80,7,7,'110,194,255']
    ];

    clusters.forEach(([cx,cy,rx,ry,rgb], clusterIndex) => {
      const count = clusterIndex === 0 ? 30 : 16;
      for (let n = 0; n < count; n++) {
        const col = n % Math.ceil(Math.sqrt(count));
        const row = Math.floor(n / Math.ceil(Math.sqrt(count)));
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        const jitterX = Math.sin((n + 1) * 12.9898) * .55;
        const jitterY = Math.cos((n + 1) * 78.233) * .42;
        const x = cx - rx/2 + (col + .5) * rx / cols + jitterX;
        const y = cy - ry/2 + (row + .55) * ry / rows + jitterY;
        addActivity('window-light', x, y, rgb, {
          w: (2.2 + (n % 3) * .7) + 'px',
          h: (2 + ((n + 1) % 2) * .8) + 'px',
          dur: (2.2 + ((n * 7) % 9) * .37) + 's',
          delay: (-(n * .19 + clusterIndex * .31)) + 's',
          base: (0.22 + ((n * 13) % 7) * .08).toFixed(2)
        });
      }
    });

    const roads = [
      [49,49],[46,53],[43,56],[39,60],[34,65],[29,69],[24,74],[19,78],
      [52,49],[55,53],[59,57],[64,62],[70,67],[75,72],[80,76],
      [45,48],[39,46],[34,42],[30,37],[26,32],[22,27],[18,23],
      [54,47],[60,42],[66,36],[71,31],[77,26],[82,22],
      [50,54],[50,59],[50,64],[50,70],[50,76]
    ];
    roads.forEach(([x,y], i) => addActivity('road-light', x, y, '255,211,122', {
      dur: (2.1 + (i % 6) * .43) + 's', delay: (-i * .22) + 's'
    }));
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
    button.addEventListener('click', () => {
      if (!world.classList.contains('ready')) return;
      openZone(button.dataset.zone, button);
    });
    button.addEventListener('pointerenter', () => {
      if (!zone || !world.classList.contains('ready')) return;
      tooltip.textContent = zone.title;
      tooltip.style.left = `calc(${button.style.getPropertyValue('--x')} + 12px)`;
      tooltip.style.top = `calc(${button.style.getPropertyValue('--y')} + 12px)`;
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

  // No WASD, arrows, wheel zoom, pinch zoom, camera dragging or map movement.
  boot();
})();
