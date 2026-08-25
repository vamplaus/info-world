(()=>{
"use strict";

const $ = id => document.getElementById(id);
const zones = {
  hub:{
    name:"INFO CORE", sub:"CENTRAL DISTRICT", symbol:"✦", level:1, skill:null,
    text:"Центральная точка мира: здесь соединяются все учебные направления и виден общий прогресс исследователя.",
    lesson:"ЕДИНСТВО → ЛОГИКА → СОЗДАНИЕ → ИССЛЕДОВАНИЕ\n\nНачни с Python, затем открывай алгоритмы, AI, Web и практические испытания."
  },
  python:{
    name:"PYTHON DISTRICT", sub:"CODE GARDEN", symbol:"⌘", level:1, skill:"Python",
    text:"Район первого кода. Здесь ученик учится превращать мысль в точную последовательность команд.",
    lesson:"01 — переменные\n02 — условия\n03 — циклы\n04 — функции\n\nПервый маршрут: от простой команды к программе."
  },
  algo:{
    name:"ALGORITHM CITY", sub:"THINKING DISTRICT", symbol:"◈", level:2, skill:"Алгоритмы",
    text:"Город алгоритмического мышления. Здесь задачи разбиваются на понятные шаги, а решения проверяются до результата.",
    lesson:"ЗАДАЧА → ДЕКОМПОЗИЦИЯ → АЛГОРИТМ → ПРОВЕРКА\n\nСильное решение начинается не с кода, а с правильного способа мышления."
  },
  ai:{
    name:"AI LAB", sub:"INTELLIGENCE LAB", symbol:"✺", level:3, skill:"AI",
    text:"Лаборатория искусственного интеллекта: данные, признаки, модели и проверка качества результата.",
    lesson:"ДАННЫЕ → ПРИЗНАКИ → МОДЕЛЬ → ОЦЕНКА\n\nAI изучается как инженерная система, а не как магия."
  },
  web:{
    name:"WEB LAB", sub:"CREATOR TOWERS", symbol:"◎", level:2, skill:"Web",
    text:"Мастерская цифровых миров. Здесь структура, визуальный язык и интерактивность превращаются в работающий сайт.",
    lesson:"HTML → структура\nCSS → визуальный слой\nJavaScript → взаимодействие\n\nИдея становится продуктом, которым может пользоваться другой человек."
  },
  exam:{
    name:"EXAM ARENA", sub:"CHALLENGE ZONE", symbol:"✧", level:4, skill:"Практика",
    text:"Финальная зона практики. Здесь проверяется не количество просмотренного материала, а способность самостоятельно решить задачу.",
    lesson:"01 — понять условие\n02 — выбрать стратегию\n03 — реализовать\n04 — проверить\n\nРезультат важнее подсказки."
  }
};

const state = {
  active:"hub",
  xp:0,
  discovered:[]
};

function load(){
  try{
    const saved = JSON.parse(localStorage.getItem("info-world-caucasus-map") || "{}");
    if(saved && Array.isArray(saved.discovered)){
      state.xp = Number(saved.xp) || 0;
      state.discovered = saved.discovered.filter(id=>zones[id] && id!=="hub");
    }
  }catch(_){}
}

function save(){
  try{
    localStorage.setItem("info-world-caucasus-map", JSON.stringify({
      xp:state.xp,
      discovered:state.discovered
    }));
  }catch(_){}
}

function unlocked(id){
  if(id==="hub" || id==="python") return true;
  if(id==="algo" || id==="web") return state.discovered.includes("python");
  if(id==="ai") return state.discovered.includes("algo");
  if(id==="exam") return state.discovered.includes("ai") && state.discovered.includes("web");
  return false;
}

function updateUI(){
  const level = 1 + Math.floor(state.xp / 100);
  $("levelNum").textContent = level;
  $("xpNum").textContent = state.xp;
  $("xpBar").style.width = `${state.xp % 100}%`;
  $("discoverCount").textContent = `${state.discovered.length} / 5`;

  const next = ["python","algo","web","ai","exam"]
    .find(id=>!state.discovered.includes(id) && unlocked(id));

  $("missionTitle").textContent = next ? `ОТКРЫТЬ ${zones[next].name}` : "МИР ИССЛЕДОВАН";
  $("missionText").textContent = next
    ? "Нажми на отмеченную локацию на карте."
    : "Все основные учебные районы исследованы.";

  document.querySelectorAll(".zone-hotspot").forEach(button=>{
    const id = button.dataset.zone;
    const isLocked = !unlocked(id);
    const visited = state.discovered.includes(id);
    button.classList.toggle("locked", isLocked);
    button.classList.toggle("visited", visited);
    button.setAttribute("aria-disabled", String(isLocked));
    button.title = isLocked
      ? "Район пока закрыт"
      : `${zones[id].name}: открыть описание`;
  });
}

function openZone(id){
  if(!unlocked(id)){
    toast("РАЙОН ПОКА ЗАКРЫТ");
    return;
  }

  state.active = id;
  const z = zones[id];
  $("modalEyebrow").textContent = z.sub;
  $("modalSymbol").textContent = z.symbol;
  $("modalTitle").textContent = z.name;
  $("modalText").textContent = z.text;
  $("modalLesson").textContent = z.lesson;

  const done = id !== "hub" && state.discovered.includes(id);
  const button = $("completeBtn");
  button.textContent = id==="hub"
    ? "Продолжить исследование"
    : done
      ? "Район уже исследован"
      : "Исследовать район";
  button.classList.toggle("done", done);
  button.disabled = done;

  $("modal").classList.remove("hidden");
  $("closeModal").focus();
}

function complete(){
  const id = state.active;
  if(id==="hub"){
    $("modal").classList.add("hidden");
    return;
  }
  if(state.discovered.includes(id)){
    $("modal").classList.add("hidden");
    return;
  }

  state.discovered.push(id);
  state.xp += 25;
  save();
  updateUI();
  $("modal").classList.add("hidden");
  toast(`ОТКРЫТ: ${zones[id].name}  ·  +25 XP`);
}

function toast(message){
  const element = $("toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(element._timer);
  element._timer = setTimeout(()=>element.classList.remove("show"), 2400);
}

function closeModal(id){
  $(id).classList.add("hidden");
}

load();
updateUI();

document.querySelectorAll(".zone-hotspot").forEach(button=>{
  button.addEventListener("click", event=>{
    event.stopPropagation();
    const id = button.dataset.zone;
    if(!unlocked(id)){
      toast("СНАЧАЛА ОТКРОЙ ПРЕДЫДУЩИЙ РАЙОН");
      return;
    }
    openZone(id);
  });
});

document.querySelectorAll(".legend-item").forEach(button=>{
  button.addEventListener("click", ()=>{
    const id = button.dataset.zone;
    if(unlocked(id)) openZone(id);
    else toast("ЭТА ВЕТКА ЕЩЁ НЕ ОТКРЫТА");
  });
});

$("homeBtn").addEventListener("click", ()=>{
  $("modal").classList.add("hidden");
  toast("ЦЕНТРАЛЬНАЯ КАРТА");
});

$("helpBtn").addEventListener("click", ()=>$("helpModal").classList.remove("hidden"));
$("closeHelp").addEventListener("click", ()=>closeModal("helpModal"));
$("closeModal").addEventListener("click", ()=>closeModal("modal"));
$("completeBtn").addEventListener("click", complete);

$("resetBtn").addEventListener("click", ()=>{
  if(confirm("Сбросить весь прогресс карты?")){
    localStorage.removeItem("info-world-caucasus-map");
    location.reload();
  }
});

["modal","helpModal"].forEach(id=>{
  $(id).addEventListener("click", event=>{
    if(event.target === $(id)) closeModal(id);
  });
});

/* В этой версии намеренно НЕТ keyboard handlers, WASD, стрелок, E,
   drag-камеры, wheel-zoom и программного масштабирования карты. */
})();