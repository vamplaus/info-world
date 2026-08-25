(() => {
'use strict';
const NS='http://www.w3.org/2000/svg';
const $=id=>document.getElementById(id);
const loader=$('loader'), welcome=$('welcome'), world=$('world'), map=$('mapImage');
const bar=$('progressBar'), val=$('progressValue'), status=$('progressStatus');
const svg=$('fxSvg'), hotspots=$('hotspots'), windowFx=$('windowFx'), pulseFx=$('pulseFx'), ambientFx=$('ambientFx');
const tooltip=$('tooltip'), card=$('infoCard'), close=$('infoClose');
const icon=$('infoIcon'), kicker=$('infoKicker'), title=$('infoTitle'), text=$('infoText');
const W=1536,H=1024;

// Контуры размечены вручную по финальной карте 1536×1024. Каждая зона покрывает здание, а не отдельную точку.
const zones=[
{id:'club',name:'Клуб математиков',k:'КРУЖОК',icon:'∑',color:'#61b9ff',shape:'poly',points:'235,50 415,34 497,135 486,250 342,275 220,190',info:'Пространство для математических кружков, олимпиадной подготовки и решения нестандартных задач.',cx:352,cy:145,r:92,card:[315,120]},
{id:'magic',name:'Волшебство естества',k:'НАУЧНОЕ НАПРАВЛЕНИЕ',icon:'✦',color:'#63d5bc',shape:'poly',points:'470,45 705,45 760,170 730,275 530,265 470,165',info:'Исследовательское пространство для естественных наук, экспериментов и учебных проектов.',cx:610,cy:145,r:96,card:[555,100]},
{id:'medicine',name:'Медицинский кружок',k:'КРУЖОК',icon:'✚',color:'#ff7562',shape:'poly',points:'735,30 920,35 960,145 900,245 760,215 705,130',info:'Знакомство с естественными науками, исследовательской работой и проектной деятельностью.',cx:830,cy:128,r:88,card:[860,85]},
{id:'chess',name:'Шахматы в школе',k:'ИНТЕЛЛЕКТУАЛЬНЫЙ СПОРТ',icon:'♞',color:'#f0bd5d',shape:'poly',points:'945,35 1135,38 1195,155 1125,245 965,225 915,125',info:'Тренировка логики, стратегии, концентрации и аналитического мышления.',cx:1050,cy:130,r:94,card:[1055,85]},
{id:'ai',name:'AI Courses',k:'ТЕХНОЛОГИИ',icon:'AI',color:'#a77cff',shape:'poly',points:'1150,25 1435,45 1510,175 1455,315 1215,290 1115,145',info:'Направление, посвящённое искусственному интеллекту, данным и современным цифровым технологиям.',cx:1320,cy:150,r:120,card:[1130,85]},
{id:'python',name:'Python District',k:'ПРОГРАММИРОВАНИЕ',icon:'⌘',color:'#4ad1c2',shape:'poly',points:'90,190 420,195 495,350 455,470 170,430 80,330',info:'Программирование, алгоритмическое мышление и практическая разработка цифровых проектов.',cx:280,cy:300,r:120,card:[250,300]},
{id:'school',name:'Математическая школа №1',k:'ГЛАВНОЕ ЗДАНИЕ',icon:'✦',color:'#f0c567',shape:'poly',points:'650,230 1000,225 1040,440 930,535 690,520 600,405',info:'Центральное пространство школы имени Х. И. Ибрагимова. Здесь объединяются учёба, кружки, технологии, творчество и спорт.',cx:815,cy:365,r:155,card:[840,350]},
{id:'robotics',name:'Robotics Hub',k:'ТЕХНОЛОГИИ',icon:'⚙',color:'#4faaff',shape:'poly',points:'1185,345 1485,360 1525,560 1390,665 1180,585 1130,445',info:'Инженерное пространство для робототехники, конструирования и практической работы с технологиями.',cx:1335,cy:480,r:130,card:[1160,470]},
{id:'exam',name:'Exam Arena',k:'ДОСТИЖЕНИЯ',icon:'★',color:'#e84f9a',shape:'poly',points:'95,440 430,450 510,620 430,735 130,685 60,565',info:'Подготовка к экзаменам, интеллектуальным соревнованиям и системной проверке знаний.',cx:280,cy:560,r:145,card:[250,530]},
{id:'animation',name:'Студия «Мульт-анимация»',k:'ТВОРЧЕСТВО',icon:'◉',color:'#d879ff',shape:'poly',points:'425,550 700,560 750,700 650,795 450,750 380,650',info:'Создание анимации, визуальных историй и цифровых творческих проектов.',cx:565,cy:655,r:105,card:[470,610]},
{id:'vocal',name:'Вокал',k:'ИСКУССТВО',icon:'♫',color:'#ff67cf',shape:'poly',points:'710,600 955,610 985,760 900,820 735,770 665,685',info:'Развитие музыкальных способностей, слуха, голоса и сценического мастерства.',cx:825,cy:700,r:88,card:[740,650]},
{id:'english',name:'English A–Z',k:'ЯЗЫКИ',icon:'A',color:'#4fa8ff',shape:'poly',points:'930,485 1190,475 1240,720 1120,815 930,750 875,610',info:'Изучение английского языка и развитие коммуникативных навыков.',cx:1060,cy:625,r:120,card:[970,560]},
{id:'judo',name:'Дзюдо',k:'СПОРТ',icon:'◈',color:'#5fbfff',shape:'poly',points:'25,690 275,680 350,850 290,965 75,925 15,800',info:'Спортивная подготовка, дисциплина, координация и развитие физических качеств.',cx:160,cy:805,r:100,card:[100,740]},
{id:'dance',name:'Танцы народов Кавказа',k:'КУЛЬТУРА',icon:'♢',color:'#ef63c8',shape:'poly',points:'360,735 650,745 720,945 580,1015 355,945 300,840',info:'Знакомство с культурным наследием и традициями народного танца.',cx:500,cy:865,r:120,card:[400,800]},
{id:'basketball',name:'Баскетбол',k:'СПОРТ',icon:'◌',color:'#f39a34',shape:'poly',points:'680,770 980,760 1060,940 930,1018 700,985 630,870',info:'Тренировки, командная работа и развитие игровых навыков.',cx:830,cy:880,r:112,card:[760,800]},
{id:'volleyball',name:'Волейбол',k:'СПОРТ',icon:'◍',color:'#58b8ff',shape:'poly',points:'1030,760 1330,760 1410,935 1275,1015 1050,980 975,870',info:'Командная спортивная секция и регулярные тренировки.',cx:1190,cy:875,r:115,card:[1110,800]}
];

function el(name,attrs={}){const n=document.createElementNS(NS,name);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);return n}
function shape(z,attrs={}){return z.shape==='poly'?el('polygon',{points:z.points,...attrs}):el('path',{d:z.d,...attrs})}
function addZone(z){
 const g=el('g',{class:'zone',id:'zone-'+z.id,style:`--zone-color:${z.color};--zone-fill:${z.color}`,tabindex:'0',role:'button','aria-label':z.name});
 const aura=el('circle',{class:'zone-aura',cx:z.cx,cy:z.cy,r:z.r*.8});
 const sig=el('circle',{class:'signal',cx:z.cx,cy:z.cy,r:z.r*.64});
 const hit=shape(z,{class:'zone-shape'});g.append(aura,sig,hit);hotspots.append(g);
 const enter=()=>{tooltip.hidden=false;tooltip.textContent=z.name;requestAnimationFrame(()=>placeTooltip(z))};
 const leave=()=>{tooltip.hidden=true};
 g.addEventListener('pointerenter',enter);g.addEventListener('pointerleave',leave);g.addEventListener('click',()=>openInfo(z,g));
 g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openInfo(z,g)}});
}
const frame=$('mapFrame');
let activeZone=null;

