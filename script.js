(()=>{'use strict';
const W=1536,H=1024,NS='http://www.w3.org/2000/svg';
const $=id=>document.getElementById(id);
const map=$('mapImage'),canvas=$('mapCanvas'),zonesRoot=$('zones'),defsRoot=$('zoneDefs'),lifeRoot=$('life'),ambientRoot=$('ambient'),tooltip=$('tooltip'),card=$('infoCard');
const info={icon:$('infoIcon'),kicker:$('infoKicker'),title:$('infoTitle'),text:$('infoText')};
let active=null, built=false;

/* Финальные интерактивные контуры 16 объектов.
   Контуры намеренно повторяют компактный силуэт каждого объекта и не включают дороги/соседние здания. */
const Z=[
['club','Клуб математиков','КРУЖОК','∑','#61b9ff','276,46 350,28 409,50 451,97 455,152 416,190 337,188 282,157 258,104','Математические кружки, олимпиадная подготовка и нестандартные задачи.'],
['magic','Волшебство естества','НАУЧНОЕ НАПРАВЛЕНИЕ','✦','#63d5bc','535,65 609,39 675,61 707,104 703,174 670,212 594,201 534,166 506,113','Эксперименты, естественные науки и исследовательские проекты.'],
['medicine','Медицинский кружок','КРУЖОК','✚','#ff7562','771,37 835,27 899,54 923,99 916,153 875,180 800,168 758,121','Практические занятия и исследования в медицинском и естественно-научном направлении.'],
['chess','Шахматы в школе','ИНТЕЛЛЕКТУАЛЬНЫЙ СПОРТ','♞','#f0bd5d','978,39 1057,34 1127,60 1155,99 1145,160 1085,192 1005,169 957,115','Логика, стратегия, концентрация и аналитическое мышление.'],
['ai','AI Courses','ТЕХНОЛОГИИ','AI','#a77cff','1190,49 1272,21 1371,42 1452,91 1465,155 1439,218 1364,248 1261,220 1178,151','Искусственный интеллект, данные и современные цифровые технологии.'],
['python','Python District','ПРОГРАММИРОВАНИЕ','⌘','#4ad1c2','169,199 238,188 317,207 373,246 384,307 350,378 273,394 187,365 139,310 142,247','Программирование, алгоритмы и практическая разработка цифровых проектов.'],
['school','Математическая школа №1','ГЛАВНОЕ ЗДАНИЕ','✦','#f0c567','653,235 728,213 833,208 925,228 976,271 974,385 935,432 848,447 751,439 673,411 637,352','Центральное пространство школы имени Х. И. Ибрагимова.'],
['robotics','Robotics Hub','ТЕХНОЛОГИИ','⚙','#4faaff','1223,370 1320,340 1424,367 1474,421 1472,503 1435,563 1355,590 1263,559 1211,499 1202,429','Инженерное пространство для робототехники, конструирования и технологий.'],
['exam','Exam Arena','ДОСТИЖЕНИЯ','★','#e84f9a','160,459 250,428 338,443 404,486 426,551 399,617 320,661 219,651 149,610 128,538','Подготовка к экзаменам и интеллектуальным соревнованиям.'],
['animation','Студия «Мульт-анимация»','ТВОРЧЕСТВО','◉','#d879ff','462,570 537,541 618,559 677,605 685,665 632,711 541,710 463,675 430,621','Создание анимации, визуальных историй и цифровых проектов.'],
['vocal','Вокал','ИСКУССТВО','♫','#ff67cf','728,641 800,612 881,625 938,675 945,729 891,778 804,772 735,738 704,683','Музыка, голос, слух и сценическое мастерство.'],
['english','English A–Z','ЯЗЫКИ','A','#4fa8ff','980,508 1051,477 1135,490 1193,548 1203,622 1153,692 1056,699 977,655 945,580','Изучение английского языка и развитие коммуникативных навыков.'],
['judo','Дзюдо','СПОРТ','◈','#5fbfff','83,720 157,690 224,711 266,758 261,822 220,869 147,870 81,835 53,778','Дисциплина, координация и физическая подготовка.'],
['dance','Танцы народов Кавказа','КУЛЬТУРА','♢','#ef63c8','398,774 478,740 565,747 641,793 653,855 605,919 503,946 414,911 360,854','Культурное наследие и традиции народного танца.'],
['basketball','Баскетбол','СПОРТ','◌','#f39a34','706,789 785,759 875,766 955,809 969,871 923,934 822,958 730,925 678,856','Командная игра, тренировки и развитие игровых навыков.'],
['volleyball','Волейбол','СПОРТ','◍','#58b8ff','1049,779 1131,745 1222,757 1308,804 1322,861 1272,930 1176,953 1080,920 1026,852','Командная спортивная секция и регулярные тренировки.']
].map(([id,name,k,icon,color,points,text])=>({id,name,k,icon,color,points,text}));

function svg(tag,a={}){const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(a))e.setAttribute(k,v);return e}
function centroid(points){const a=points.trim().split(/\s+/).map(v=>v.split(',').map(Number));return a.reduce((s,p)=>[s[0]+p[0]/a.length,s[1]+p[1]/a.length],[0,0])}
function polygon(points,cls){return svg('polygon',{points,class:cls})}

function addZone(z){
  const clipId='clip-'+z.id;
  const cp=svg('clipPath',{id:clipId,clipPathUnits:'userSpaceOnUse'});cp.append(polygon(z.points,''));defsRoot.append(cp);
  const g=svg('g',{class:'zone',tabindex:'0',role:'button','aria-label':z.name,style:`--c:${z.color};--clip:url(#${clipId})`});
  g.dataset.id=z.id;
  const cut=svg('image',{href:'school-map.png',x:'0',y:'0',width:W,height:H,preserveAspectRatio:'none',class:'zone-cut','clip-path':`url(#${clipId})`});
  g.append(polygon(z.points,'zone-shadow'),cut,polygon(z.points,'zone-hit'),polygon(z.points,'zone-outline'));
  g.addEventListener('pointerenter',e=>showTip(z,e));
  g.addEventListener('pointermove',moveTip);
  g.addEventListener('pointerleave',hideTip);
  g.addEventListener('click',()=>open(z,g));
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(z,g)}});
  zonesRoot.append(g);
}
function showTip(z,e){tooltip.textContent=z.name;tooltip.style.setProperty('--tc',z.color);tooltip.hidden=false;moveTip(e)}
function moveTip(e){if(tooltip.hidden)return;const pad=10,w=tooltip.offsetWidth||180,h=tooltip.offsetHeight||35;let x=e.clientX+15,y=e.clientY;if(x+w>innerWidth-pad)x=e.clientX-w-15;if(y-h/2<pad)y=pad+h/2;if(y+h/2>innerHeight-pad)y=innerHeight-pad-h/2;tooltip.style.left=x+'px';tooltip.style.top=y+'px'}
function hideTip(){tooltip.hidden=true}

