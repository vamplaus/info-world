(()=>{
"use strict";
const $=id=>document.getElementById(id);
const viewport=$("viewport"),camera=$("camera"),stage=document.querySelector(".map-stage"),player=$("player"),hint=$("nearHint");
const WORLD={w:1536,h:1024};
const zones={
 hub:{name:"INFO CORE",sub:"CENTRAL DISTRICT",symbol:"✦",level:1,x:768,y:604,skill:null,text:"Сердце системы. Здесь сходятся все маршруты обучения и начинается путь исследователя.",lesson:"INFO CORE\n\nВыбери направление, изучи район и возвращайся сюда, чтобы видеть рост всего мира."},
 python:{name:"PYTHON DISTRICT",sub:"CODE GARDEN",symbol:"⌘",level:1,x:307,y:399,skill:"Python",text:"Район гибкого кода и чистой логики. Здесь Python становится первым настоящим инструментом создания.",lesson:'print("Привет, мир!")\n\n01 → переменные\n02 → условия\n03 → циклы\n04 → функции'},
 algo:{name:"ALGORITHM CITY",sub:"CODE GARDEN",symbol:"◈",level:2,x:768,y:235,skill:"Алгоритмы",text:"Центр развития технологий и алгоритмического мышления. Здесь рождаются идеи, которые затем превращаются в системы.",lesson:"ЗАДАЧА → ДЕКОМПОЗИЦИЯ → АЛГОРИТМ → ПРОВЕРКА\n\nКаждая сложная задача начинается с правильного разбиения."},
 ai:{name:"AI LAB",sub:"GENIAL RESEARCH",symbol:"✺",level:3,x:1105,y:348,skill:"AI",text:"Лаборатория искусственного интеллекта. Здесь изучаются данные, модели и принципы, которые помогают системам распознавать закономерности.",lesson:"ДАННЫЕ → ПРИЗНАКИ → МОДЕЛЬ → ОЦЕНКА\n\nAI — не магия. Это управляемый процесс построения модели."},
 web:{name:"WEB LAB",sub:"CREATOR TOWERS",symbol:"◎",level:2,x:1210,y:695,skill:"Web",text:"Башни создателей. Здесь интерфейсы, сайты и цифровые миры становятся доступными другим людям.",lesson:"HTML → структура\nCSS → внешний вид\nJavaScript → поведение\n\nСобери идею в работающий продукт."},
 exam:{name:"EXAM ARENA",sub:"CHALLENGE ZONE",symbol:"♜",level:4,x:338,y:700,skill:"Экзамен",text:"Арена испытаний, где знания проверяются практикой и реальными задачами. Здесь важен не просмотр материала, а результат.",lesson:"01 — понять условие\n02 — выбрать стратегию\n03 — решить\n04 — проверить\n\nИспытание показывает реальный уровень."}
};

const state={
 x:768,y:650,zoom:1,camX:0,camY:0,drag:false,last:null,keys:new Set(),
 active:"hub",xp:0,discovered:[],near:null
};

function load(){
 try{
  const saved=JSON.parse(localStorage.getItem("info-world-caucasus-map")||"{}");
  if(saved && Array.isArray(saved.discovered)){
   state.xp=Number(saved.xp)||0; state.discovered=saved.discovered;
  }
 }catch(e){}
}
function save(){
 localStorage.setItem("info-world-caucasus-map",JSON.stringify({xp:state.xp,discovered:state.discovered}));
}
function unlocked(id){
 if(id==="hub"||id==="python") return true;
 if(id==="algo"||id==="web") return state.discovered.includes("python");
 if(id==="ai") return state.discovered.includes("algo");
 if(id==="exam") return state.discovered.includes("ai") && state.discovered.includes("web");
 return false;
}
function updateUI(){
 const level=1+Math.floor(state.xp/100);
 $("levelNum").textContent=level;
 $("xpNum").textContent=state.xp;
 $("xpBar").style.width=(state.xp%100)+"%";
 $("discoverCount").textContent=`${state.discovered.length} / 5`;
 const next=["python","algo","web","ai","exam"].find(id=>!state.discovered.includes(id)&&unlocked(id));
 $("missionTitle").textContent=next?`ОТКРЫТЬ ${zones[next].name}`:"МИР ИССЛЕДОВАН";
 $("missionText").textContent=next?"Подойди к локации и нажми E.":"Все основные районы открыты.";
 document.querySelectorAll(".zone-hotspot").forEach(b=>{
  const id=b.dataset.zone;
  b.classList.toggle("locked",!unlocked(id));
  b.classList.toggle("visited",state.discovered.includes(id));
 });
}
function transform(){
 camera.style.transform=`translate(calc(-50% + ${state.camX}px),calc(-50% + ${state.camY}px)) scale(${state.zoom})`;
 player.style.left=`${state.x}px`; player.style.top=`${state.y}px`;
 $("zoomLabel").textContent=Math.round(state.zoom*100)+"%";
}
function nearest(){
 let best=null,bestD=Infinity;
 for(const [id,z] of Object.entries(zones)){
  const d=Math.hypot(state.x-z.x,state.y-z.y);
  if(d<bestD){bestD=d;best=id;}
 }
 return {id:best,d:bestD};
}
function updateNear(){
 const n=nearest();
 if(n.d<78 && unlocked(n.id)){
  state.near=n.id;
  hint.classList.remove("hidden");
  hint.style.left=zones[n.id].x+"px";
  hint.style.top=(zones[n.id].y-72)+"px";
 }else{
  state.near=null;hint.classList.add("hidden");
 }
}
function focus(id,open=true){
 const z=zones[id];
 if(!unlocked(id)){toast("Этот район пока закрыт");return;}
 state.active=id;
 const targetScale=Math.max(.92,Math.min(1.28,state.zoom));
 state.camX=(WORLD.w/2-z.x)*targetScale;
 state.camY=(WORLD.h/2-z.y)*targetScale;
 transform();
 if(open) setTimeout(()=>openZone(id),320);
}
function openZone(id){
 if(!unlocked(id)){toast("Сначала открой предыдущий маршрут");return;}
 const z=zones[id]; state.active=id;
 $("modalEyebrow").textContent=z.sub;
 $("modalSymbol").textContent=z.symbol;
 $("modalTitle").textContent=z.name;
 $("modalText").textContent=z.text;
 $("modalLesson").textContent=z.lesson;
 const done=state.discovered.includes(id);
 $("completeBtn").textContent=id==="hub"?"Продолжить исследование":done?"Локация уже исследована":"Исследовать локацию";
 $("completeBtn").classList.toggle("done",done);
 $("modal").classList.remove("hidden");
}
function complete(){
 const id=state.active;
 if(id!=="hub"&&!state.discovered.includes(id)){
  state.discovered.push(id);state.xp+=25;save();
  toast(`ОТКРЫТИЕ: ${zones[id].name}  +25 XP`);
  updateUI();
 }else if(id!=="hub"){
  toast("Эта локация уже открыта");
 }
 $("modal").classList.add("hidden");
}
function toast(msg){
 const t=$("toast");t.textContent=msg;t.classList.add("show");
 clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove("show"),2600);
}
function clampCamera(){
 const maxX=450,maxY=320;
 state.camX=Math.max(-maxX,Math.min(maxX,state.camX));
 state.camY=Math.max(-maxY,Math.min(maxY,state.camY));
}
function loop(){
 let dx=0,dy=0;
 if(state.keys.has("KeyW")||state.keys.has("ArrowUp"))dy-=1;
 if(state.keys.has("KeyS")||state.keys.has("ArrowDown"))dy+=1;
 if(state.keys.has("KeyA")||state.keys.has("ArrowLeft"))dx-=1;
 if(state.keys.has("KeyD")||state.keys.has("ArrowRight"))dx+=1;
 if(dx||dy){
  const len=Math.hypot(dx,dy);
  const speed=2.7/state.zoom;
  state.x=Math.max(35,Math.min(WORLD.w-35,state.x+dx/len*speed));
  state.y=Math.max(35,Math.min(WORLD.h-35,state.y+dy/len*speed));
  updateNear();transform();
 }
 requestAnimationFrame(loop);
}

load();updateUI();transform();updateNear();loop();

document.addEventListener("keydown",e=>{
 const controls=["KeyW","KeyA","KeyS","KeyD","KeyE","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"];
 if(controls.includes(e.code))e.preventDefault();
 if(e.code==="KeyE"){if(state.near)openZone(state.near);return;}
 state.keys.add(e.code);
});
document.addEventListener("keyup",e=>state.keys.delete(e.code));

viewport.addEventListener("pointerdown",e=>{
 if(e.target.closest(".zone-hotspot"))return;
 state.drag=true;state.last={x:e.clientX,y:e.clientY};viewport.classList.add("dragging");
 if(viewport.setPointerCapture)viewport.setPointerCapture(e.pointerId);
});
viewport.addEventListener("pointermove",e=>{
 if(!state.drag)return;
 state.camX+=(e.clientX-state.last.x);
 state.camY+=(e.clientY-state.last.y);
 state.last={x:e.clientX,y:e.clientY};clampCamera();transform();
});
function endDrag(){state.drag=false;viewport.classList.remove("dragging")}
viewport.addEventListener("pointerup",endDrag);viewport.addEventListener("pointercancel",endDrag);
viewport.addEventListener("wheel",e=>{
 e.preventDefault();
 state.zoom=Math.max(.72,Math.min(1.65,state.zoom+(e.deltaY<0?.08:-.08)));
 transform();
},{passive:false});

document.querySelectorAll(".zone-hotspot").forEach(b=>b.addEventListener("click",e=>{
 e.stopPropagation();focus(b.dataset.zone,true);
}));
document.querySelectorAll(".legend-item").forEach(b=>b.addEventListener("click",()=>focus(b.dataset.zone,true)));

$("zoomIn").onclick=()=>{state.zoom=Math.min(1.65,state.zoom+.1);transform();}
$("zoomOut").onclick=()=>{state.zoom=Math.max(.72,state.zoom-.1);transform();}
$("centerBtn").onclick=$("homeBtn").onclick=()=>{
 state.camX=0;state.camY=0;state.zoom=1;transform();toast("КАРТА ВОЗВРАЩЕНА В ЦЕНТР");
};
$("helpBtn").onclick=()=>$("helpModal").classList.remove("hidden");
$("closeHelp").onclick=()=>$("helpModal").classList.add("hidden");
$("closeModal").onclick=()=>$("modal").classList.add("hidden");
$("completeBtn").onclick=complete;
$("resetBtn").onclick=()=>{
 if(confirm("Сбросить весь прогресс карты?")){
  localStorage.removeItem("info-world-caucasus-map");location.reload();
 }
};
})();