function framePoint(x,y){
 const r=frame.getBoundingClientRect();
 return {x:x/W*r.width,y:y/H*r.height};
}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function placeTooltip(z){
 const p=framePoint(z.cx,z.cy);
 const pad=10, w=tooltip.offsetWidth||180, h=tooltip.offsetHeight||30;
 tooltip.style.left=clamp(p.x+14,pad,frame.clientWidth-w-pad)+'px';
 tooltip.style.top=clamp(p.y-38,pad,frame.clientHeight-h-pad)+'px';
}
function placeCard(z){
 if(card.hidden)return;
 const p=framePoint(...z.card);
 const pad=12, cw=card.offsetWidth, ch=card.offsetHeight;
 card.style.left=clamp(p.x,pad,frame.clientWidth-cw-pad)+'px';
 card.style.top=clamp(p.y,pad,frame.clientHeight-ch-pad)+'px';
}
function openInfo(z,g){
 document.querySelectorAll('.zone.active').forEach(x=>x.classList.remove('active'));
 g.classList.add('active');
 activeZone=z;
 icon.textContent=z.icon;
 kicker.textContent=z.k;
 title.textContent=z.name;
 text.textContent=z.info;
 card.style.setProperty('--zone-color',z.color);
 tooltip.hidden=true;
 card.hidden=false;
 requestAnimationFrame(()=>placeCard(z));
 createClickPulse(z);
}
function closeInfo(){
 card.hidden=true;
 activeZone=null;
 document.querySelectorAll('.zone.active').forEach(x=>x.classList.remove('active'));
}

