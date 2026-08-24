# INFO.WORLD — release 2.1

Важно: файлы должны называться РОВНО:
- index.html
- style.css
- script.js

Не `index(1).html`, `style(1).css`, `script(1).js`.

Почему: `index.html` подключает именно `style.css` и `script.js`. Если загрузить файлы с `(1)` в имени, GitHub Pages продолжит использовать старые файлы или не найдёт CSS/JS.

В репозитории в корне должны находиться ровно эти файлы:
index.html
style.css
script.js
README.md

После загрузки проверь GitHub:
Settings -> Pages -> Deploy from a branch -> main -> /(root)

Проверка публикации:
Actions -> pages build and deployment.
После успешного deployment открой сайт с жёсткой перезагрузкой:
Ctrl+Shift+R

Версия в этой сборке: BUILD 2.1.
