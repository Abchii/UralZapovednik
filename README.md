# Заповедники Урала — интерактивная карта

Это статический сайт (HTML/CSS/JS) с картой Leaflet и данными в GeoJSON.  
Можно разместить бесплатно на GitHub Pages.

## Как запустить локально
Просто откройте `index.html` в браузере.  
Если браузер блокирует `fetch()` из файла, запустите простой сервер:

### Вариант 1: Python
```bash
python -m http.server 8000
```
Открой: http://localhost:8000

### Вариант 2: VS Code
Установи расширение **Live Server** и нажми “Go Live”.

## Как заменить фотографии
Сейчас в папке `assets/images/` лежат **заглушки** (`*.jpg`).

Чтобы вставить свои фото:
1. Подготовь картинки (лучше `.jpg` или `.webp`) с такими же именами:
   - `taganay.jpg`
   - `visim.jpg`
   - `bashkiria_np.jpg`
   - `ilmen.jpg`
   - `yugyd_va.jpg`
   - `bazhov.jpg`
   - `zyuratkul.jpg`
   - `basegi.jpg`
   - `shulgan.jpg`
   - `denezhkin.jpg`
   - `vishersky.jpg`
   - `east_ural.jpg`
   - `south_ural.jpg`
   - `olenyi_ruchyi.jpg`
2. Замените файлы в `assets/images/` (просто перезапишите их).

Готово — сайт автоматически покажет новые фото.

## Как выложить на GitHub Pages
1. Создай репозиторий на GitHub (например `urals-reserves-map`).
2. Загрузите в него **все файлы** из этой папки.
3. В репозитории: **Settings → Pages**
   - Source: `Deploy from a branch`
   - Branch: `main` / folder: `/ (root)`
4. Подожди, пока появится ссылка на сайт.

## Где править данные
Файл: `reserves.geojson`  
Там можно менять описание, регион, координаты и т.п.