function createLife(){
 zones.forEach((z,zi)=>{
   // ring waves around buildings
   for(let i=0;i<2;i++){const c=el('circle',{class:'life-ring',cx:z.cx,cy:z.cy,r:z.r*(.35+i*.08),style:`--c:${z.color};--dur:${5.5+zi%5+i*1.7}s;--delay:${-(zi*.7+i*2)}s`});pulseFx.append(c)}
   // random-looking window lights, clipped conceptually to the building's rough bounds via radius distribution
   const count=z.id==='school'?36:18;
   for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2, rr=Math.sqrt(Math.random())*z.r*.58;const x=z.cx+Math.cos(a)*rr*1.15,y=z.cy+Math.sin(a)*rr*.55;const w=3+Math.random()*4,h=3+Math.random()*5;const r=el('rect',{class:'window-dot',x:x-w/2,y:y-h/2,width:w,height:h,rx:1,style:`--c:${z.color};--dur:${1.7+Math.random()*5}s;--delay:${-Math.random()*7}s`});windowFx.append(r)}
   // No central marker: the building itself is the interactive object.
 });
 // road energy paths: approximate main routes between districts
 const paths=['M815 445 L815 560 L1060 625','M815 445 L565 655 L500 865','M815 445 L830 700 L830 880','M815 445 L280 560 L160 805','M815 445 L1050 130','M815 445 L1335 480','M815 445 L610 145'];
 paths.forEach((d,i)=>ambientFx.append(el('path',{d,class:'route',style:`--dur:${8+i*1.7}s;--delay:${-i*2.4}s`})));
}
function createClickPulse(z){for(let i=0;i<3;i++){const c=el('circle',{class:'life-ring',cx:z.cx,cy:z.cy,r:z.r*.25+i*8,style:`--c:${z.color};--dur:${1.2+i*.18}s;--delay:${i*.12}s`});pulseFx.append(c);setTimeout(()=>c.remove(),1800)}}
function makeDust(){const d=$('dust');for(let i=0;i<72;i++){const s=document.createElement('i');s.style.cssText=`position:absolute;left:${Math.random()*100}%;top:${30+Math.random()*70}%;width:${1+Math.random()*3}px;height:${1+Math.random()*3}px;border-radius:50%;background:${['#fff0a3','#77d7ff','#d9a0ff','#ff8ac6'][i%4]};box-shadow:0 0 ${5+Math.random()*12}px currentColor;opacity:${.2+Math.random()*.55};animation:floatDust ${5+Math.random()*9}s linear ${-Math.random()*10}s infinite;`;d.append(s)}const st=document.createElement('style');st.textContent='@keyframes floatDust{0%{transform:translate3d(0,15px,0);opacity:0}15%{opacity:.7}85%{opacity:.35}100%{transform:translate3d(var(--dx,18px),-120px,0);opacity:0}}';document.head.append(st);d.querySelectorAll('i').forEach(x=>x.style.setProperty('--dx',`${(Math.random()-.5)*70}px`))}
function progress(n,s){bar.style.width=n+'%';val.textContent=n+'%';status.textContent=s}
function preload(){return new Promise((res,rej)=>{if(map.complete)return map.naturalWidth?res():rej();map.addEventListener('load',res,{once:true});map.addEventListener('error',rej,{once:true})})}
async function boot(){
 const steps=[[8,'ПОДГОТОВКА ПРОСТРАНСТВА'],[24,'ЗАГРУЗКА КАРТЫ'],[43,'РАЗМЕТКА 16 ЗДАНИЙ'],[61,'ПОДКЛЮЧЕНИЕ ИНТЕРАКТИВНЫХ КОНТУРОВ'],[79,'ВКЛЮЧЕНИЕ ОСВЕЩЕНИЯ'],[93,'ЗАПУСК ЖИВОГО ГОРОДА']];
 const ready=preload();for(const [n,s]of steps){progress(n,s);await new Promise(r=>setTimeout(r,300))}await ready;progress(100,'ПРОСТРАНСТВО ГОТОВО');await new Promise(r=>setTimeout(r,450));loader.classList.add('is-out');await new Promise(r=>setTimeout(r,700));loader.hidden=true;welcome.hidden=false;await new Promise(r=>setTimeout(r,2400));welcome.classList.add('is-out');await new Promise(r=>setTimeout(r,700));welcome.hidden=true;world.hidden=false;world.classList.add('entering');setTimeout(()=>world.classList.remove('entering'),2600);
}
// No keyboard movement, no map dragging, no map zoom. Wheel is neutralized only over the map stage.
$('mapFrame').addEventListener('wheel',e=>e.preventDefault(),{passive:false});
$('mapFrame').addEventListener('dragstart',e=>e.preventDefault());
close.addEventListener('click',closeInfo);document.addEventListener('pointerdown',e=>{if(!card.hidden&&!card.contains(e.target)&&!e.target.closest('.zone'))closeInfo()});
window.addEventListener('resize',()=>{if(!card.hidden&&activeZone)requestAnimationFrame(()=>placeCard(activeZone));document.querySelectorAll('.zone').forEach(()=>{});});
zones.forEach(addZone);createLife();makeDust();boot();
})();
