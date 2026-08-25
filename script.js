(() => {
  'use strict';

  const canvas = document.getElementById('worldCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const viewport = document.getElementById('viewport');
  const boot = document.getElementById('boot');
  const app = document.getElementById('app');
  const bootProgress = document.getElementById('bootProgress');
  const bootPercent = document.getElementById('bootPercent');
  const toast = document.getElementById('toast');

  const SAVE_KEY = 'info-world-2-state';
  const WORLD = { w: 2400, h: 1700 };

  const zones = [
    { id:'hub', name:'INFO HUB', sub:'CENTRAL DISTRICT', x:1200,y:820,w:360,h:280, color:'#5dd8ff', level:1, skill:'general', focus:'Навигация', mission:'Сориентироваться в мире', text:'Освой базовое управление и найди первую учебную зону.', description:'Центральная площадь — отправная точка мира. Здесь находятся главный терминал, карта районов и первые задания.' },
    { id:'python', name:'PYTHON DISTRICT', sub:'CODE DISTRICT', x:560,y:500,w:420,h:330,color:'#65d7a5',level:1,skill:'python',focus:'Python с нуля',mission:'Запустить первую программу',text:'Найди терминал и выполни print("Hello, world!").',description:'Улица терминалов, маленькие code-cafés и мастерские отладки. Здесь начинается программирование.' },
    { id:'algo', name:'ALGORITHM CITY', sub:'LOGIC DISTRICT', x:1000,y:260,w:430,h:320,color:'#a58aff',level:2,skill:'algo',focus:'Алгоритмы',mission:'Пройти первый маршрут',text:'Разоберись, как решение проходит через условие.',description:'Город-лабиринт из логических узлов. Улицы здесь построены как алгоритмы: каждый поворот зависит от решения.' },
    { id:'ai', name:'AI LAB', sub:'FUTURE DISTRICT', x:1690,y:430,w:470,h:340,color:'#ffb66d',level:3,skill:'ai',focus:'AI и нейросети',mission:'Обучить первый узел',text:'Соедини входные данные с правильным результатом.',description:'Лаборатория данных и нейросетей. Здесь объясняется, как машины учатся на примерах.' },
    { id:'web', name:'WEB LAB', sub:'NETWORK DISTRICT', x:1770,y:1050,w:420,h:330,color:'#66b6ff',level:2,skill:'web',focus:'HTML / CSS / JS',mission:'Собрать первый интерфейс',text:'Создай простую кнопку и свяжи её с событием.',description:'Сектор браузеров, интерфейсов и серверных узлов. Здесь идеи превращаются в сайты.' },
    { id:'exam', name:'EXAM ARENA', sub:'CHALLENGE DISTRICT', x:570,y:1180,w:500,h:330,color:'#f08cf1',level:4,skill:'general',focus:'ОГЭ / ЕГЭ',mission:'Закрыть пробное задание',text:'Реши одну задачу без подсказки.',description:'Большая экзаменационная арена. Подготовка строится как серия испытаний с растущей сложностью.' },
  ];

  const props = [
    {x:860,y:730,type:'bridge'},{x:1510,y:620,type:'bridge'},{x:1200,y:1130,type:'bridge'},
    {x:420,y:910,type:'terminal'},{x:1450,y:420,type:'tower'},{x:1550,y:1080,type:'tower'},
    {x:780,y:1040,type:'tree'},{x:1120,y:1420,type:'tree'},{x:1490,y:970,type:'tree'},{x:2050,y:850,type:'tree'},
    {x:1040,y:680,type:'lamp'},{x:1350,y:720,type:'lamp'},{x:1610,y:820,type:'lamp'},{x:720,y:980,type:'lamp'},
  ];

  const npcs = [
    {id:'byte',name:'BYTE',role:'MENTOR',x:1115,y:845,color:'#61d7ff',line:'Начни с Python. Маленькие программы быстрее всего превращаются в большие идеи.',reward:20},
    {id:'ada',name:'ADA',role:'AI RESEARCH',x:1600,y:690,color:'#ffb86a',line:'AI — это не магия. Данные, модель, проверка результата. Исследуй и увидишь.',reward:25},
    {id:'max',name:'MAX',role:'CREATOR',x:820,y:1030,color:'#a892ff',line:'Лучший проект — тот, который тебе хочется показать другому человеку.',reward:20},
  ];

  const roads = [
    [[1200,820],[780,670],[560,660]],
    [[1200,820],[1205,500]],
    [[1200,820],[1460,620],[1690,600]],
    [[1200,820],[1510,1000],[1770,1190]],
    [[1200,820],[930,980],[820,1200],[570,1340]],
  ];

  const safeDefaults = () => ({
    x:1185,y:920,zoom:0.82,camX:0,camY:0,level:1,xp:0,discovered:['hub'],completed:[],visited:[],secret:false,skills:{python:0,ai:0,algo:0,web:0}
  });

  let state = safeDefaults();
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(raw && typeof raw === 'object') state = {...state,...raw,skills:{...state.skills,...(raw.skills||{})}};
  } catch { localStorage.removeItem(SAVE_KEY); }

  const player = { x: state.x, y: state.y, r: 18, speed: 260, dirX:0, dirY:1, bob:0 };
  const cam = { x: WORLD.w/2, y: WORLD.h/2, zoom: state.zoom || .82, drag:false, sx:0, sy:0, ox:0, oy:0, follow:true };
  const keys = new Set();
  let nearby = null;
  let modalZone = null;
  let toastTimer = null;
  let modalActionMode = 'zone';
  let pointerStartX = 0;
  let pointerStartY = 0;
  let pointerMoved = false;
  let last = performance.now();

  function save(){
    state.x=player.x;state.y=player.y;state.zoom=cam.zoom;state.visited=[...new Set(state.visited)];
    try{localStorage.setItem(SAVE_KEY, JSON.stringify(state));document.getElementById('saveState').textContent='SYNCED';}catch{document.getElementById('saveState').textContent='LOCAL';}
  }
  function showToast(text){toast.textContent=text;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1900)}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function lerp(a,b,t){return a+(b-a)*t}
  function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
  function worldToScreen(x,y){return {x:(x-cam.x)*cam.zoom+canvas._cssW/2,y:(y-cam.y)*cam.zoom+canvas._cssH/2}}
  function screenToWorld(x,y){return {x:(x-canvas._cssW/2)/cam.zoom+cam.x,y:(y-canvas._cssH/2)/cam.zoom+cam.y}}

  function resize(){const dpr=Math.min(window.devicePixelRatio||1,2);const r=canvas.getBoundingClientRect();canvas.width=Math.max(1,Math.floor(r.width*dpr));canvas.height=Math.max(1,Math.floor(r.height*dpr));canvas._dpr=dpr;canvas._cssW=r.width;canvas._cssH=r.height;ctx.setTransform(dpr,0,0,dpr,0,0);}
  window.addEventListener('resize',resize);

  function drawRoundedRect(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.stroke()}}
  function hexToRgba(hex,a){const h=hex.replace('#','');const n=parseInt(h,16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`}

  function drawBackground(t){
    const w=canvas._cssW,h=canvas._cssH;
    const g=ctx.createRadialGradient(w*.48,h*.44,0,w*.48,h*.44,Math.max(w,h)*.75);g.addColorStop(0,'#14233a');g.addColorStop(.5,'#0a1721');g.addColorStop(1,'#071019');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    ctx.save();ctx.globalAlpha=.35;
    for(let i=0;i<90;i++){const sx=(i*137+Math.sin(t*.0001+i)*45)%w;const sy=(i*79+Math.cos(t*.00013+i)*25)%h;ctx.fillStyle=i%5===0?'#8ee4ff':'#6b7683';ctx.fillRect(sx,sy,(i%3)+1,(i%3)+1)}ctx.restore();
    // subtle atmosphere zones
    const blobs=[['#274f83',.14,.28,.34],['#653881',.12,.74,.2],['#176d72',.10,.82,.65]];
    blobs.forEach(([col,a,cx,cy])=>{const rg=ctx.createRadialGradient(w*cx,h*cy,0,w*cx,h*cy,Math.min(w,h)*.42);rg.addColorStop(0,hexToRgba(col,a));rg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,w,h)});
  }

  function drawGrid(){
    const minX=cam.x-canvas._cssW/(2*cam.zoom), maxX=cam.x+canvas._cssW/(2*cam.zoom), minY=cam.y-canvas._cssH/(2*cam.zoom), maxY=cam.y+canvas._cssH/(2*cam.zoom);
    const step=80;ctx.save();ctx.strokeStyle='rgba(120,170,200,.045)';ctx.lineWidth=1/cam.zoom;
    for(let x=Math.floor(minX/step)*step;x<=maxX;x+=step){ctx.beginPath();ctx.moveTo(x,minY);ctx.lineTo(x,maxY);ctx.stroke()}
    for(let y=Math.floor(minY/step)*step;y<=maxY;y+=step){ctx.beginPath();ctx.moveTo(minX,y);ctx.lineTo(maxX,y);ctx.stroke()}
    ctx.restore();
  }

  function pathScreen(points){ctx.beginPath();points.forEach((p,i)=>{const s=worldToScreen(p[0],p[1]);if(i===0)ctx.moveTo(s.x,s.y);else ctx.lineTo(s.x,s.y)});}
  function drawRoads(){
    roads.forEach(line=>{ctx.save();ctx.lineCap='round';pathScreen(line);ctx.strokeStyle='rgba(7,11,15,.85)';ctx.lineWidth=76*cam.zoom;ctx.stroke();pathScreen(line);ctx.strokeStyle='rgba(64,79,94,.6)';ctx.lineWidth=52*cam.zoom;ctx.stroke();pathScreen(line);ctx.setLineDash([12*cam.zoom,14*cam.zoom]);ctx.strokeStyle='rgba(135,158,177,.2)';ctx.lineWidth=2*cam.zoom;ctx.stroke();ctx.setLineDash([]);ctx.restore()});
  }
  function drawWater(){
    ctx.save();
    const top=920,left=1300;ctx.beginPath();ctx.moveTo(worldToScreen(left,780).x,worldToScreen(left,780).y);ctx.bezierCurveTo(worldToScreen(1600,820).x,worldToScreen(1600,820).y,worldToScreen(1780,870).x,worldToScreen(1780,870).y,worldToScreen(1780,960).x,worldToScreen(1780,960).y);ctx.bezierCurveTo(worldToScreen(1800,1050).x,worldToScreen(1800,1050).y,worldToScreen(1650,1100).x,worldToScreen(1650,1100).y,worldToScreen(1530,1060).x,worldToScreen(1530,1060).y);ctx.bezierCurveTo(worldToScreen(1440,1020).x,worldToScreen(1440,1020).y,worldToScreen(1370,980).x,worldToScreen(1370,980).y,worldToScreen(left,920).x,worldToScreen(left,920).y);ctx.closePath();ctx.fillStyle='rgba(26,87,118,.28)';ctx.fill();ctx.strokeStyle='rgba(105,213,255,.15)';ctx.lineWidth=2;ctx.stroke();
    for(let i=0;i<8;i++){const y=800+i*36;ctx.beginPath();ctx.moveTo(worldToScreen(1430,y).x,worldToScreen(1430,y).y);ctx.quadraticCurveTo(worldToScreen(1600,y+12).x,worldToScreen(1600,y+12).y,worldToScreen(1770,y-3).x,worldToScreen(1770,y-3).y);ctx.strokeStyle='rgba(106,211,243,.14)';ctx.lineWidth=2;ctx.stroke()}
    ctx.restore();
  }

  function drawZone(zone,t){
    const s=worldToScreen(zone.x,zone.y),w=zone.w*cam.zoom,h=zone.h*cam.zoom;
    const active=nearby?.id===zone.id; const found=state.discovered.includes(zone.id);
    ctx.save();
    // ground patch
    drawRoundedRect(ctx,s.x-w/2,s.y-h/2,w,h,28*cam.zoom,found?hexToRgba(zone.color,.08):'rgba(255,255,255,.025)',active?'rgba(255,255,255,.28)':'rgba(255,255,255,.07)');
    // buildings / landmarks specific to zone
    const baseX=s.x,baseY=s.y;
    ctx.shadowBlur=active?22:10;ctx.shadowColor=hexToRgba(zone.color,active?.3:.16);
    if(zone.id==='hub'){
      drawRoundedRect(ctx,baseX-120*cam.zoom,baseY-70*cam.zoom,240*cam.zoom,140*cam.zoom,25*cam.zoom,'#111d27','rgba(123,184,221,.22)');
      ctx.shadowBlur=0;ctx.fillStyle='#173244';ctx.fillRect(baseX-88*cam.zoom,baseY-50*cam.zoom,176*cam.zoom,90*cam.zoom);
      ctx.fillStyle='#dff6ff';ctx.font=`700 ${12*cam.zoom}px Inter`;ctx.textAlign='center';ctx.fillText('INFO HUB',baseX,baseY-10*cam.zoom);
      ctx.fillStyle='#6bd4ff';ctx.font=`${7*cam.zoom}px DM Mono`;ctx.fillText('LEARNING CORE',baseX,baseY+9*cam.zoom);
      ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(baseX-54*cam.zoom,baseY+26*cam.zoom,108*cam.zoom,4*cam.zoom);
    } else if(zone.id==='python') drawPythonDistrict(s.x,s.y,zone);
    else if(zone.id==='algo') drawAlgoDistrict(s.x,s.y,zone,t);
    else if(zone.id==='ai') drawAiDistrict(s.x,s.y,zone,t);
    else if(zone.id==='web') drawWebDistrict(s.x,s.y,zone);
    else if(zone.id==='exam') drawExamDistrict(s.x,s.y,zone);
    ctx.shadowBlur=0;
    // label
    ctx.textAlign='center';ctx.fillStyle='#dbe4eb';ctx.font=`700 ${10*cam.zoom}px Inter`;ctx.fillText(zone.name,baseX,baseY+h/2+22*cam.zoom);ctx.fillStyle='#627181';ctx.font=`${7*cam.zoom}px DM Mono`;ctx.fillText(zone.sub,baseX,baseY+h/2+35*cam.zoom);
    if(zone.id!=='hub'){
      const dotY=baseY-h/2-13*cam.zoom;ctx.beginPath();ctx.arc(baseX,dotY,4*cam.zoom,0,Math.PI*2);ctx.fillStyle=found?zone.color:'#505b66';ctx.fill();
      if(!found){ctx.font=`${7*cam.zoom}px DM Mono`;ctx.fillStyle='#687481';ctx.fillText('LOCKED BY LEVEL',baseX,dotY-10*cam.zoom)}
    }
    ctx.restore();
  }
  function drawPythonDistrict(x,y,z){
    ctx.fillStyle='#13251e';ctx.fillRect(x-120*cam.zoom,y-60*cam.zoom,240*cam.zoom,120*cam.zoom);ctx.fillStyle='#1e3a2e';for(let i=-2;i<=2;i++)for(let j=-1;j<=1;j++){ctx.fillRect(x+i*42*cam.zoom-15*cam.zoom,y+j*38*cam.zoom-10*cam.zoom,30*cam.zoom,20*cam.zoom)}ctx.fillStyle='#7de2af';ctx.fillRect(x-20*cam.zoom,y-70*cam.zoom,40*cam.zoom,20*cam.zoom);ctx.fillStyle='#0e1712';ctx.font=`700 ${12*cam.zoom}px DM Mono`;ctx.textAlign='center';ctx.fillText('</>',x,y-55*cam.zoom);for(let i=-3;i<=3;i++){ctx.fillStyle='rgba(111,220,173,.18)';ctx.fillRect(x+i*46*cam.zoom-1*cam.zoom,y+65*cam.zoom,2*cam.zoom,8*cam.zoom)}}
  function drawAlgoDistrict(x,y,z,t){
    ctx.fillStyle='#17162a';ctx.fillRect(x-135*cam.zoom,y-70*cam.zoom,270*cam.zoom,140*cam.zoom);const nodes=[];for(let i=-2;i<=2;i++)nodes.push({x:x+i*45*cam.zoom,y:y+Math.sin(t*.001+i)*12*cam.zoom});ctx.strokeStyle='rgba(165,138,255,.2)';ctx.lineWidth=3*cam.zoom;for(let i=0;i<nodes.length-1;i++){ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[i+1].x,nodes[i+1].y);ctx.stroke()}nodes.forEach((n,i)=>{ctx.beginPath();ctx.arc(n.x,n.y,18*cam.zoom,0,Math.PI*2);ctx.fillStyle=i===2?'#5e4b9e':'#27213f';ctx.fill();ctx.strokeStyle='rgba(183,160,255,.45)';ctx.stroke();ctx.fillStyle='#dbd4ff';ctx.font=`700 ${9*cam.zoom}px DM Mono`;ctx.textAlign='center';ctx.fillText(i===2?'Σ':'•',n.x,n.y+3*cam.zoom)})}
  function drawAiDistrict(x,y,z,t){
    ctx.fillStyle='#2a2117';ctx.fillRect(x-145*cam.zoom,y-75*cam.zoom,290*cam.zoom,150*cam.zoom);ctx.strokeStyle='rgba(255,190,112,.18)';ctx.lineWidth=2;ctx.strokeRect(x-145*cam.zoom,y-75*cam.zoom,290*cam.zoom,150*cam.zoom);ctx.strokeStyle='rgba(255,190,112,.25)';ctx.lineWidth=1;for(let i=0;i<6;i++){const px=x-100*cam.zoom+i*40*cam.zoom;const py=y+Math.sin(t*.001+i)*22*cam.zoom;ctx.beginPath();ctx.arc(px,py,6*cam.zoom,0,Math.PI*2);ctx.fillStyle='#a87235';ctx.fill();if(i){ctx.beginPath();ctx.moveTo(px-40*cam.zoom,y+Math.sin(t*.001+i-1)*22*cam.zoom);ctx.lineTo(px,py);ctx.stroke()}}ctx.fillStyle='#ffd6a7';ctx.font=`700 ${12*cam.zoom}px Inter`;ctx.textAlign='center';ctx.fillText('AI CORE',x,y-42*cam.zoom)}
  function drawWebDistrict(x,y,z){ctx.fillStyle='#15263a';ctx.fillRect(x-125*cam.zoom,y-65*cam.zoom,250*cam.zoom,130*cam.zoom);ctx.fillStyle='#1d3a58';ctx.fillRect(x-100*cam.zoom,y-42*cam.zoom,200*cam.zoom,85*cam.zoom);ctx.fillStyle='#6bbcff';ctx.fillRect(x-88*cam.zoom,y-28*cam.zoom,60*cam.zoom,8*cam.zoom);for(let i=0;i<4;i++)ctx.fillStyle='rgba(107,188,255,.35)',ctx.fillRect(x-88*cam.zoom,y-6*cam.zoom+i*13*cam.zoom,140*cam.zoom,5*cam.zoom);ctx.fillStyle='#cfeeff';ctx.font=`700 ${11*cam.zoom}px Inter`;ctx.textAlign='center';ctx.fillText('WEB LAB',x,y-45*cam.zoom)}
  function drawExamDistrict(x,y,z){ctx.fillStyle='#2a192a';ctx.fillRect(x-155*cam.zoom,y-72*cam.zoom,310*cam.zoom,144*cam.zoom);ctx.fillStyle='#5a2e58';ctx.fillRect(x-115*cam.zoom,y-42*cam.zoom,230*cam.zoom,70*cam.zoom);ctx.fillStyle='#ffb3f1';ctx.font=`700 ${13*cam.zoom}px DM Mono`;ctx.textAlign='center';ctx.fillText('EXAM',x,y-8*cam.zoom);ctx.fillStyle='#d9a8d2';ctx.font=`${8*cam.zoom}px DM Mono`;ctx.fillText('ARENA',x,y+10*cam.zoom)}

  function drawProps(t){
    props.forEach(p=>{const s=worldToScreen(p.x,p.y);ctx.save();if(p.type==='tree'){ctx.fillStyle='#0c302a';ctx.fillRect(s.x-4*cam.zoom,s.y+8*cam.zoom,8*cam.zoom,20*cam.zoom);ctx.beginPath();ctx.arc(s.x,s.y,18*cam.zoom,0,Math.PI*2);ctx.fillStyle='#123f37';ctx.fill();ctx.beginPath();ctx.arc(s.x-8*cam.zoom,s.y-7*cam.zoom,10*cam.zoom,0,Math.PI*2);ctx.fillStyle='#185044';ctx.fill()}else if(p.type==='lamp'){ctx.fillStyle='#40505e';ctx.fillRect(s.x-2*cam.zoom,s.y-14*cam.zoom,4*cam.zoom,28*cam.zoom);ctx.beginPath();ctx.arc(s.x,s.y-16*cam.zoom,7*cam.zoom,0,Math.PI*2);ctx.fillStyle='rgba(111,211,255,.35)';ctx.shadowBlur=20;ctx.shadowColor='#6fd3ff';ctx.fill()}else if(p.type==='tower'){ctx.fillStyle='#152331';ctx.fillRect(s.x-14*cam.zoom,s.y-46*cam.zoom,28*cam.zoom,92*cam.zoom);for(let i=0;i<4;i++){ctx.fillStyle='rgba(120,203,255,.28)';ctx.fillRect(s.x-9*cam.zoom,s.y-34*cam.zoom+i*20*cam.zoom,18*cam.zoom,4*cam.zoom)}}else if(p.type==='terminal'){ctx.fillStyle='#112232';drawRoundedRect(ctx,s.x-22*cam.zoom,s.y-16*cam.zoom,44*cam.zoom,32*cam.zoom,8*cam.zoom,'#112232','rgba(105,213,255,.22)');ctx.fillStyle='#76d8ff';ctx.font=`700 ${10*cam.zoom}px DM Mono`;ctx.textAlign='center';ctx.fillText('>_',s.x,s.y+4*cam.zoom)}else if(p.type==='bridge'){ctx.strokeStyle='rgba(183,208,221,.23)';ctx.lineWidth=20*cam.zoom;ctx.beginPath();ctx.moveTo(s.x-45*cam.zoom,s.y);ctx.lineTo(s.x+45*cam.zoom,s.y);ctx.stroke()}ctx.restore()})
  }

  function drawNpcs(t){
    npcs.forEach(n=>{const s=worldToScreen(n.x,n.y);const pulse=1+Math.sin(t*.004+n.x)*.08;ctx.save();ctx.beginPath();ctx.ellipse(s.x,s.y+16*cam.zoom,18*cam.zoom,7*cam.zoom,0,0,Math.PI*2);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fill();ctx.shadowBlur=18;ctx.shadowColor=hexToRgba(n.color,.35);ctx.beginPath();ctx.arc(s.x,s.y,15*cam.zoom*pulse,0,Math.PI*2);ctx.fillStyle='#1a2730';ctx.fill();ctx.strokeStyle=hexToRgba(n.color,.75);ctx.lineWidth=2*cam.zoom;ctx.stroke();ctx.fillStyle=n.color;ctx.font=`700 ${9*cam.zoom}px Inter`;ctx.textAlign='center';ctx.fillText(n.name,s.x,s.y+3*cam.zoom);ctx.font=`${7*cam.zoom}px DM Mono`;ctx.fillStyle='#7c8895';ctx.fillText(n.role,s.x,s.y+28*cam.zoom);ctx.restore()})
  }

  function drawPlayer(t){
    const s=worldToScreen(player.x,player.y);const bob=Math.sin(t*.008)*1.6*cam.zoom;ctx.save();ctx.translate(s.x,s.y+bob);ctx.beginPath();ctx.ellipse(0,16*cam.zoom,20*cam.zoom,7*cam.zoom,0,0,Math.PI*2);ctx.fillStyle='rgba(0,0,0,.4)';ctx.fill();ctx.shadowBlur=28;ctx.shadowColor='rgba(105,213,255,.45)';ctx.beginPath();ctx.arc(0,0,18*cam.zoom,0,Math.PI*2);ctx.fillStyle='#0b1822';ctx.fill();ctx.strokeStyle='#6fd8ff';ctx.lineWidth=2.5*cam.zoom;ctx.stroke();ctx.beginPath();ctx.arc(0,-2*cam.zoom,8*cam.zoom,0,Math.PI*2);ctx.fillStyle='#71d7ff';ctx.fill();ctx.beginPath();ctx.moveTo(player.dirX*10*cam.zoom,player.dirY*10*cam.zoom);ctx.lineTo(player.dirX*18*cam.zoom,player.dirY*18*cam.zoom);ctx.strokeStyle='#dff8ff';ctx.lineWidth=2*cam.zoom;ctx.stroke();ctx.font=`700 ${8*cam.zoom}px DM Mono`;ctx.fillStyle='#d4e8f1';ctx.textAlign='center';ctx.fillText('YOU',0,34*cam.zoom);ctx.restore()}

  function drawSecret(){ if(!state.secret){const s=worldToScreen(2080,520);ctx.save();ctx.fillStyle='#14101d';ctx.strokeStyle='rgba(197,145,255,.4)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(s.x,s.y,24*cam.zoom,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#cf9cff';ctx.font=`700 ${14*cam.zoom}px DM Mono`;ctx.textAlign='center';ctx.fillText('?',s.x,s.y+5*cam.zoom);ctx.restore();} }

  function nearestTarget(){
    let best=null,bd=95;
    [...zones.filter(z=>z.id!=='hub'),...npcs,{id:'secret',name:'UNKNOWN NODE',x:2080,y:520}].forEach(o=>{const d=Math.hypot(player.x-o.x,player.y-o.y);if(d<bd){best=o;bd=d}});return best;
  }

  function updateNearby(){nearby=nearestTarget();const hint=document.getElementById('hint');if(nearby){hint.classList.add('show');document.getElementById('hintText').textContent=nearby.id==='secret'?'Сканировать неизвестный узел':nearby.id==='byte'||nearby.id==='ada'||nearby.id==='max'?`Поговорить с ${nearby.name}`:state.discovered.includes(nearby.id)?`Войти в ${nearby.name}`:`Исследовать ${nearby.name}`}else hint.classList.remove('show');}

  function isBlocked(x,y){
    if(x<120||x>WORLD.w-120||y<120||y>WORLD.h-120)return true;
    // water area
    if(x>1310&&x<1810&&y>785&&y<1080)return true;
    return false;
  }

  function updatePlayer(dt){
    let dx=0,dy=0;
    if(keys.has('w')||keys.has('arrowup'))dy-=1;
    if(keys.has('s')||keys.has('arrowdown'))dy+=1;
    if(keys.has('a')||keys.has('arrowleft'))dx-=1;
    if(keys.has('d')||keys.has('arrowright'))dx+=1;
    if(dx||dy){
      const m=Math.hypot(dx,dy);dx/=m;dy/=m;
      player.dirX=dx;player.dirY=dy;cam.follow=true;
      const nx=player.x+dx*player.speed*dt,ny=player.y+dy*player.speed*dt;
      if(!isBlocked(nx,player.y))player.x=nx;
      if(!isBlocked(player.x,ny))player.y=ny;
      player.bob+=dt*10;
    }
    if(cam.follow){cam.x=lerp(cam.x,player.x,.07);cam.y=lerp(cam.y,player.y,.07)}
    updateNearby();
    document.getElementById('coordinate').textContent=`X ${Math.round(player.x)} · Y ${Math.round(player.y)}`
  }
  function buildNav(){const list=document.getElementById('navList');list.innerHTML='';zones.filter(z=>z.id!=='hub').forEach(z=>{const open=state.discovered.includes(z.id)||state.level>=z.level;const done=state.completed.includes(z.id);const item=document.createElement('button');item.className='nav-item'+(currentZone()?.id===z.id?' active':'');item.innerHTML=`<span>${z.name}</span><span>${done?'DONE':open?'OPEN':'LV '+z.level}</span>`;item.addEventListener('click',()=>focusZone(z.id));list.appendChild(item)})}
  function currentZone(){return zones.slice().sort((a,b)=>{const da=Math.abs(player.x-a.x)+Math.abs(player.y-a.y),db=Math.abs(player.x-b.x)+Math.abs(player.y-b.y);return da-db})[0]}

  function levelFromXp(xp){ return Math.max(1, Math.floor(xp / 100) + 1); }
  function updateUI(){
    state.level=levelFromXp(state.xp);
    const levelValue=document.getElementById('levelValue');
    const xpValue=document.getElementById('xpValue');
    const xpBar=document.getElementById('xpBar');
    const discoverCount=document.getElementById('discoverCount');
    const discoverBar=document.getElementById('discoverBar');
    const missionTitle=document.getElementById('missionTitle');
    const missionText=document.getElementById('missionText');
    const locationName=document.getElementById('locationName');
    const locationSub=document.getElementById('locationSub');
    const zoomLabel=document.getElementById('zoomLabel');
    if(levelValue) levelValue.textContent=String(state.level);
    if(xpValue) xpValue.textContent=String(state.xp);
    if(xpBar){ const pct=((state.xp%100)/100)*100; xpBar.style.width=`${pct}%`; }
    if(discoverCount) discoverCount.textContent=String(Math.min(state.discovered.filter(id=>id!=='hub').length,5));
    if(discoverBar) discoverBar.style.width=`${Math.min(100,(state.discovered.filter(id=>id!=='hub').length/5)*100)}%`;
    const mission=nextMission();
    if(missionTitle) missionTitle.textContent=mission.title;
    if(missionText) missionText.textContent=mission.text;
    const zone=currentZone();
    if(zone){
      if(locationName) locationName.textContent=zone.name;
      if(locationSub) locationSub.textContent=zone.sub;
    }
    if(zoomLabel) zoomLabel.textContent=`${Math.round(cam.zoom*100)}%`;
    buildNav();
    document.querySelectorAll('.skill').forEach(el=>{
      const skill=el.dataset.skill;
      const value=clamp(Number(state.skills?.[skill]||0),0,100);
      const label=el.querySelector('b');
      const bar=el.querySelector('.skill-bar span');
      if(label) label.textContent=`${value}%`;
      if(bar) bar.style.width=`${value}%`;
    });
  }

  function nextMission(){
    const order=['python','algo','ai','web','exam'];
    for(const id of order){const z=zones.find(v=>v.id===id);if(!state.discovered.includes(id))return {title:`Открыть ${z.name.replace(' DISTRICT','')}`,text:`Найди район и доберись до его входа.`};if(!state.completed.includes(id))return {title:z.mission,text:z.text}}
    if(!state.secret)return {title:'Найти неизвестный узел',text:'Исследуй дальний восточный сектор мира.'};
    return {title:'Исследовать INFO.WORLD',text:'Все основные зоны открыты. Создавай собственные проекты.'};
  }

  function focusZone(id){const z=zones.find(v=>v.id===id);if(!z)return;cam.follow=false;cam.x=z.x;cam.y=z.y;showToast(`${z.name} в фокусе`)}
  function openZone(z){
    if(state.level<z.level){showToast(`Требуется уровень ${z.level}`);return}
    state.discovered=[...new Set([...state.discovered,z.id])];if(z.id!=='hub'&&!state.visited.includes(z.id)){state.visited.push(z.id);state.xp+=10;showToast(`Зона открыта · +10 XP`)}save();updateUI();openModal(z);playTone(520,.07);
  }
  function openNpc(n){showToast(`${n.name}: ${n.line}`);if(!state.visited.includes(n.id)){state.visited.push(n.id);state.xp+=n.reward;showToast(`${n.name} наградил тебя · +${n.reward} XP`);save();updateUI()}playTone(640,.06)}
  function openSecret(){if(state.discovered.filter(x=>x!=='hub').length<3){showToast('Узел скрыт. Открой 3 района.');return}state.secret=true;state.xp+=50;save();updateUI();showToast('Секрет найден · +50 XP');playTone(800,.12)}

  function showModal(){document.getElementById('modalBackdrop').hidden=false}
  function openModal(z){
    modalZone=z;
    modalActionMode='zone';
    document.getElementById('modalTitle').textContent=z.name;
    document.getElementById('modalCode').textContent=`NODE ${String(z.level).padStart(2,'0')}`;
    document.getElementById('modalStatus').textContent=state.completed.includes(z.id)?'COMPLETED':state.discovered.includes(z.id)?'OPEN':'LOCKED';
    document.getElementById('modalDescription').textContent=z.description;
    document.getElementById('modalFocus').textContent=z.focus;
    document.getElementById('modalLevel').textContent=`Уровень ${z.level}+`;
    document.getElementById('modalMission').textContent=z.mission;
    document.getElementById('modalMissionText').textContent=z.text;
    const btn=document.getElementById('modalAction');
    btn.disabled=false;
    btn.textContent=state.completed.includes(z.id)?'Повторить':'Начать';
    showModal();
  }
  function closeModal(){document.getElementById('modalBackdrop').hidden=true;modalZone=null}
  document.getElementById('modalClose').addEventListener('click',closeModal);
  document.getElementById('modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')closeModal()});
  document.getElementById('modalAction').addEventListener('click',()=>{
    if(modalActionMode==='help'){closeModal();return;}
    if(!modalZone){closeModal();return;}
    if(!state.completed.includes(modalZone.id)){
      state.completed.push(modalZone.id);
      state.xp+=35;
      if(modalZone.skill&&state.skills[modalZone.skill]!=null)state.skills[modalZone.skill]=clamp(state.skills[modalZone.skill]+25,0,100);
      save();updateUI();showToast(`${modalZone.name} · миссия завершена · +35 XP`);playTone(780,.12);
    }else{showToast('Миссия уже завершена. Попробуй снова.')}
    closeModal();
  });

  function interact(){if(!nearby)return;if(nearby.id==='secret')return openSecret();if(['byte','ada','max'].includes(nearby.id))return openNpc(nearby);return openZone(nearby)}

  function playTone(freq,dur){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const ac=new AC();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=freq;o.type='sine';g.gain.value=.001;o.connect(g);g.connect(ac.destination);const now=ac.currentTime;g.gain.exponentialRampToValueAtTime(.05,now+.01);g.gain.exponentialRampToValueAtTime(.001,now+dur);o.start(now);o.stop(now+dur+.02)}catch{}}

  function pointerDown(e){
    if(e.pointerType==='touch'&&e.target.closest('.touch-pad'))return;
    cam.drag=true;cam.follow=false;cam.sx=e.clientX;cam.sy=e.clientY;cam.ox=cam.x;cam.oy=cam.y;
    pointerStartX=e.clientX;pointerStartY=e.clientY;pointerMoved=false;
    canvas.setPointerCapture?.(e.pointerId);
  }
  function pointerMove(e){
    if(!cam.drag)return;
    const totalMove=Math.hypot(e.clientX-pointerStartX,e.clientY-pointerStartY);
    if(totalMove>6)pointerMoved=true;
    const dx=(e.clientX-cam.sx)/cam.zoom,dy=(e.clientY-cam.sy)/cam.zoom;
    cam.x=clamp(cam.ox-dx,WORLD.w*.12,WORLD.w*.88);cam.y=clamp(cam.oy-dy,WORLD.h*.12,WORLD.h*.88);
  }
  function pickAtCanvas(clientX,clientY){
    const r=canvas.getBoundingClientRect();
    const p=screenToWorld(clientX-r.left,clientY-r.top);
    const candidates=[...zones.filter(z=>z.id!=='hub'),...npcs,{id:'secret',name:'UNKNOWN NODE',x:2080,y:520}];
    const npcHit=candidates.filter(o=>['byte','ada','max','secret'].includes(o.id)).sort((a,b)=>Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(p.x-b.x,p.y-b.y))[0];
    if(npcHit && Math.hypot(p.x-npcHit.x,p.y-npcHit.y)<55)return npcHit;
    const zoneHit=zones.filter(z=>z.id!=='hub').find(z=>Math.abs(p.x-z.x)<=z.w/2 && Math.abs(p.y-z.y)<=z.h/2);
    return zoneHit||null;
  }
  function pointerUp(e){
    if(!cam.drag)return;
    if(!pointerMoved){
      const hit=pickAtCanvas(e.clientX,e.clientY);
      if(hit){
        if(hit.id==='secret')openSecret();
        else if(['byte','ada','max'].includes(hit.id))openNpc(hit);
        else openZone(hit);
      }
    }
    cam.drag=false;
  }
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',()=>{cam.drag=false;pointerMoved=false});
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  canvas.addEventListener('wheel',e=>{e.preventDefault();cam.follow=false;const old=cam.zoom;cam.zoom=clamp(cam.zoom*(e.deltaY>0?.92:1.09),.55,1.5);if(old!==cam.zoom){updateUI();showToast(`Масштаб ${Math.round(cam.zoom*100)}%`)}},{passive:false});
  document.getElementById('zoomIn').addEventListener('click',()=>{cam.zoom=clamp(cam.zoom*1.1,.55,1.5);updateUI()});document.getElementById('zoomOut').addEventListener('click',()=>{cam.zoom=clamp(cam.zoom*.9,.55,1.5);updateUI()});document.getElementById('recenter').addEventListener('click',()=>{cam.follow=true;cam.x=player.x;cam.y=player.y;updateUI()});document.getElementById('brandBtn').addEventListener('click',()=>{cam.follow=true;cam.x=1200;cam.y=820;player.x=1185;player.y=920;updateUI();showToast('Возврат в INFO HUB')});document.getElementById('focusMission').addEventListener('click',()=>{const m=nextMission();const found=zones.find(z=>m.title.includes(z.name.replace(' DISTRICT','')))||zones.find(z=>!state.discovered.includes(z.id)&&z.id!=='hub');if(found)focusZone(found.id)});
  document.getElementById('helpBtn').addEventListener('click',()=>openHelp());document.getElementById('profileBtn').addEventListener('click',()=>showToast(`Уровень ${state.level} · ${state.xp} XP`));
  document.getElementById('mobileProgressBtn').addEventListener('click',()=>document.getElementById('rightPanel').classList.toggle('open'));document.getElementById('mobileMenuBtn').addEventListener('click',()=>{document.getElementById('leftPanel').style.display=document.getElementById('leftPanel').style.display==='flex'?'none':'flex';document.getElementById('leftPanel').style.position='absolute';document.getElementById('leftPanel').style.zIndex='22';document.getElementById('leftPanel').style.left='8px';document.getElementById('leftPanel').style.top='8px';document.getElementById('leftPanel').style.bottom='8px';document.getElementById('leftPanel').style.width='250px'});

  function openHelp(){
    modalZone=null;modalActionMode='help';
    document.getElementById('modalTitle').textContent='Как устроен INFO.WORLD';
    document.getElementById('modalCode').textContent='HELP 00';
    document.getElementById('modalStatus').textContent='ONLINE';
    document.getElementById('modalDescription').textContent='Это интерактивный мир, где обучение встроено в исследование. Иди по дорогам, подходи к зданиям и персонажам, нажимай E и открывай новые районы.';
    document.getElementById('modalFocus').textContent='Исследование';
    document.getElementById('modalLevel').textContent='Без ограничений';
    document.getElementById('modalMission').textContent='Начни с Python';
    document.getElementById('modalMissionText').textContent='Твоя первая цель — найти Python District. Каждое открытие и миссия дают XP и развивают навыки.';
    const btn=document.getElementById('modalAction');btn.disabled=false;btn.textContent='Понятно';
    showModal();
  }

  document.addEventListener('keydown',e=>{const code=e.code;if(code==='KeyE'){e.preventDefault();interact();return;}if(code==='Escape'){e.preventDefault();closeModal();return;}const movementCodes={KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',ArrowUp:'arrowup',ArrowDown:'arrowdown',ArrowLeft:'arrowleft',ArrowRight:'arrowright'};const key=movementCodes[code];if(key){e.preventDefault();keys.add(key);}});document.addEventListener('keyup',e=>{const movementCodes={KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',ArrowUp:'arrowup',ArrowDown:'arrowdown',ArrowLeft:'arrowleft',ArrowRight:'arrowright'};const key=movementCodes[e.code];if(key)keys.delete(key);});
  document.querySelectorAll('#touchPad [data-dir]').forEach(btn=>{const map={up:'w',down:'s',left:'a',right:'d'};const start=e=>{e.preventDefault();keys.add(map[btn.dataset.dir])};const end=e=>{e.preventDefault();keys.delete(map[btn.dataset.dir])};btn.addEventListener('pointerdown',start);btn.addEventListener('pointerup',end);btn.addEventListener('pointercancel',end);btn.addEventListener('pointerleave',end)});

  function loop(now){const dt=Math.min(.032,(now-last)/1000);last=now;updatePlayer(dt);drawBackground(now);drawGrid();drawWater();drawRoads();zones.forEach(z=>drawZone(z,now));drawProps(now);drawNpcs(now);drawSecret();drawPlayer(now);requestAnimationFrame(loop)}

  async function bootSequence(){let n=0;const timer=setInterval(()=>{n+=Math.floor(Math.random()*10)+5;if(n>=100){n=100;clearInterval(timer);setTimeout(()=>{boot.style.opacity='0';setTimeout(()=>{boot.remove();app.classList.add('ready');app.removeAttribute('aria-hidden')},380)},260)}bootProgress.style.width=n+'%';bootPercent.textContent=n+'%'},85)}

  resize();cam.x=player.x;cam.y=player.y;try{updateUI()}catch(err){console.error('INFO.WORLD UI init error',err)}bootSequence();requestAnimationFrame(loop);window.addEventListener('beforeunload',save);setInterval(save,4000);
})();
