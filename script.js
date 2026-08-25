(() => {
  "use strict";

  const site = document.querySelector(".site");
  const welcome = document.getElementById("welcome");
  const enterButton = document.getElementById("enterButton");
  const map = document.getElementById("schoolMap");
  const loading = document.getElementById("loading");

  // The experience is intentionally static:
  // no movement controls, no camera, no user scaling, no keyboard gameplay.
  function enterSchool() {
    if (site.classList.contains("entered")) return;
    site.classList.add("entered");
    window.setTimeout(() => welcome.setAttribute("aria-hidden", "true"), 800);
  }

  enterButton.addEventListener("click", enterSchool);

  welcome.addEventListener("click", (event) => {
    if (event.target === welcome) enterSchool();
  });

  map.addEventListener("load", () => site.classList.add("ready"), { once: true });

  map.addEventListener("error", () => {
    loading.textContent = "Не удалось загрузить карту";
  }, { once: true });

  if (map.complete && map.naturalWidth > 0) {
    site.classList.add("ready");
  }

  document.addEventListener("dragstart", (event) => {
    if (event.target === map) event.preventDefault();
  });

  document.addEventListener("contextmenu", (event) => {
    if (event.target === map) event.preventDefault();
  });
})();