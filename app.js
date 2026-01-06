// Заповедники Урала — интерактивная карта (Leaflet)
const map = L.map("map", { zoomControl: true }).setView([57.0, 60.0], 5);

// OSM тайлы (оставляйте атрибуцию)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const listEl = document.getElementById("list");
const searchEl = document.getElementById("search");
const typeFilterEl = document.getElementById("typeFilter");
const regionFilterEl = document.getElementById("regionFilter");

let allFeatures = [];
let markerById = new Map();

function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function popupHtml(p){
  const name = escapeHtml(p.name || "Без названия");
  const desc = escapeHtml(p.description || "");
  const type = escapeHtml(p.type || "");
  const region = escapeHtml(p.region || "");
  const img = p.image ? `<img src="${escapeHtml(p.image)}" alt="${name}">` : "";
  const vk = p.vk ? `<a href="${escapeHtml(p.vk)}" target="_blank" rel="noreferrer">Страница VK</a>` : "";
  return `
    <div class="popup">
      <h3>${name}</h3>
      <div class="meta">${type}${type && region ? " • " : ""}${region}</div>
      ${img}
      <div>${desc}</div>
      <div style="margin-top:10px">${vk}</div>
    </div>
  `;
}

function renderRegionOptions(features){
  const regions = Array.from(new Set(features.map(f => (f.properties.region || "").trim()).filter(Boolean)))
    .sort((a,b)=>a.localeCompare(b,"ru"));
  // сохранить текущее значение
  const cur = regionFilterEl.value;
  regionFilterEl.innerHTML = `<option value="">Все регионы</option>` + regions.map(r => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join("");
  if (regions.includes(cur)) regionFilterEl.value = cur;
}

function matchesFilters(p){
  const q = (searchEl.value || "").trim().toLowerCase();
  const t = (typeFilterEl.value || "").trim();
  const r = (regionFilterEl.value || "").trim();

  if (q && !(p.name || "").toLowerCase().includes(q)) return false;
  if (t && (p.type || "") !== t) return false;
  if (r && (p.region || "") !== r) return false;
  return true;
}

function renderList(){
  listEl.innerHTML = "";
  const filtered = allFeatures.filter(f => matchesFilters(f.properties));

  if (filtered.length === 0){
    listEl.innerHTML = `<div style="padding:10px; color:rgba(229,231,235,.75)">Ничего не найдено.</div>`;
    return;
  }

  for (const f of filtered){
    const p = f.properties;
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = p.id;

    card.innerHTML = `
      <img class="thumb" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}">
      <div class="card-body">
        <div class="badges">
          ${p.type ? `<span class="badge">${escapeHtml(p.type)}</span>` : ""}
          ${p.region ? `<span class="badge">${escapeHtml(p.region)}</span>` : ""}
        </div>
        <h3 class="name">${escapeHtml(p.name)}</h3>
        <p class="desc">${escapeHtml(p.description || "")}</p>
      </div>
    `;

    card.addEventListener("click", () => {
      const m = markerById.get(p.id);
      if (!m) return;
      map.setView(m.getLatLng(), Math.max(map.getZoom(), 8), { animate: true });
      m.openPopup();
    });

    listEl.appendChild(card);
  }
}

function updateMarkersVisibility(){
  for (const f of allFeatures){
    const p = f.properties;
    const m = markerById.get(p.id);
    if (!m) continue;
    const show = matchesFilters(p);
    if (show){
      if (!map.hasLayer(m)) m.addTo(map);
    } else {
      if (map.hasLayer(m)) map.removeLayer(m);
    }
  }
}

function onFiltersChanged(){
  renderList();
  updateMarkersVisibility();
}

searchEl.addEventListener("input", onFiltersChanged);
typeFilterEl.addEventListener("change", onFiltersChanged);
regionFilterEl.addEventListener("change", onFiltersChanged);

fetch("./reserves.geojson")
  .then(r => {
    if (!r.ok) throw new Error("Не удалось загрузить reserves.geojson");
    return r.json();
  })
  .then(data => {
    allFeatures = data.features || [];
    renderRegionOptions(allFeatures);

    const markers = [];
    for (const f of allFeatures){
      const p = f.properties || {};
      const coords = (f.geometry && f.geometry.coordinates) || [];
      const lng = coords[0], lat = coords[1];
      if (typeof lat !== "number" || typeof lng !== "number") continue;

      const marker = L.marker([lat, lng]);
      marker.bindPopup(popupHtml(p), { maxWidth: 320 });
      markerById.set(p.id, marker);
      marker.addTo(map);
      markers.push(marker);
    }

    // Масштаб под все маркеры
    const group = L.featureGroup(markers);
    if (markers.length) map.fitBounds(group.getBounds().pad(0.15));

    renderList();
  })
  .catch(err => {
    console.error(err);
    alert(err.message);
  });