function placeCard(z){
  const pad=12;
  if(innerWidth<=900){card.style.top='';card.style.left='';card.style.right='';card.style.bottom='12px';return}
  const [cx,cy]=centroid(z.points),r=canvas.getBoundingClientRect();
  const px=r.left+(cx/W)*r.width,py=r.top+(cy/H)*r.height,cw=card.offsetWidth,ch=card.offsetHeight;
  const rightSide=px<innerWidth*.5;
  let left=rightSide?Math.max(r.right+14,px+r.width*.16):Math.min(r.left-cw-14,px-r.width*.16-cw);
  if(left<pad||left+cw>innerWidth-pad)left=px<innerWidth*.5?Math.min(innerWidth-cw-pad,px+r.width*.10):Math.max(pad,px-r.width*.10-cw);
  let top=py-ch*.5;
  top=Math.max(pad,Math.min(top,innerHeight-ch-pad));
  left=Math.max(pad,Math.min(left,innerWidth-cw-pad));
  card.style.right='auto';card.style.bottom='auto';card.style.left=left+'px';card.style.top=top+'px';
}
function open(z,g){
  document.querySelectorAll('.zone.active').forEach(x=>x.classList.remove('active'));
  g.classList.add('active');active={z,g};
  info.icon.textContent=z.icon;info.kicker.textContent=z.k;info.title.textContent=z.name;info.text.textContent=z.text;
  card.style.setProperty('--accent',z.color);card.hidden=false;
  requestAnimationFrame(()=>{placeCard(z);card.classList.add('show')});hideTip();
}
function close(){card.classList.remove('show');document.querySelectorAll('.zone.active').forEach(x=>x.classList.remove('active'));active=null;setTimeout(()=>{if(!active)card.hidden=true},210)}

function path(d,i){ambientRoot.append(svg('path',{d,class:'route',style:`--d:${7+i*.9}s;--delay:${-i*.8}s`}))}
function light(x,y,c,d,delay){lifeRoot.append(svg('circle',{cx:x,cy:y,r:2.4,class:'window-light',style:`--c:${c};--d:${d}s;--delay:${delay}s`}))}
function ring(x,y,c,delay){lifeRoot.append(svg('circle',{cx:x,cy:y,r:18,class:'pulse',style:`--c:${c};--delay:${delay}s`}))}
function buildLife(){
  ['M764 438 L806 551 L1022 622','M764 438 L565 628 L497 820','M807 551 L835 749 L827 890','M807 551 L1105 570','M764 438 L1048 179','M764 438 L1302 473','M565 628 L306 579'].forEach(path);
  Z.forEach((z,i)=>{const pts=z.points.trim().split(/\s+/).map(s=>s.split(',').map(Number));const [cx,cy]=centroid(z.points);const a=pts[0],b=pts[Math.floor(pts.length/2)],c=pts[Math.floor(pts.length*.72)];
    light((cx+a[0])/2,(cy+a[1])/2,z.color,3.2+(i%4)*.55,-i*.27);
    light((cx+b[0])/2,(cy+b[1])/2,z.color,4.0+(i%5)*.38,-i*.21-.5);
    light((cx+c[0])/2,(cy+c[1])/2,z.color,4.7+(i%3)*.6,-i*.18-1);
    ring(cx,cy,z.color,-i*.3);
  });
}
function build(){if(built)return;built=true;Z.forEach(addZone);buildLife();window.__MAP_READY__=true}
function boot(){
  const loader=$('loader'),world=$('world'),loadText=$('loadText');
  const steps=['ЗАГРУЗКА КАРТЫ','РАЗМЕТКА 16 ОБЪЕКТОВ','ЗАПУСК ОСВЕЩЕНИЯ','ПРОСТРАНСТВО ГОТОВО'];let i=0;
  const timer=setInterval(()=>{loadText.textContent=steps[i++];if(i===steps.length){clearInterval(timer);setTimeout(()=>{loader.classList.add('is-out');world.hidden=false;setTimeout(()=>loader.remove(),600)},220)}},300);
}
$('closeInfo').addEventListener('click',close);
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
document.addEventListener('pointerdown',e=>{if(active&&!card.contains(e.target)&&!e.target.closest('.zone'))close()});
window.addEventListener('resize',()=>{if(active)placeCard(active.z)});
map.addEventListener('load',()=>{build();boot()},{once:true});
if(map.complete&&map.naturalWidth){build();boot()}
})();