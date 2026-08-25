(() => {
  'use strict';
  const svg = document.getElementById('world');
  const worldGroup = document.getElementById('worldGroup');
  const npcLayer = document.getElementById('npcsLayer');
  const playerLayer = document.getElementById('playerLayer');
  const secretLayer = document.getElementById('secretLayer');
  const boot = document.getElementById('boot');
  const app = document.getElementById('app');
  const bootProgress = document.getElementById('bootProgress');
  const bootPercent = document.getElementById('bootPercent');
  const toast = document.getElementById('toast');
  const viewport = document.getElementById('viewport');

  const SAVE_KEY = 'info-world-v3-state';
  const WORLD = { w: 2400, h: 1500 };
  const VIEW = { w: 1200, h: 760 };
  const zones = {
    hub:{id:'hub',name:'INFO HUB',sub:'CENTRAL PLAZA',x:1175,y:930,level:1,skill:null,focus:'Навигация',mission:'Сориентироваться в городе',text:'Освой управление и найди Python District.',description:'Главная площадь цифрового города. Здесь начинается маршрут ученика.'},
    python:{id:'python',name:'PYTHON DISTRICT',sub:'CODE CAMPUS',x:430,y:430,level:1,skill:'python',focus:'Python с нуля',mission:'Запустить первую программу',text:'Найди терминал Python и выполни print("Hello, world!").',description:'Кампус программирования с учебными терминалами, мастерскими и маленькими code-cafés.'},
    algo:{id:'algo',name:'ALGORITHM CITY',sub:'LOGIC CAMPUS',x:1165,y:520,level:2,skill:'algo',focus:'Алгоритмы',mission:'Пройти первый маршрут',text:'Разберись, как решение проходит через ветвление.',description:'Город логики: площади, узлы и улицы устроены как алгоритмы.'},
    ai:{id:'ai',name:'AI LAB',sub:'NEURAL RESEARCH',x:1810,y:465,level:3,skill:'ai',focus:'AI и нейросети',mission:'Обучить первый узел',text:'Соедини входные данные с правильным результатом.',description:'Лабораторный купол, где данные превращаются в модели и эксперименты.'},
    web:{id:'web',name:'WEB LAB',sub:'CREATOR DISTRICT',x:2050,y:1200,level:2,skill:'web',focus:'HTML / CSS / JS',mission:'Собрать первый интерфейс',text:'Создай кнопку и привяжи к ней событие.',description:'Высотный кампус Web: интерфейсы, браузеры, DOM и серверные узлы.'},
    exam:{id:'exam',name:'EXAM ARENA',sub:'ОГЭ • ЕГЭ',x:420,y:1190,level:4,skill:null,focus:'ОГЭ / ЕГЭ',mission:'Закрыть пробное задание',text:'Реши одну задачу без подсказки.',description:'Арена испытаний с возрастающей сложностью и режимом экзамена.'}
  };
  const zoneOrder = ['python','algo','ai','web','exam'];
  const npcs = [
    {id:'byte',name:'BYTE',role:'MENTOR',x:1090,y:890,color:'#63dcff',reward:20,line:'Начни с Python. Маленькие программы быстрее всего превращаются в большие идеи.'},
    {id:'ada',name:'ADA',role:'AI RESEARCH',x:1610,y:655,color:'#ffc17a',reward:25,line:'AI — это не магия. Данные, модель, проверка результата.'},
    {id:'max',name:'MAX',role:'CREATOR',x:820,y:1070,color:'#b19aff',reward:20,line:'Лучший проект — тот, который тебе хочется показать другому человеку.'}
  ];

  const defaults = {x:1175,y:930,zoom:.62,level:1,xp:0,discovered:['hub'],completed:[],visited:[],secret:false,skills:{python:0,ai:0,algo:0,web:0}};
  let state = structuredClone(defaults);
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(raw) state = {...defaults,...raw,skills:{...defaults.skills,...(raw.skills||{})}};
  } catch { localStorage.removeItem(SAVE_KEY); }

  const player = {x:state.x,y:state.y,r:22,speed:270,dirX:0,dirY:1,bob:0};
  const cam = {x:player.x,y:player.y,zoom:state.zoom||.62,follow:true,drag:false,sx:0,sy:0,ox:0,oy:0};
  const keys = new Set();
  let nearby = null, modalZone = null, modalMode='zone', toastTimer=null, last=performance.now();

  const svgNS='http://www.w3.org/2000/svg';
  const el=(tag,attrs={})=>{const n=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n;};

  function save(){ state.x=player.x;state.y=player.y;state.zoom=cam.zoom; state.level=Math.max(1,Math.floor(state.xp/100)+1); try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));document.getElementById('saveState').textContent='SYNCED';}catch{document.getElementById('saveState').textContent='LOCAL';} }
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function showToast(text){toast.textContent=text;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1900);}
  function zoneOpen(z){return state.discovered.includes(z.id)||state.level>=z.level;}
  function nextMission(){for(const id of zoneOrder){const z=zones[id];if(!state.discovered.includes(id))return {title:`Открыть ${z.name}`,text:'Найди район и доберись до его входа.'};if(!state.completed.includes(id))return {title:z.mission,text:z.text};}if(!state.secret)return {title:'Найти секретный узел',text:'Исследуй дальний восточный сектор города.'};return {title:'Исследовать INFO.WORLD',text:'Основные районы открыты. Теперь создавай собственные проекты.'};}

  function renderNPCs(){npcLayer.innerHTML='';for(const n of npcs){const g=el('g',{class:'npc','data-npc':n.id,transform:`translate(${n.x} ${n.y})`,tabindex:'0'});g.addEventListener('click',e=>{e.stopPropagation();openNpc(n);});g.innerHTML=`<ellipse cx="0" cy="28" rx="23" ry="8" fill="#000" opacity=".28"/><path d="M-13 6 Q0 -4 13 6L11 23Q0 34 -11 23Z" fill="#17242c" stroke="${n.color}" stroke-opacity=".7" stroke-width="2"/><circle cx="0" cy="-4" r="11" fill="#1a2831" stroke="${n.color}" stroke-width="2"/><path d="M-8 -7 Q0 -18 8 -7" fill="none" stroke="${n.color}" stroke-width="4" stroke-linecap="round"/><circle cx="-4" cy="-4" r="1.7" fill="${n.color}"/><circle cx="4" cy="-4" r="1.7" fill="${n.color}"/><rect x="-7" y="10" width="14" height="4" rx="2" fill="${n.color}" opacity=".75"/><text x="0" y="50" text-anchor="middle" fill="#d8e5eb" font-family="Inter" font-size="15" font-weight="700">${n.name}</text><text x="0" y="66" text-anchor="middle" fill="#70818f" font-family="DM Mono" font-size="9">${n.role}</text>`;npcLayer.appendChild(g);} }

  function renderPlayer(){playerLayer.innerHTML='';const g=el('g',{transform:`translate(${player.x} ${player.y})`});g.innerHTML=`<ellipse cx="0" cy="30" rx="27" ry="9" fill="#000" opacity=".34"/><path d="M-16 7Q0 -7 16 7L14 30Q0 43 -14 30Z" fill="#19313a" stroke="#72e7ff" stroke-width="2.5"/><path d="M-12 15L-26 29L-21 34L-7 25Z" fill="#214a54" stroke="#72e7ff" stroke-opacity=".35"/><path d="M12 15L26 29L21 34L7 25Z" fill="#214a54" stroke="#72e7ff" stroke-opacity=".35"/><circle cx="0" cy="-6" r="14" fill="#bcefff"/><path d="M-13 -8Q0 -24 13 -8V-2H-13Z" fill="#27424f"/><circle cx="-5" cy="-6" r="2" fill="#08131a"/><circle cx="5" cy="-6" r="2" fill="#08131a"/><rect x="-8" y="14" width="16" height="5" rx="2.5" fill="#69defa"/><text x="0" y="62" text-anchor="middle" fill="#d9edf4" font-family="DM Mono" font-size="10" font-weight="700">YOU</text>`;playerLayer.appendChild(g);}

  function renderSecret(){secretLayer.innerHTML='';if(state.secret)return;const g=el('g',{transform:'translate(2170 440)',class:'secret'});g.addEventListener('click',e=>{e.stopPropagation();openSecret();});g.innerHTML=`<circle r="26" fill="#21172d" stroke="#c49aff" stroke-width="3"/><circle r="17" fill="#120f19" stroke="#c49aff" stroke-opacity=".35"/><text x="0" y="7" text-anchor="middle" fill="#d9b9ff" font-family="DM Mono" font-size="18" font-weight="700">?</text>`;secretLayer.appendChild(g);}

  function updateWorldTransform(){const tx=(VIEW.w/2)-cam.x*cam.zoom,ty=(VIEW.h/2)-cam.y*cam.zoom;worldGroup.setAttribute('transform',`translate(${tx} ${ty}) scale(${cam.zoom})`);document.getElementById('zoomLabel').textContent=`${Math.round(cam.zoom*100)}%`;renderPlayer();renderSecret();}
  function currentZone(){let best=zones.hub,bd=Infinity;for(const z of Object.values(zones)){const d=Math.hypot(player.x-z.x,player.y-z.y);if(d<bd){best=z;bd=d;}}return best;}
  function nearestTarget(){let best=null,bd=120;for(const z of Object.values(zones)){const d=Math.hypot(player.x-z.x,player.y-z.y);if(d<bd&&z.id!=='hub'){best=z;bd=d;}}for(const n of npcs){const d=Math.hypot(player.x-n.x,player.y-n.y);if(d<bd){best=n;bd=d;}}const sd=Math.hypot(player.x-2170,player.y-440);if(!state.secret&&sd<bd){best={id:'secret',x:2170,y:440,name:'SECRET NODE'};}return best;}
  function updateNearby(){nearby=nearestTarget();const hint=document.getElementById('hint');if(!nearby){hint.classList.remove('show');return;}hint.classList.add('show');document.getElementById('hintText').textContent=nearby.id==='secret'?'Сканировать узел':nearby.id&&zones[nearby.id]?`Войти в ${nearby.name}`:`Поговорить с ${nearby.name}`;}

  function updateUI(){state.level=Math.max(1,Math.floor(state.xp/100)+1);document.getElementById('levelValue').textContent=state.level;document.getElementById('xpValue').textContent=state.xp;document.getElementById('xpBar').style.width=`${state.xp%100}%`;const count=state.discovered.filter(id=>id!=='hub').length;document.getElementById('discoverCount').textContent=count;document.getElementById('discoverBar').style.width=`${Math.min(100,count/5*100)}%`;const m=nextMission();document.getElementById('missionTitle').textContent=m.title;document.getElementById('missionText').textContent=m.text;document.getElementById('hudMission').textContent=m.title;const z=currentZone();document.getElementById('locationName').textContent=z.name;document.getElementById('locationSub').textContent=z.sub;document.querySelectorAll('.skill').forEach(s=>{const v=clamp(Number(state.skills?.[s.dataset.skill]||0),0,100);s.querySelector('b').textContent=`${v}%`;s.querySelector('.bar span').style.width=`${v}%`;});buildNav();}
  function buildNav(){const list=document.getElementById('navList');list.innerHTML='';for(const id of zoneOrder){const z=zones[id];const b=document.createElement('button');b.className='nav-item';b.innerHTML=`<span>${z.name}</span><span>${state.completed.includes(id)?'DONE':zoneOpen(z)?'OPEN':'LV '+z.level}</span>`;b.onclick=()=>focusZone(id);list.appendChild(b);}}

  function openZone(z){if(!zoneOpen(z)){showToast(`Требуется уровень ${z.level}`);return;}if(!state.discovered.includes(z.id)){state.discovered.push(z.id);state.xp+=10;showToast(`${z.name} открыт · +10 XP`);}save();updateUI();openModal(z);}
  function openNpc(n){if(!state.visited.includes(n.id)){state.visited.push(n.id);state.xp+=n.reward;save();updateUI();showToast(`${n.name}: +${n.reward} XP`);}else showToast(`${n.name}: ${n.line}`);}
  function openSecret(){if(state.discovered.filter(id=>id!=='hub').length<3){showToast('Сначала открой 3 района.');return;}if(!state.secret){state.secret=true;state.xp+=50;save();updateUI();renderSecret();showToast('Секретный узел найден · +50 XP');}}
  function interact(){if(!nearby)return;if(nearby.id==='secret')return openSecret();if(nearby.id&&zones[nearby.id])return openZone(zones[nearby.id]);if(nearby.id)openNpc(nearby);}
  function focusZone(id){const z=zones[id];if(!z)return;cam.follow=false;cam.x=z.x;cam.y=z.y;updateWorldTransform();showToast(`${z.name} в фокусе`);}

  function openModal(z){modalMode='zone';modalZone=z;document.getElementById('modalCode').textContent=`ZONE ${String(z.level).padStart(2,'0')}`;document.getElementById('modalStatus').textContent=state.completed.includes(z.id)?'COMPLETED':zoneOpen(z)?'OPEN':'LOCKED';document.getElementById('modalTitle').textContent=z.name;document.getElementById('modalDescription').textContent=z.description;document.getElementById('modalFocus').textContent=z.focus;document.getElementById('modalLevel').textContent=`Уровень ${z.level}+`;document.getElementById('modalMission').textContent=z.mission;document.getElementById('modalMissionText').textContent=z.text;document.getElementById('modalAction').textContent=state.completed.includes(z.id)?'Повторить':'Начать';document.getElementById('modalBackdrop').hidden=false;}
  function closeModal(){document.getElementById('modalBackdrop').hidden=true;modalZone=null;}
  document.getElementById('modalClose').onclick=closeModal;document.getElementById('modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')closeModal();});document.getElementById('modalAction').onclick=()=>{if(modalMode==='help'){closeModal();return;}if(!modalZone)return; if(!state.completed.includes(modalZone.id)){state.completed.push(modalZone.id);state.xp+=35;if(modalZone.skill)state.skills[modalZone.skill]=clamp((state.skills[modalZone.skill]||0)+25,0,100);save();updateUI();showToast(`${modalZone.name} · миссия завершена · +35 XP`);}closeModal();};
  function openHelp(){modalMode='help';modalZone=null;document.getElementById('modalCode').textContent='HELP 00';document.getElementById('modalStatus').textContent='ONLINE';document.getElementById('modalTitle').textContent='Как работает INFO.WORLD';document.getElementById('modalDescription').textContent='Это цифровой город. Иди по дорогам, встречай персонажей, открывай районы и превращай каждое обучение в миссию.';document.getElementById('modalFocus').textContent='Исследование';document.getElementById('modalLevel').textContent='Без ограничений';document.getElementById('modalMission').textContent='Начни с Python';document.getElementById('modalMissionText').textContent='Подойди к Python District и нажми E.';document.getElementById('modalAction').textContent='Понятно';document.getElementById('modalBackdrop').hidden=false;}

  function blocked(x,y){if(x<90||x>2310||y<90||y>1410)return true; if(x>1280&&x<2010&&y>770&&y<1110)return true;return false;}
  function updatePlayer(dt){let dx=0,dy=0;if(keys.has('w'))dy-=1;if(keys.has('s'))dy+=1;if(keys.has('a'))dx-=1;if(keys.has('d'))dx+=1;if(keys.has('arrowup'))dy-=1;if(keys.has('arrowdown'))dy+=1;if(keys.has('arrowleft'))dx-=1;if(keys.has('arrowright'))dx+=1;if(dx||dy){const m=Math.hypot(dx,dy);dx/=m;dy/=m;player.dirX=dx;player.dirY=dy;const nx=player.x+dx*player.speed*dt,ny=player.y+dy*player.speed*dt;if(!blocked(nx,player.y))player.x=nx;if(!blocked(player.x,ny))player.y=ny;player.bob+=dt*10;cam.follow=true;}if(cam.follow){cam.x+=(player.x-cam.x)*.09;cam.y+=(player.y-cam.y)*.09;}updateWorldTransform();updateNearby();}

  function svgPoint(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const m=svg.getScreenCTM();return m.inverse().matrixTransform(p);}
  let dragStart=null;
  svg.addEventListener('pointerdown',e=>{if(e.target.closest('.site,.npc,.secret'))return;svg.setPointerCapture?.(e.pointerId);const p=svgPoint(e);dragStart={x:e.clientX,y:e.clientY,cx:cam.x,cy:cam.y,moved:false};cam.follow=false;dragStart.worldX=p.x;dragStart.worldY=p.y;});
  svg.addEventListener('pointermove',e=>{if(!dragStart)return;const dx=(e.clientX-dragStart.x)/(svg.clientWidth/VIEW.w)/cam.zoom,dy=(e.clientY-dragStart.y)/(svg.clientHeight/VIEW.h)/cam.zoom;if(Math.hypot(e.clientX-dragStart.x,e.clientY-dragStart.y)>6)dragStart.moved=true;cam.x=clamp(dragStart.cx-dx,120,2280);cam.y=clamp(dragStart.cy-dy,100,1400);updateWorldTransform();});
  svg.addEventListener('pointerup',e=>{if(!dragStart)return;if(!dragStart.moved){const p=svgPoint(e);const worldX=(p.x-(VIEW.w/2))/cam.zoom+cam.x;const worldY=(p.y-(VIEW.h/2))/cam.zoom+cam.y;for(const z of Object.values(zones)){if(z.id!=='hub'&&Math.hypot(worldX-z.x,worldY-z.y)<170){openZone(z);break;}}}dragStart=null;});
  svg.addEventListener('pointercancel',()=>dragStart=null);
  svg.addEventListener('wheel',e=>{e.preventDefault();cam.follow=false;cam.zoom=clamp(cam.zoom*(e.deltaY>0?.93:1.08),.45,1.0);updateWorldTransform();save();},{passive:false});

  document.getElementById('zoomIn').onclick=()=>{cam.follow=false;cam.zoom=clamp(cam.zoom*1.08,.45,1);updateWorldTransform();save();};
  document.getElementById('zoomOut').onclick=()=>{cam.follow=false;cam.zoom=clamp(cam.zoom*.92,.45,1);updateWorldTransform();save();};
  document.getElementById('recenter').onclick=()=>{cam.follow=true;cam.x=player.x;cam.y=player.y;updateWorldTransform();};
  document.getElementById('brandBtn').onclick=()=>{cam.follow=true;player.x=1175;player.y=930;cam.x=player.x;cam.y=player.y;updateWorldTransform();showToast('INFO HUB');};
  document.getElementById('focusMission').onclick=()=>{const m=nextMission();const z=Object.values(zones).find(v=>m.title.includes(v.name.split(' ')[0]));if(z)focusZone(z.id);};
  document.getElementById('helpBtn').onclick=openHelp;document.getElementById('profileBtn').onclick=()=>showToast(`Уровень ${state.level} · ${state.xp} XP`);

  document.addEventListener('keydown',e=>{const map={KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',ArrowUp:'arrowup',ArrowDown:'arrowdown',ArrowLeft:'arrowleft',ArrowRight:'arrowright'};if(e.code==='KeyE'){e.preventDefault();interact();return;}if(e.code==='Escape'){e.preventDefault();closeModal();return;}if(map[e.code]){e.preventDefault();keys.add(map[e.code]);}});
  document.addEventListener('keyup',e=>{const map={KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',ArrowUp:'arrowup',ArrowDown:'arrowdown',ArrowLeft:'arrowleft',ArrowRight:'arrowright'};if(map[e.code])keys.delete(map[e.code]);});
  document.querySelectorAll('#touchPad [data-dir]').forEach(btn=>{const map={up:'w',down:'s',left:'a',right:'d'};const on=e=>{e.preventDefault();keys.add(map[btn.dataset.dir]);};const off=e=>{e.preventDefault();keys.delete(map[btn.dataset.dir]);};btn.addEventListener('pointerdown',on);btn.addEventListener('pointerup',off);btn.addEventListener('pointercancel',off);btn.addEventListener('pointerleave',off);});

  document.querySelectorAll('.site').forEach(node=>{const id=node.dataset.site;if(id&&zones[id]&&id!=='hub')node.addEventListener('click',e=>{e.stopPropagation();openZone(zones[id]);});});

  function clock(){document.getElementById('clock').textContent=new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});} setInterval(clock,1000);clock();
  function bootSequence(){let n=0;const t=setInterval(()=>{n=Math.min(100,n+Math.floor(Math.random()*9)+6);bootProgress.style.width=n+'%';bootPercent.textContent=n+'%';if(n>=100){clearInterval(t);setTimeout(()=>{boot.style.opacity='0';setTimeout(()=>{boot.remove();app.classList.add('ready');app.setAttribute('aria-hidden','false');},350)},180)}},70);}

  renderNPCs();updateUI();updateWorldTransform();bootSequence();save();
  function loop(now){const dt=Math.min(.032,(now-last)/1000);last=now;updatePlayer(dt);requestAnimationFrame(loop);} requestAnimationFrame(loop);window.addEventListener('beforeunload',save);setInterval(save,5000);
})();
