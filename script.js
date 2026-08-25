(() => {
'use strict';

const $ = id => document.getElementById(id);
const loader=$('loader'), welcome=$('welcome'), world=$('world'), map=$('schoolMap');
const loaderBar=$('loaderBar'), loaderPercent=$('loaderPercent'), loaderStatus=$('loaderStatus');
const enterButton=$('enterButton'), autoEnter=$('autoEnter'), particles=$('ambientParticles');
const activityLayer=$('activityLayer'), flashLayer=$('flashLayer'), tooltip=$('tooltip');
const tooltipKicker=$('tooltipKicker'), tooltipTitle=$('tooltipTitle');
const dialog=$('zoneDialog'), dialogIcon=$('dialogIcon'), dialogKicker=$('dialogKicker'), dialogTitle=$('dialogTitle'), dialogText=$('dialogText');

const zones = {
 school:{icon:'✦',kicker:'ГЛАВНОЕ ПРОСТРАНСТВО',title:'Математическая школа №1 им. Х. И. Ибрагимова',text:'Сердце образовательного пространства школы. Отсюда расходятся маршруты к кружкам, секциям, лабораториям и творческим направлениям.'},
 club:{icon:'∑',kicker:'МАТЕМАТИКА',title:'Клуб математиков',text:'Пространство для решения нестандартных задач, олимпиадной подготовки и совместного математического поиска.'},
 magic:{icon:'⚗',kicker:'ЕСТЕСТВЕННЫЕ НАУКИ',title:'Волшебство естества',text:'Наблюдение, эксперимент и исследование окружающего мира через практические занятия.'},
 medicine:{icon:'✚',kicker:'ИССЛЕДОВАНИЕ',title:'Медицинский кружок',text:'Знакомство с основами медицины, биологии человека и исследовательской практикой.'},
 chess:{icon:'♞',kicker:'ИНТЕЛЛЕКТ',title:'Шахматы в школе',text:'Логика, стратегия, концентрация и культура интеллектуальной игры.'},
 ai:{icon:'◌',kicker:'ТЕХНОЛОГИИ',title:'AI Courses',text:'Современное направление, посвящённое искусственному интеллекту, нейросетям и грамотной работе с цифровыми технологиями.'},
 python:{icon:'⌘',kicker:'ПРОГРАММИРОВАНИЕ',title:'Python District',text:'Программирование на Python: от первых алгоритмов до практических проектов и вычислительных задач.'},
 exam:{icon:'★',kicker:'ДОСТИЖЕНИЯ',title:'Exam Arena',text:'Подготовка к экзаменам, интеллектуальным соревнованиям и системная проверка знаний.'},
 animation:{icon:'◉',kicker:'ТВОРЧЕСТВО',title:'Студия «Мульт-анимация»',text:'Создание анимации, визуальных историй и цифровых творческих проектов.'},
 vocal:{icon:'♫',kicker:'ИСКУССТВО',title:'Вокал',text:'Развитие музыкальных способностей, слуха, голоса и сценического мастерства.'},
 robotics:{icon:'⚙',kicker:'ИНЖЕНЕРИЯ',title:'Robotics Hub',text:'Робототехника, конструирование, механика и практическая работа с современными технологиями.'},
 english:{icon:'A',kicker:'ЯЗЫКИ',title:'English A-Z',text:'Изучение английского языка и развитие коммуникативных навыков.'},
 judo:{icon:'◈',kicker:'СПОРТ',title:'Дзюдо',text:'Спортивная подготовка, дисциплина, координация и развитие физических качеств.'},
 dance:{icon:'♢',kicker:'КУЛЬТУРА',title:'Танцы народов Кавказа',text:'Знакомство с культурным наследием, традицией и сценическим искусством народного танца.'},
 basketball:{icon:'◌',kicker:'СПОРТ',title:'Баскетбол',text:'Тренировки, командная работа и развитие игровых навыков.'},
 volleyball:{icon:'◍',kicker:'СПОРТ',title:'Волейбол',text:'Командная спортивная секция и регулярные тренировки.'}
};

let entered=false, timer=0;

const wait = ms => new Promise(r=>setTimeout(r,ms));
function setProgress(n,status){
  n=Math.max(0,Math.min(100,Math.round(n)));
  loaderBar.style.width=n+'%'; loaderPercent.textContent=n+'%';
  if(status) loaderStatus.textContent=status;
}
async function boot(){
  const steps=[[8,'ПРОВЕРКА СВЯЗИ'],[24,'ЗАГРУЗКА КАРТЫ'],[47,'ЗАПУСК ОСВЕЩЕНИЯ'],[70,'АКТИВАЦИЯ ЗДАНИЙ'],[88,'ПОДГОТОВКА ПРОСТРАНСТВА'],[100,'КАРТА ГОТОВА']];
  for(const [n,s] of steps){await wait(330+Math.random()*280);setProgress(n,s)}
  await wait(500); loader.classList.add('is-leaving');
  await wait(650); loader.hidden=true; welcome.hidden=false;
  timer=setTimeout(enterWorld,4200);
}
function enterWorld(){
  if(entered)return; entered=true; clearTimeout(timer);
  welcome.classList.add('is-leaving');
  setTimeout(()=>{
    welcome.hidden=true; world.hidden=false;
    requestAnimationFrame(()=>{
      world.classList.add('is-visible');
      createAmbient();
      createCityActivity();
      setTimeout(()=>world.classList.add('ready'),900);
    });
  },560);
}
function createAmbient(){
  if(particles.dataset.ready)return; particles.dataset.ready='1';
  const colors=['#ffd46f','#73cfff','#b483ff','#72dfae','#ff78c5'];
  for(let i=0;i<115;i++){
    const p=document.createElement('i');p.className='particle';
    p.style.left=(5+Math.random()*90)+'%';p.style.top=(8+Math.random()*86)+'%';
    p.style.setProperty('--c',colors[i%colors.length]);p.style.setProperty('--dur',(6+Math.random()*10)+'s');
    p.style.setProperty('--delay',(-Math.random()*14)+'s');p.style.setProperty('--dx',((Math.random()-.5)*70)+'px');
    particles.appendChild(p);
  }
}
function createCityActivity(){
  if(activityLayer.dataset.ready)return; activityLayer.dataset.ready='1';
  const clusters=[
    [50,35,26,'#ffd77c'],[17,36,20,'#3abfff'],[84,48,22,'#38a7ff'],
    [19,58,20,'#e9579c'],[37,59,18,'#c67cff'],[50,64,15,'#d768ff'],
    [67,60,20,'#59aaff'],[56,79,16,'#ee9d38'],[77,79,20,'#58b6ff'],
    [39,16,16,'#6ee2c1'],[53,15,15,'#f27658'],[84,16,20,'#9b78ff']
  ];
  clusters.forEach(([x,y,count,c],ci)=>{
    for(let i=0;i<count;i++){
      const e=document.createElement('i');e.className='activity';
      const a=Math.random()*Math.PI*2, r=Math.random()*(ci===0?8:5);
      e.style.setProperty('--x',(x+Math.cos(a)*r)+'%');e.style.setProperty('--y',(y+Math.sin(a)*r)+'%');
      e.style.setProperty('--s',(1+Math.random()*3.2)+'px');e.style.setProperty('--c',c);
      e.style.setProperty('--o',(0.3+Math.random()*0.65).toFixed(2));e.style.setProperty('--dur',(1.1+Math.random()*4.2)+'s');
      e.style.setProperty('--delay',(-Math.random()*5)+'s');activityLayer.appendChild(e);
    }
  });
  // road lights: sequential pulses create movement through the city
  for(let i=0;i<60;i++){
    const e=document.createElement('i');e.className='activity';
    const x=12+(i*7.7)%76, y=23+((i*13)%62);
    e.style.setProperty('--x',x+'%');e.style.setProperty('--y',y+'%');e.style.setProperty('--s',(1.2+(i%3))+'px');
    e.style.setProperty('--c',i%5===0?'#7ccfff':'#ffd67b');e.style.setProperty('--o','.65');
    e.style.setProperty('--dur',(2.4+(i%5)*.35)+'s');e.style.setProperty('--delay',(-i*.16)+'s');activityLayer.appendChild(e);
  }
}
function zoneCenter(button){
  const stage=$('mapStage').getBoundingClientRect(), r=button.getBoundingClientRect();
  return {x:((r.left+r.width/2-stage.left)/stage.width)*100,y:((r.top+r.height/2-stage.top)/stage.height)*100,w:(r.width/stage.width)*100,h:(r.height/stage.height)*100};
}
function flash(button,color){
  const q=zoneCenter(button), f=document.createElement('i');f.className='flash';
  f.style.setProperty('--x',q.x+'%');f.style.setProperty('--y',q.y+'%');f.style.setProperty('--w',q.w+'%');f.style.setProperty('--h',q.h+'%');f.style.setProperty('--c',color);
  flashLayer.appendChild(f);setTimeout(()=>f.remove(),750);
}
function openZone(id,button){
  const z=zones[id]; if(!z)return;
  document.querySelectorAll('.zone.active').forEach(b=>b.classList.remove('active'));
  button.classList.add('active','clicked');
  const color=getComputedStyle(button).getPropertyValue('--zone').trim()||'#e3b45c';
  flash(button,color);setTimeout(()=>button.classList.remove('clicked'),800);
  dialogIcon.textContent=z.icon;dialogKicker.textContent=z.kicker;dialogTitle.textContent=z.title;dialogText.textContent=z.text;
  setTimeout(()=>{if(!dialog.open)dialog.showModal()},180);
}
document.querySelectorAll('.zone').forEach(button=>{
  const z=zones[button.dataset.zone];
  button.addEventListener('pointerenter',()=>{
    if(!world.classList.contains('ready')||!z)return;
    const q=zoneCenter(button);tooltipKicker.textContent=z.kicker;tooltipTitle.textContent=z.title;
    tooltip.style.setProperty('--tip',getComputedStyle(button).getPropertyValue('--zone').trim());
    tooltip.style.left=Math.min(q.x+2,78)+'%';tooltip.style.top=Math.max(q.y-7,4)+'%';tooltip.style.display='block';
  });
  button.addEventListener('pointerleave',()=>tooltip.style.display='none');
  button.addEventListener('click',()=>{if(world.classList.contains('ready'))openZone(button.dataset.zone,button)});
});
enterButton.addEventListener('click',enterWorld);
$('dialogClose').addEventListener('click',()=>dialog.close());
$('dialogAction').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>document.querySelectorAll('.zone.active').forEach(b=>b.classList.remove('active')));
dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});

// The map is intentionally fixed: no WASD/arrows, drag, wheel zoom or pinch navigation.
window.addEventListener('keydown',e=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','W','a','A','s','S','d','D'].includes(e.key) && !dialog.open)e.preventDefault();
},{passive:false});
window.addEventListener('wheel',e=>{if(world.hidden===false)e.preventDefault()},{passive:false});
$('mapStage').addEventListener('dragstart',e=>e.preventDefault());
$('mapStage').addEventListener('contextmenu',e=>e.preventDefault());

if(map.complete&&map.naturalWidth) boot();
else {
  map.addEventListener('load',boot,{once:true});
  map.addEventListener('error',()=>{loaderStatus.textContent='НЕ УДАЛОСЬ ЗАГРУЗИТЬ КАРТУ'}, {once:true});
}
})();