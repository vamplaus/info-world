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
  const stage = $('mapStage');
  const tooltip = $('zoneTooltip');
  const worldHint = $('worldHint');
  const dialog = $('zoneDialog');
  const dialogClose = $('dialogClose');
  const dialogAction = $('dialogAction');
  const zoneIcon = $('zoneIcon');
  const zoneKicker = $('zoneKicker');
  const zoneTitle = $('zoneTitle');
  const zoneText = $('zoneText');
  const particles = $('particles');

  const zones = {
    school:    {icon:'✦', kicker:'ГЛАВНОЕ ЗДАНИЕ', title:'Математическая школа №1', text:'Центральное пространство школы имени Х. И. Ибрагимова в городе Грозном. Отсюда начинается знакомство с образовательными направлениями, кружками, творческими студиями и спортивными секциями.'},
    club:      {icon:'∑', kicker:'МАТЕМАТИКА', title:'Клуб математиков', text:'Пространство для математических кружков, олимпиадной подготовки, поиска нестандартных решений и развития исследовательского мышления.'},
    magic:     {icon:'✧', kicker:'ТВОРЧЕСКОЕ НАПРАВЛЕНИЕ', title:'Волшебство', text:'Образное пространство для творческих и исследовательских занятий, где идея превращается в проект и собственное открытие.'},
    medicine:  {icon:'+', kicker:'КРУЖОК', title:'Медицинский кружок', text:'Знакомство с естественно-научными дисциплинами, исследовательской культурой и проектной деятельностью.'},
    chess:     {icon:'♞', kicker:'ИНТЕЛЛЕКТУАЛЬНЫЙ СПОРТ', title:'Шахматы в школе', text:'Тренировка логики, стратегического мышления, концентрации и умения видеть несколько шагов вперёд.'},
    ai:        {icon:'◉', kicker:'ТЕХНОЛОГИИ', title:'AI Course', text:'Пространство для знакомства с искусственным интеллектом, современными цифровыми технологиями, данными и интеллектуальными системами.'},
    python:    {icon:'⌘', kicker:'ПРОГРАММИРОВАНИЕ', title:'Python District', text:'Программирование, алгоритмическое мышление и практическая разработка. Здесь код превращается в работающие решения.'},
    exam:      {icon:'★', kicker:'ДОСТИЖЕНИЯ', title:'Exam Arena', text:'Подготовка к экзаменам, интеллектуальным соревнованиям и систематическая работа над знаниями.'},
    animation: {icon:'◌', kicker:'ТВОРЧЕСКАЯ СТУДИЯ', title:'Студия «Мульт-анимация»', text:'Создание визуальных историй, анимации и цифровых творческих проектов от идеи до готовой работы.'},
    vocal:     {icon:'♫', kicker:'ИСКУССТВО', title:'Вокал', text:'Развитие музыкальных способностей, голоса, слуха и сценического мастерства.'},
    robotics:  {icon:'⚙', kicker:'ИНЖЕНЕРИЯ', title:'Robotics Hub', text:'Робототехника, конструирование, программирование устройств и инженерное мышление через практические проекты.'},
    english:   {icon:'A', kicker:'ЯЗЫКИ', title:'English A–Z', text:'Изучение английского языка и развитие навыков общения, понимания и уверенного использования языка.'},
    judo:      {icon:'◈', kicker:'СПОРТ', title:'Дзюдо', text:'Спортивная подготовка, дисциплина, техника и развитие физических качеств.'},
    dance:     {icon:'✦', kicker:'КУЛЬТУРА', title:'Танцы народов Кавказа', text:'Знакомство с культурным наследием, традицией и выразительностью народного танца.'},
    basketball:{icon:'◉', kicker:'СПОРТ', title:'Баскетбол', text:'Командная работа, техника игры, физическая подготовка и развитие спортивных навыков.'},
    volleyball:{icon:'◌', kicker:'СПОРТ', title:'Волейбол', text:'Командная спортивная секция, тренировки, координация и игровая тактика.'}
  };

  const loadSteps = [
    ['Подготовка пространства', 12],
    ['Загрузка карты школы', 32],
    ['Активация учебных направлений', 57],
    ['Включение освещения', 78],
    ['Система готова', 100]
  ];

  let started = false;
  function setProgress(value, text){
    loaderBar.style.width = value + '%';
    loaderPercent.textContent = value + '%';
    if(text) loaderStatus.textContent = text;
  }

  function runLoader(){
    let i = 0;
    const next = () => {
      const [text, value] = loadSteps[i];
      setProgress(value, text);
      i += 1;
      if(i < loadSteps.length) setTimeout(next, i === loadSteps.length - 1 ? 650 : 520);
      else setTimeout(showWelcome, 900);
    };
    setTimeout(next, 220);
  }

  function showWelcome(){
    loader.classList.add('is-leaving');
    setTimeout(() => { welcome.hidden = false; }, 500);
  }

  function enterWorld(){
    if(started) return;
    started = true;
    enterButton.disabled = true;
    welcome.classList.add('is-leaving');
    setTimeout(() => {
      welcome.hidden = true;
      world.hidden = false;
      requestAnimationFrame(() => {
        world.classList.add('is-visible', 'entering');
        setTimeout(() => {
          world.classList.remove('entering');
          world.classList.add('ready');
          worldHint.textContent = 'Карта активна — наведите курсор на любое здание';
        }, 2100);
      });
    }, 430);
  }

  function openZone(key){
    const z = zones[key];
    if(!z) return;
    zoneIcon.textContent = z.icon;
    zoneKicker.textContent = z.kicker;
    zoneTitle.textContent = z.title;
    zoneText.textContent = z.text;
    worldHint.textContent = z.title;
    tooltip.style.display = 'none';
    if(!dialog.open) dialog.showModal();
  }

  document.querySelectorAll('.hotspot').forEach((button) => {
    button.addEventListener('click', () => openZone(button.dataset.zone));
    button.addEventListener('pointerenter', () => {
      const z = zones[button.dataset.zone];
      if(!z) return;
      tooltip.querySelector('span').textContent = z.title;
      tooltip.style.display = 'block';
      worldHint.textContent = z.title;
    });
    button.addEventListener('pointermove', (event) => {
      const rect = stage.getBoundingClientRect();
      tooltip.style.left = Math.max(8, Math.min(rect.width - 180, event.clientX - rect.left)) + 'px';
      tooltip.style.top = Math.max(8, Math.min(rect.height - 40, event.clientY - rect.top)) + 'px';
    });
    button.addEventListener('pointerleave', () => {
      tooltip.style.display = 'none';
      if(!dialog.open) worldHint.textContent = 'Наведите курсор на здание и нажмите, чтобы узнать больше';
    });
  });

  enterButton.addEventListener('click', enterWorld);
  dialogClose.addEventListener('click', () => dialog.close());
  dialogAction.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { if(started) worldHint.textContent = 'Карта активна — выберите следующее направление'; });

  // Ambient particles are generated once. They do not control the map and add no interaction burden.
  for(let i = 0; i < 46; i++){
    const p = document.createElement('i');
    p.className = 'particle';
    p.style.left = (4 + Math.random() * 92) + '%';
    p.style.top = (22 + Math.random() * 73) + '%';
    p.style.setProperty('--dur', (6 + Math.random() * 8) + 's');
    p.style.setProperty('--delay', (-Math.random() * 12) + 's');
    p.style.setProperty('--dx', ((Math.random() - .5) * 60) + 'px');
    p.style.setProperty('--particle', Math.random() > .72 ? '#ffd67b' : Math.random() > .5 ? '#76cfff' : '#d7a34e');
    particles.appendChild(p);
  }

  // Explicitly block the old control model: no wheel zoom, no drag, no WASD/arrows.
  window.addEventListener('wheel', (event) => { if(world.classList.contains('ready')) event.preventDefault(); }, {passive:false});
  window.addEventListener('keydown', (event) => {
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','W','a','A','s','S','d','D'].includes(event.key)) {
      event.preventDefault();
    }
  }, {passive:false});
  stage.addEventListener('dragstart', (event) => event.preventDefault());
  stage.addEventListener('contextmenu', (event) => event.preventDefault());

  // Start only after the artwork itself is available. The map remains visually hidden until the entrance scene.
  if(map.complete && map.naturalWidth) runLoader();
  else {
    map.addEventListener('load', runLoader, {once:true});
    map.addEventListener('error', () => { loaderStatus.textContent = 'Не удалось загрузить карту'; setProgress(100); }, {once:true});
  }
})();
