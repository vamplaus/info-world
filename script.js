(() => {
'use strict';
const $=id=>document.getElementById(id);
const loader=$('loader'),welcome=$('welcome'),world=$('world'),map=$('schoolMap'),zonesRoot=$('zones');
const loaderBar=$('loaderBar'),loaderPercent=$('loaderPercent'),loaderStatus=$('loaderStatus');
const enterButton=$('enterButton'),fireflies=$('fireflies'),hint=$('hint');
const dialog=$('zoneDialog'),dialogIcon=$('dialogIcon'),dialogKicker=$('dialogKicker'),dialogTitle=$('dialogTitle'),dialogText=$('dialogText');

const data=[
['school','✦','ГЛАВНОЕ ПРОСТРАНСТВО','Математическая школа №1 им. Х. И. Ибрагимова','Сердце образовательного пространства школы.'],
['club','∑','МАТЕМАТИКА','Клуб математиков','Олимпиадные задачи, логика и математическое исследование.'],
['magic','⚗','ЕСТЕСТВЕННЫЕ НАУКИ','Волшебство естества','Наблюдение, эксперимент и исследование окружающего мира.'],
['medicine','✚','ИССЛЕДОВАНИЕ','Медицинский кружок','Знакомство с медициной и биологией человека.'],
['chess','♞','ИНТЕЛЛЕКТ','Шахматы в школе','Стратегия, концентрация и культура интеллектуальной игры.'],
['ai','◌','ТЕХНОЛОГИИ','AI Courses','Искусственный интеллект и современные цифровые технологии.'],
['python','⌘','ПРОГРАММИРОВАНИЕ','Python District','Программирование, алгоритмы и практические проекты.'],
['exam','★','ДОСТИЖЕНИЯ','Exam Arena','Подготовка к экзаменам и интеллектуальным соревнованиям.'],
['animation','◉','ТВОРЧЕСТВО','Студия «Мульт-анимация»','Создание анимации и цифровых творческих проектов.'],
['vocal','♫','ИСКУССТВО','Вокал','Музыкальные занятия и развитие сценического мастерства.'],
['robotics','⚙','ИНЖЕНЕРИЯ','Robotics Hub','Робототехника, механика и конструирование.'],
['english','A','ЯЗЫКИ','English A-Z','Изучение английского языка и развитие речи.'],
['judo','◈','СПОРТ','Дзюдо','Спортивная подготовка, дисциплина и координация.'],
['dance','♢','КУЛЬТУРА','Танцы народов Кавказа','Традиция, культура и сценическое искусство.'],
['basketball','◌','СПОРТ','Баскетбол','Командная игра и развитие спортивных навыков.'],
['volleyball','◍','СПОРТ','Волейбол','Командная спортивная секция и тренировки.']
];
const zones=new Map(data.map(x=>[x[0],{icon:x[1],kicker:x[2],title:x[3],text:x[4]}]));
let entered=false,timer;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function progress(n,s){loaderBar.style.width=n+'%';loaderPercent.textContent=n+'%';loaderStatus.textContent=s}
async function boot(){
 const steps=[[7,'ПРОВЕРКА СВЯЗИ'],[19,'ЗАГРУЗКА КАРТЫ'],[37,'ЗАПУСК ГОРОДСКОГО СВЕТА'],[58,'АКТИВАЦИЯ ОКОН'],[78,'ПОДКЛЮЧЕНИЕ ИНТЕРАКТИВНЫХ ЗДАНИЙ'],[94,'ЗАПУСК ЖИВОГО МИРА'],[100,'ПРОСТРАНСТВО ГОТОВО']];
 for(const [n,s] of steps){await wait(250+Math.random()*210);progress(n,s)}
 await wait(450);loader.classList.add('is-leaving');await wait(650);loader.hidden=true;welcome.hidden=false;timer=setTimeout(enterWorld,3900);
}
function enterWorld(){if(entered)return;entered=true;clearTimeout(timer);welcome.classList.add('is-leaving');setTimeout(()=>{welcome.hidden=true;world.hidden=false;requestAnimationFrame(()=>{world.classList.add('is-visible');buildZones();createFireflies();setTimeout(()=>world.classList.add('ready'),550)})},520)}
function buildZones(){
 if(zonesRoot.dataset.ready)return;zonesRoot.dataset.ready='1';
 document.querySelectorAll('.zone').forEach(()=>{});
 data.forEach(([id])=>{
   const b=document.createElement('button');b.type='button';b.className='zone';b.dataset.zone=id;b.setAttribute('aria-label',zones.get(id).title);
   const windows=document.createElement('span');windows.className='windows';
   const count=id==='school'?42:18+Math.floor(Math.random()*14);
   for(let i=0;i<count;i++){
     const w=document.createElement('i');w.className='window';
     w.style.setProperty('--wx',(10+Math.random()*80)+'%');w.style.setProperty('--wy',(14+Math.random()*72)+'%');
     w.style.setProperty('--ws',(2+Math.random()*3.5)+'px');w.style.setProperty('--wh',(3+Math.random()*5)+'px');
     w.style.setProperty('--wo',(0.25+Math.random()*0.75).toFixed(2));w.style.setProperty('--wd',(1.2+Math.random()*4.6)+'s');w.style.setProperty('--wdelay',(-Math.random()*6)+'s');windows.appendChild(w);
   }
   b.append(windows,Object.assign(document.createElement('span'),{className:'roof'}),Object.assign(document.createElement('span'),{className:'scan'}));
   for(let i=0;i<3;i++)b.append(Object.assign(document.createElement('span'),{className:'beacon'}));
   b.append(Object.assign(document.createElement('span'),{className:'impact'}));
   b.addEventListener('pointerenter',()=>{hint.textContent='Активно: '+zones.get(id).title});
   b.addEventListener('pointerleave',()=>{hint.textContent='Каждое здание — интерактивная зона'});
   b.addEventListener('click',()=>activateZone(b,id));zonesRoot.appendChild(b);
 });
}
function activateZone(button,id){
 document.querySelectorAll('.zone.active').forEach(x=>x.classList.remove('active'));button.classList.add('active','clicked');setTimeout(()=>button.classList.remove('clicked'),900);
 const z=zones.get(id);dialogIcon.textContent=z.icon;dialogKicker.textContent=z.kicker;dialogTitle.textContent=z.title;dialogText.textContent=z.text;
 setTimeout(()=>{if(!dialog.open)dialog.showModal()},300);
}
function createFireflies(){
 if(fireflies.dataset.ready)return;fireflies.dataset.ready='1';const colors=['#ffd56e','#74cfff','#d17cff','#74e4b8','#ff8f6e'];
 for(let i=0;i<180;i++){const f=document.createElement('i');f.className='firefly';f.style.setProperty('--x',(3+Math.random()*94)+'%');f.style.setProperty('--y',(4+Math.random()*92)+'%');f.style.setProperty('--s',(1+Math.random()*2.6)+'px');f.style.setProperty('--c',colors[i%colors.length]);f.style.setProperty('--dur',(3.5+Math.random()*7)+'s');f.style.setProperty('--delay',(-Math.random()*9)+'s');f.style.setProperty('--dx',((Math.random()-.5)*42)+'px');f.style.setProperty('--dy',((Math.random()-.5)*30)+'px');fireflies.appendChild(f)}
}
enterButton.addEventListener('click',enterWorld);$('dialogClose').addEventListener('click',()=>dialog.close());$('dialogAction').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>document.querySelectorAll('.zone.active').forEach(x=>x.classList.remove('active')));
dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','W','a','A','s','S','d','D'].includes(e.key)&&!dialog.open)e.preventDefault()},{passive:false});
window.addEventListener('wheel',e=>{if(!world.hidden)e.preventDefault()},{passive:false});
window.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
window.addEventListener('gesturechange',e=>e.preventDefault(),{passive:false});
window.addEventListener('dragstart',e=>e.preventDefault());
if(map.complete&&map.naturalWidth)boot();else{map.addEventListener('load',boot,{once:true});map.addEventListener('error',()=>loaderStatus.textContent='НЕ УДАЛОСЬ ЗАГРУЗИТЬ КАРТУ',{once:true})}
})();
