(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const STORAGE_KEY = 'infoworld-progress-v3';
  const ZONE_ORDER = ['python', 'ai', 'algo', 'web', 'exam', 'game'];

  const zones = {
    python: { icon:'</>', kicker:'PYTHON', title:'Python District', color:'#7fe8ba', meta:['с нуля','практика','проекты'], desc:'От первых переменных до автоматизации, алгоритмов и небольших игр. Здесь код становится инструментом.', list:['Переменные, условия и циклы','Функции, списки и структуры данных','Мини-проекты и задачи'], mission:'Создай программу, которая принимает два числа и выводит их сумму без подсказок.', xp:50, skill:'python', skillGain:18 },
    ai: { icon:'✦', kicker:'AI LAB', title:'Искусственный интеллект', color:'#c291ff', meta:['нейросети','промптинг','генерация'], desc:'Понятный вход в AI: как работают модели, как с ними взаимодействовать и как собирать полезные прототипы.', list:['Как устроены современные AI-системы','Промптинг и работа с моделями','Практические AI-проекты'], mission:'Сформулируй один промпт, который заставит модель выдать ответ в строго заданном формате.', xp:60, skill:'ai', skillGain:16 },
    algo: { icon:'∑', kicker:'ALGO CITY', title:'Алгоритмы и мышление', color:'#69dcff', meta:['логика','задачи','структуры'], desc:'Разбирай задачи на части, находи закономерности и учись строить решение до написания кода.', list:['Декомпозиция задач','Массивы, строки и сортировки','Сложные алгоритмические задачи'], mission:'Возьми любую бытовую задачу и разложи её на три последовательных шага.', xp:55, skill:'algo', skillGain:17 },
    web: { icon:'◈', kicker:'WEB LAB', title:'Создание сайтов', color:'#ff93c7', meta:['HTML','CSS','JavaScript'], desc:'От первого HTML-документа до интерактивного интерфейса, который можно опубликовать в интернете.', list:['Структура страницы','Современный UI и адаптивность','Интерактивность на JavaScript'], mission:'Добавь к этой странице кнопку, которая изменяет состояние интерфейса.', xp:55, skill:'web', skillGain:16 },
    exam: { icon:'01', kicker:'EXAM ARENA', title:'ОГЭ / ЕГЭ', color:'#ffd67b', meta:['ОГЭ','ЕГЭ','контроль'], desc:'Подготовка превращается в серии миссий: повторение, практика, ошибки, пробники и отслеживание слабых мест.', list:['Типовые задания','Python и алгоритмы','Разбор ошибок и пробники'], mission:'Реши одну экзаменационную задачу сначала сам, а потом сравни решение с эталоном.', xp:70, skill:'algo', skillGain:13 },
    game: { icon:'⌁', kicker:'GAME GARAGE', title:'Создание игр', color:'#8a95a7', meta:['игры','механики','в разработке'], desc:'Будущий сектор для тех, кто хочет создавать игры: логика, интерфейсы, уровни и собственные механики.', list:['Игровая логика','Сценарии и механики','Свой мини-проект'], mission:'Придумай механику игры, которую можно реализовать за один вечер.', xp:40, skill:'python', skillGain:10 }
  };

  const npcs = {
    byte: { icon:'B', kicker:'MENTOR / SYSTEMS', title:'BYTE', color:'#69dcff', text:'Я помогаю превращать большие задачи в маленькие понятные действия. Не пытайся сразу выучить всё.', quote:'«Сначала действие. Потом объяснение. Потом ещё одно действие.»', reward:20 },
    ada: { icon:'A', kicker:'RESEARCH / AI', title:'ADA', color:'#c291ff', text:'AI — не магия и не кнопка «сделай за меня». Это инструмент, который требует точного запроса и проверки результата.', quote:'«Хороший запрос — это маленькое техническое задание.»', reward:20 },
    max: { icon:'M', kicker:'MAKER / CREATIVE', title:'MAX', color:'#ff93c7', text:'Самый быстрый способ понять технологию — сделать с её помощью что-нибудь своё.', quote:'«Проект, который работает на 70%, полезнее идеального проекта в голове.»', reward:20 }
  };

  const defaults = { visited: [], missions: [], npcs: [], xp: 0, skill: { python:0, ai:0, algo:0, web:0 }, sound:false, zoom:1, player:{x:46,y:57}, camera:{x:0,y:0} };
  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(defaults);
      const data = JSON.parse(raw);
      return {
        ...defaults,
        ...data,
        visited: Array.isArray(data.visited) ? data.visited.filter(k => ZONE_ORDER.includes(k)) : [],
        missions: Array.isArray(data.missions) ? data.missions.filter(k => ZONE_ORDER.includes(k)) : [],
        npcs: Array.isArray(data.npcs) ? data.npcs.filter(k => Object.keys(npcs).includes(k)) : [],
        skill: { ...defaults.skill, ...(data.skill || {}) },
        player: { ...defaults.player, ...(data.player || {}) },
        camera: { ...defaults.camera, ...(data.camera || {}) },
        zoom: Number.isFinite(data.zoom) ? data.zoom : 1
      };
    } catch { return structuredClone(defaults); }
  };

  const state = loadState();
  let audioCtx = null;
  let drag = null;
  let suppressNextClick = false;
  let nearest = null;
  let activeZone = null;
  let activeNpc = null;
  let toastTimer = null;

  const els = {
    body: document.body,
    boot: $('#boot'), bootLine: $('#bootLine'), bootProgress: $('#bootProgress'), bootPercent: $('#bootPercent'), bootEnter: $('#bootEnter'),
    clock: $('#clock'), soundBtn: $('#soundBtn'), aboutBtn: $('#aboutBtn'), enterMapBtn: $('#enterMapBtn'), randomBtn: $('#randomBtn'),
    stage: $('#stage'), world: $('#world'), camera: $('#camera'), map: $('#map'), player: $('#player'), stars: $('#stars'), stageGrid: $('#stageGrid'), zoomValue: $('#zoomValue'),
    discoveryList: $('#discoveryList'), progressText: $('#progressText'), progressBar: $('#progressBar'), levelRing: $('#levelRing'), levelNum: $('#levelNum'), xpText: $('#xpText'),
    missionTitle: $('#missionTitle'), missionText: $('#missionText'), missionBtn: $('#missionBtn'), statsZones: $('#statsZones'),
    heroLevel: $('#heroLevel'), heroXp: $('#heroXp'), coords: $('#coords'), interactHint: $('#interactHint'), interactTitle: $('#interactTitle'), interactText: $('#interactText'),
    zoneModal: $('#zoneModal'), modalIcon: $('#modalIcon'), modalKicker: $('#modalKicker'), zoneTitle: $('#zoneTitle'), modalDesc: $('#modalDesc'), modalChips: $('#modalChips'), modalList: $('#modalList'), modalMission: $('#modalMission'), zoneActionBtn: $('#zoneActionBtn'), programBtn: $('#programBtn'),
    lessonModal: $('#lessonModal'), lessonTitle: $('#lessonTitle'), lessonIntro: $('#lessonIntro'), challengeBox: $('#challengeBox'), completeMissionBtn: $('#completeMissionBtn'),
    npcModal: $('#npcModal'), npcIcon: $('#npcIcon'), npcKicker: $('#npcKicker'), npcTitle: $('#npcTitle'), npcText: $('#npcText'), npcQuote: $('#npcQuote'), npcRewardBtn: $('#npcRewardBtn'),
    aboutModal: $('#aboutModal'), backdrop: $('#backdrop'), toast: $('#toast'), toastText: $('#toastText')
  };

  const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const toast = (message) => { els.toastText.textContent = message; els.toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2300); };
  const levelFromXp = xp => Math.max(1, Math.floor(Math.max(0, xp) / 100) + 1);
  const xpIntoLevel = xp => Math.max(0, xp % 100);

  function savePlayer(){ state.player={...state.player}; state.camera={x:cameraX,y:cameraY}; persist(); }

  function createStars(){
    if (!els.stars) return;
    els.stars.replaceChildren();
    const count = Math.min(170, Math.max(75, Math.floor(innerWidth / 7)));
    const frag = document.createDocumentFragment();
    for(let i=0;i<count;i++){
      const s=document.createElement('i'); s.className='star'; s.style.left=`${Math.random()*100}%`; s.style.top=`${Math.random()*100}%`; s.style.opacity=(.12+Math.random()*.75).toFixed(2); s.style.animationDelay=`${(Math.random()*3).toFixed(2)}s`; frag.appendChild(s);
    }
    els.stars.appendChild(frag);
  }

  function updateClock(){ els.clock.textContent = new Date().toLocaleTimeString('ru-RU',{hour12:false}); }
  setInterval(updateClock, 1000); updateClock();

  let cameraX=state.camera.x || 0;
  let cameraY=state.camera.y || 0;
  let zoom=Math.min(1.35,Math.max(.82,state.zoom || 1));

  function updateCamera(){ els.camera.style.transform=`translate3d(${cameraX}px,${cameraY}px,0) scale(${zoom})`; els.zoomValue.textContent=`${Math.round(zoom*100)}%`; }
  function setCamera(x,y,save=true){ cameraX=Math.max(-220,Math.min(220,x)); cameraY=Math.max(-170,Math.min(170,y)); updateCamera(); if(save) savePlayer(); }
  function setZoom(next){ zoom=Math.max(.82,Math.min(1.35,next)); state.zoom=zoom; persist(); updateCamera(); }
  function movePlayer(dx,dy){
    const target={x:Math.max(10,Math.min(90,state.player.x+dx)),y:Math.max(12,Math.min(88,state.player.y+dy))};
    if (hitsObstacle(target.x,target.y)) { toast('Путь заблокирован объектом'); playTone(160,.035); return; }
    state.player=target; renderPlayer(); updateNearest(); savePlayer(); playTone(250,.025);
  }
  function renderPlayer(){ els.player.style.left=`${state.player.x}%`; els.player.style.top=`${state.player.y}%`; els.coords.textContent=`X ${String(Math.round(state.player.x*10)).padStart(3,'0')} / Y ${String(Math.round(state.player.y*10)).padStart(3,'0')}`; }
  function hitsObstacle(x,y){
    const obstacles=[{x:40,y:27,r:3.7},{x:65,y:56,r:3.7},{x:32,y:61,r:3.7},{x:54,y:23,r:3.7}];
    return obstacles.some(o => Math.hypot(x-o.x,y-o.y) < o.r + 2.5);
  }

  function renderProgress(){
    const opened=state.visited.length;
    const level=levelFromXp(state.xp);
    const xpNow=xpIntoLevel(state.xp);
    const percent=Math.round((opened/ZONE_ORDER.length)*100);
    const next=ZONE_ORDER.find(z=>!state.visited.includes(z));
    els.progressText.textContent=`${opened} / ${ZONE_ORDER.length} ЗОН`;
    els.progressBar.style.width=`${percent}%`;
    els.levelNum.textContent=level;
    els.levelRing.style.setProperty('--p',`${xpNow}%`);
    els.xpText.textContent=`${state.xp} XP`;
    els.heroLevel.textContent=`Уровень ${level}`;
    els.heroXp.textContent=`${xpNow} / 100 XP`;
    els.statsZones.textContent=opened;
    if(next){ els.missionTitle.textContent=`Открыть ${zones[next].kicker}`; els.missionText.textContent='Найди следующую зону на карте.'; } else { els.missionTitle.textContent='Мир открыт'; els.missionText.textContent='Все основные районы исследованы.'; }
    const skills={python:state.skill.python,ai:state.skill.ai,algo:state.skill.algo,web:state.skill.web};
    for (const [key,val] of Object.entries(skills)) { const label=$(`#skill${key.charAt(0).toUpperCase()+key.slice(1)}`); const bar=$(`#skill${key.charAt(0).toUpperCase()+key.slice(1)}Bar`); if(label) label.textContent=`${val}%`; if(bar) bar.style.width=`${Math.min(100,val)}%`; }
    els.discoveryList.replaceChildren();
    ZONE_ORDER.forEach(key=>{ const z=zones[key]; const item=document.createElement('div'); item.className=`discovery ${state.visited.includes(key)?'open':''}`; const b=document.createElement('b'); b.textContent=z.kicker; b.style.color=state.visited.includes(key)?z.color:'#5b6476'; const small=document.createElement('small'); small.textContent=state.visited.includes(key)?'OPEN':'LOCKED'; item.append(b,small); els.discoveryList.appendChild(item); });
  }

  function addXp(amount, reason){ state.xp += amount; persist(); renderProgress(); toast(`+${amount} XP — ${reason}`); playTone(560,.07); }

  function openModal(modal){ modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); els.backdrop.classList.add('open'); els.body.classList.add('locked'); }
  function closeModal(modal){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); if(!document.querySelector('.modal.open')){ els.backdrop.classList.remove('open'); els.body.classList.remove('locked'); } }
  function closeAll(){ $$('.modal.open').forEach(closeModal); }

  function openZone(key){
    const z=zones[key]; if(!z) return;
    activeZone=key;
    const firstOpen=!state.visited.includes(key);
    if(firstOpen){ state.visited.push(key); persist(); addXp(20, `${z.kicker} открыт`); if (z.skill) { state.skill[z.skill]=Math.min(100,state.skill[z.skill]+Math.round(z.skillGain/2)); persist(); } }
    els.modalIcon.textContent=z.icon; els.modalIcon.style.color=z.color; els.modalKicker.textContent=z.kicker; els.zoneTitle.textContent=z.title; els.modalDesc.textContent=z.desc; els.modalChips.replaceChildren(); z.meta.forEach(m=>{ const s=document.createElement('span'); s.textContent=m; els.modalChips.appendChild(s); }); els.modalList.replaceChildren(); z.list.forEach(x=>{const li=document.createElement('li');li.textContent=x;els.modalList.appendChild(li);}); els.modalMission.textContent=z.mission;
    els.zoneActionBtn.innerHTML = state.missions.includes(key) ? 'Миссия выполнена <span>✓</span>' : `Начать миссию <span>→</span>`;
    renderProgress(); openModal(els.zoneModal); playTone(380,.045);
  }

  function openLesson(key){
    const z=zones[key]; if(!z) return;
    els.lessonTitle.textContent=`Миссия: ${z.kicker}`;
    els.lessonIntro.textContent='Сделай маленькое действие. Здесь важна не скорость, а самостоятельность.';
    els.challengeBox.innerHTML='';
    const p=document.createElement('p'); p.textContent=z.mission; els.challengeBox.appendChild(p);
    if(key==='python'){ const pre=document.createElement('pre'); pre.textContent='a = 7\nb = 5\n# твоя задача: вывести сумму'; els.challengeBox.appendChild(pre); }
    if(key==='web'){ const pre=document.createElement('pre'); pre.textContent='<button id="magic">Нажми меня</button>\n// добавь JavaScript, который меняет текст'; els.challengeBox.appendChild(pre); }
    els.completeMissionBtn.innerHTML=state.missions.includes(key)?'Миссия уже выполнена <span>✓</span>':`Выполнено <span>+${z.xp} XP</span>`;
    openModal(els.lessonModal);
  }

  function completeMission(){
    if(!activeZone) return;
    const z=zones[activeZone];
    if(state.missions.includes(activeZone)){ toast('Эта миссия уже выполнена'); return; }
    state.missions.push(activeZone); if(z.skill) state.skill[z.skill]=Math.min(100,state.skill[z.skill]+z.skillGain); persist(); addXp(z.xp, `${z.kicker}: миссия завершена`); renderProgress(); closeModal(els.lessonModal); closeModal(els.zoneModal);
  }

  function openNpc(key){
    const n=npcs[key]; if(!n) return;
    activeNpc=key;
    els.npcIcon.textContent=n.icon; els.npcIcon.style.color=n.color; els.npcKicker.textContent=n.kicker; els.npcTitle.textContent=n.title; els.npcText.textContent=n.text; els.npcQuote.textContent=n.quote;
    els.npcRewardBtn.innerHTML=state.npcs.includes(key)?'Совет уже получен <span>✓</span>':`Забрать совет <span>+${n.reward} XP</span>`;
    openModal(els.npcModal); playTone(310,.04);
  }
  function rewardNpc(){
    if(!activeNpc) return; const n=npcs[activeNpc]; if(state.npcs.includes(activeNpc)){toast('Ты уже получил этот совет');return;} state.npcs.push(activeNpc); persist(); addXp(n.reward,`совет ${n.title}`); closeModal(els.npcModal);
  }

  const interactionTargets=[...$$('.zone-node')].map(el=>({type:'zone',key:el.dataset.zone,el})).concat([...$$('.npc')].map(el=>({type:'npc',key:el.dataset.npc,el})));
  function updateNearest(){
    let best=null,bestDist=8;
    interactionTargets.forEach(t=>{ const x=parseFloat(t.el.style.left), y=parseFloat(t.el.style.top); const d=Math.hypot(state.player.x-x,state.player.y-y); if(d<bestDist){best=t;bestDist=d;} });
    nearest=best;
    if(best){ const label=best.type==='zone'?zones[best.key].kicker:npcs[best.key].title; els.interactTitle.textContent=best.type==='zone'?'Открыть зону':'Поговорить'; els.interactText.textContent=label; els.interactHint.classList.add('show'); els.interactHint.style.left=`${parseFloat(best.el.style.left)}%`; els.interactHint.style.top=`${parseFloat(best.el.style.top)-6}%`; }
    else els.interactHint.classList.remove('show');
  }

  function interact(){ if(!nearest){toast('Подойди ближе к объекту'); return;} if(nearest.type==='zone') openZone(nearest.key); else openNpc(nearest.key); }

  function focusPlayer(){ setCamera(0,0); setZoom(1); els.player.animate([{transform:'translate(-50%,-50%) scale(1)'},{transform:'translate(-50%,-50%) scale(1.28)'},{transform:'translate(-50%,-50%) scale(1)'}],{duration:450,easing:'ease-out'}); }

  function randomZone(){ const unlocked=ZONE_ORDER.filter(k=>k!=='game' || state.visited.length>=3); const key=unlocked[Math.floor(Math.random()*unlocked.length)]; const node=$(`.zone-node[data-zone="${key}"]`); node?.animate([{transform:'translate(-50%,-50%) scale(1)'},{transform:'translate(-50%,-50%) scale(1.24)'},{transform:'translate(-50%,-50%) scale(1)'}],{duration:700}); openZone(key); }

  function playTone(freq=440,duration=.04){
    if(!state.sound) return;
    try{
      audioCtx ??= new (window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==='suspended') audioCtx.resume();
      const o=audioCtx.createOscillator(),g=audioCtx.createGain(); o.type='sine'; o.frequency.value=freq; g.gain.setValueAtTime(.0001,audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(.022,audioCtx.currentTime+.01); g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+duration); o.connect(g).connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime+duration+.02);
    }catch{}
  }

  function bootSequence(){
    const lines=['INITIALIZING KNOWLEDGE CORE','MAPPING DISTRICTS','CONNECTING AI LAB','CALIBRATING PLAYER NODE','WORLD READY']; let p=0,i=0;
    const timer=setInterval(()=>{ p=Math.min(100,p+Math.random()*14+9); els.bootProgress.style.width=`${p}%`; els.bootPercent.textContent=`${Math.round(p)}%`; i=Math.min(lines.length-1,Math.floor(p/24)); els.bootLine.textContent=lines[i]; if(p>=100){clearInterval(timer);els.bootEnter.disabled=false;els.bootEnter.classList.add('ready');}},140);
  }
  function enterWorld(){ els.boot.classList.add('hide'); els.body.classList.remove('locked'); setTimeout(()=>els.boot.remove(),700); playTone(520,.06); }

  function setupDrag(){
    els.stage.addEventListener('pointerdown',e=>{
      if(e.target.closest('.zone-node,.npc,.player,.stage-toolbar,.mobile-controls,.map-legend,.interact-hint')) return;
      drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,baseX:cameraX,baseY:cameraY,moved:false}; els.stage.setPointerCapture?.(e.pointerId); els.body.classList.add('map-dragging');
    });
    els.stage.addEventListener('pointermove',e=>{ if(!drag) return; const dx=e.clientX-drag.startX,dy=e.clientY-drag.startY; if(Math.abs(dx)+Math.abs(dy)>6) drag.moved=true; setCamera(drag.baseX+dx,drag.baseY+dy,false); });
    const end=e=>{ if(!drag) return; suppressNextClick=drag.moved; drag=null; els.body.classList.remove('map-dragging'); state.camera={x:cameraX,y:cameraY}; persist(); if(e?.pointerId!=null) els.stage.releasePointerCapture?.(e.pointerId); if(suppressNextClick) setTimeout(()=>{suppressNextClick=false;},0); };
    els.stage.addEventListener('pointerup',end); els.stage.addEventListener('pointercancel',end);
  }

  function setupWheel(){
    els.stage.addEventListener('wheel',e=>{ e.preventDefault(); setZoom(zoom+(e.deltaY<0?.07:-.07)); },{passive:false});
  }

  function setupPointerParallax(){
    els.stage.addEventListener('pointermove',e=>{ if(drag) return; const r=els.stage.getBoundingClientRect(); const nx=(e.clientX-r.left)/r.width-.5; const ny=(e.clientY-r.top)/r.height-.5; document.querySelectorAll('.glow').forEach((g,i)=>g.style.transform=`translate(${nx*(i===1?-18:12)}px,${ny*(i===1?-14:10)}px)`); });
  }

  function wire(){
    els.bootEnter.addEventListener('click',enterWorld);
    els.enterMapBtn.addEventListener('click',()=>els.world?.scrollIntoView?.({behavior:'smooth',block:'center'}));
    els.randomBtn.addEventListener('click',randomZone);
    els.aboutBtn.addEventListener('click',()=>openModal(els.aboutModal));
    els.soundBtn.addEventListener('click',()=>{ state.sound=!state.sound; persist(); els.soundBtn.textContent=state.sound?'●':'◉'; toast(state.sound?'Звук включён':'Звук выключен'); if(state.sound)playTone(520,.06); });
    $('#zoomIn').addEventListener('click',()=>setZoom(zoom+.08)); $('#zoomOut').addEventListener('click',()=>setZoom(zoom-.08)); $('#resetView').addEventListener('click',()=>{setCamera(0,0);setZoom(1)}); $('#focusPlayer').addEventListener('click',focusPlayer); $('#gridBtn').addEventListener('click',()=>document.body.classList.toggle('grid-off'));
    els.missionBtn.addEventListener('click',()=>{ const key=ZONE_ORDER.find(k=>!state.visited.includes(k)); if(key){ const node=$(`.zone-node[data-zone="${key}"]`); node?.animate([{transform:'translate(-50%,-50%) scale(.95)'},{transform:'translate(-50%,-50%) scale(1.2)'},{transform:'translate(-50%,-50%) scale(1)'}],{duration:750}); toast(`Цель: открой ${zones[key].kicker}`); } else toast('Основные зоны уже открыты'); });
    els.zoneActionBtn.addEventListener('click',()=>{ if(activeZone) openLesson(activeZone); });
    els.completeMissionBtn.addEventListener('click',completeMission);
    els.programBtn.addEventListener('click',()=>{ if(activeZone) toast(`${zones[activeZone].kicker}: программа будет расширена следующими уроками`); });
    els.npcRewardBtn.addEventListener('click',rewardNpc);
    $$('.zone-node').forEach(node=>node.addEventListener('click',e=>{if(suppressNextClick){suppressNextClick=false;return;}openZone(node.dataset.zone)}));
    $$('.npc').forEach(node=>node.addEventListener('click',e=>{if(suppressNextClick){suppressNextClick=false;return;}openNpc(node.dataset.npc)}));
    $$('[data-move]').forEach(btn=>btn.addEventListener('click',()=>{const m=btn.dataset.move;movePlayer(m==='left'?-2:m==='right'?2:0,m==='up'?-2:m==='down'?2:0)}));
    $$('[data-close-modal]').forEach(btn=>btn.addEventListener('click',()=>closeModal(document.getElementById(btn.dataset.closeModal))));
    $$('[data-open]').forEach(btn=>btn.addEventListener('click',()=>document.getElementById(btn.dataset.open)?.classList.add('open')));
    $$('[data-close]').forEach(btn=>btn.addEventListener('click',()=>document.getElementById(btn.dataset.close)?.classList.remove('open')));
    $('#mobileMenuBtn').addEventListener('click',()=>$('#rightPanel').classList.toggle('open'));
    els.backdrop.addEventListener('click',closeAll);
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'){closeAll();return;}
      if(e.key.toLowerCase()==='e'){ if(document.querySelector('.modal.open')) return; interact(); }
      if(document.querySelector('.modal.open')) return;
      const k=e.key.toLowerCase(); if(['arrowup','w'].includes(k))movePlayer(0,-2); else if(['arrowdown','s'].includes(k))movePlayer(0,2); else if(['arrowleft','a'].includes(k))movePlayer(-2,0); else if(['arrowright','d'].includes(k))movePlayer(2,0); else if(k==='+'||k==='=')setZoom(zoom+.08); else if(k==='-')setZoom(zoom-.08);
    });
  }

  renderPlayer(); renderProgress(); updateCamera(); updateNearest(); createStars(); setupDrag(); setupWheel(); setupPointerParallax(); wire(); bootSequence();
  window.addEventListener('resize',()=>{createStars();updateNearest();});
})();
