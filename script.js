(() => {
"use strict";

const loader = document.getElementById("loader");
const loaderStatus = document.getElementById("loaderStatus");
const welcome = document.getElementById("welcome");
const mapScreen = document.getElementById("mapScreen");
const enterButton = document.getElementById("enterButton");
const map = document.getElementById("schoolMap");
const dialog = document.getElementById("zoneDialog");
const zoneTitle = document.getElementById("zoneTitle");
const zoneText = document.getElementById("zoneText");
const zoneKicker = document.getElementById("zoneKicker");
const dialogClose = document.getElementById("dialogClose");
const dialogAction = document.getElementById("dialogAction");
const caption = document.getElementById("mapCaption");

const zones = {
  school:["ГЛАВНОЕ ЗДАНИЕ","Математическая школа №1","Центр образовательного пространства школы. Отсюда начинается знакомство с направлениями, кружками, лабораториями и спортивными секциями."],
  club:["КРУЖОК","Клуб математиков","Пространство для математических кружков, олимпиадной подготовки и решения нестандартных задач."],
  magic:["НАПРАВЛЕНИЕ","Волшебство","Творческое пространство для исследовательских и образовательных проектов."],
  medicine:["КРУЖОК","Медицинский кружок","Знакомство с основами естественных наук и проектной деятельностью."],
  chess:["ИНТЕЛЛЕКТУАЛЬНЫЙ СПОРТ","Шахматы в школе","Тренировка логики, стратегии, концентрации и аналитического мышления."],
  ai:["ТЕХНОЛОГИИ","AI Course","Направление, посвящённое искусственному интеллекту, данным и современным цифровым технологиям."],
  python:["ПРОГРАММИРОВАНИЕ","Python District","Программирование, алгоритмическое мышление и практическая разработка."],
  exam:["ДОСТИЖЕНИЯ","Exam Arena","Подготовка к экзаменам, интеллектуальным соревнованиям и проверке знаний."],
  animation:["ТВОРЧЕСТВО","Студия «Мульт-анимация»","Создание анимации, визуальных историй и цифровых творческих проектов."],
  vocal:["ИСКУССТВО","Вокал","Развитие музыкальных способностей и сценического мастерства."],
  robotics:["ИНЖЕНЕРИЯ","Robotics Hub","Робототехника, конструирование, программирование устройств и инженерные проекты."],
  english:["ЯЗЫКИ","English A-Z","Изучение английского языка и развитие коммуникативных навыков."],
  judo:["СПОРТ","Дзюдо","Спортивная подготовка, дисциплина и развитие физических качеств."],
  dance:["КУЛЬТУРА","Танцы народов Кавказа","Знакомство с культурным наследием и традициями народного танца."],
  basketball:["СПОРТ","Баскетбол","Тренировки, командная работа и развитие игровых навыков."],
  volleyball:["СПОРТ","Волейбол","Командная спортивная секция и регулярные тренировки."]
};

function finishLoading() {
  loaderStatus.textContent = "КАРТА ГОТОВА";
  loader.classList.add("done");
  setTimeout(() => { welcome.hidden = false; }, 500);
}

if (map.complete && map.naturalWidth) finishLoading();
else {
  map.addEventListener("load", finishLoading, {once:true});
  map.addEventListener("error", () => {
    loaderStatus.textContent = "ОШИБКА ЗАГРУЗКИ КАРТЫ";
  }, {once:true});
}

enterButton.addEventListener("click", () => {
  welcome.hidden = true;
  mapScreen.hidden = false;
});

document.querySelectorAll(".hotspot").forEach(button => {
  button.addEventListener("click", () => {
    const [kicker,title,text] = zones[button.dataset.zone];
    zoneKicker.textContent = kicker;
    zoneTitle.textContent = title;
    zoneText.textContent = text;
    caption.textContent = title;
    if (!dialog.open) dialog.showModal();
  });
});

dialogClose.addEventListener("click", () => dialog.close());
dialogAction.addEventListener("click", () => dialog.close());

// Deliberately no keyboard controls, wheel zoom, touch zoom or camera drag.
// The map is fixed; only explicit mouse/touch clicks on zones are interactive.
})();