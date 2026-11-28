"use strict";

const levelCopy = {
  fr: ["Grands quartiers", "Sous-quartiers", "Territoires", "Westpoort · sans grand quartier municipal",
    "Territoire de votre commerce", "Hors zone standard", "Aucun sous-quartier éligible à la sélection groupée",
    "Point de test fictif près de la limite Helmersbuurt–Overtoomse Sluis.", "Réessayer"],
  nl: ["Gebieden", "Wijken", "Gebieden en wijken", "Westpoort · zonder gemeentelijk gebied",
    "Gebied van je winkel", "Buiten het standaardgebied", "Geen wijken beschikbaar voor groepsselectie",
    "Fictief testpunt bij de grens Helmersbuurt–Overtoomse Sluis.", "Opnieuw proberen"],
  en: ["Areas", "Neighborhoods", "Territories", "Westpoort · no municipal area",
    "Your shop’s territory", "Outside the standard area", "No neighborhoods available for bulk selection",
    "Fictional test point near the Helmersbuurt–Overtoomse Sluis boundary.", "Try again"]
};
const levelKeys = ["areas", "wijken", "list", "unassigned", "origin", "outside", "noBulk", "fixture", "retry"];
const $ = id => document.getElementById(id);
const url = new URL(location.href);
const lang = $("lang");
lang.value = Object.hasOwn(copy, url.searchParams.get("lang")) ? url.searchParams.get("lang") : "nl";
const fixture = url.searchParams.get("fixture") === "border";
const profile = "amsterdam-levels";
const scope = sponsorDraftScope(profile) + (fixture ? ":border" : "");
const draft = readSponsorDraft(scope);
const requests = new Map(Array.isArray(draft.requests) ? draft.requests : []);
const frame = $("map-frame");
const dialog = $("extension-dialog");
const order = ["home", "direct", "second", "other"];
let level = draft.level === "wijken" ? "wijken" : "areas";
let collections, model, center, map, pin, layer, labels, active;
let controls = [];

const words = () => ({...copy[lang.value], ...Object.fromEntries(levelKeys.map((key, i) => [key, levelCopy[lang.value][i]]))});
const save = () => writeSponsorDraft({selected: [...model.selected], requests: [...requests], level}, scope);

function translate() {
  const text = words();
  document.documentElement.lang = lang.value;
  for (const node of document.querySelectorAll("[data-t]")) node.textContent = text[node.dataset.t];
  $("fixture-note").hidden = !fixture;
  $("zoom-in").ariaLabel = text.zoomIn;
  $("zoom-out").ariaLabel = text.zoomOut;
  $("fullscreen").textContent = frame.classList.contains("is-expanded") ? text.exit : text.fullscreen;
  $("fullscreen").ariaLabel = $("fullscreen").textContent;
  $("recenter").ariaLabel = text.recenter;
  $("areas").ariaPressed = String(level === "areas");
  $("wijken").ariaPressed = String(level === "wijken");
}

function updateControls() {
  for (const {button, mode, id, icon} of controls) {
    const state = model.levelState(mode, id);
    button.setAttribute("aria-checked", state);
    button.dataset.selected = state;
    if (icon) icon.textContent = state === "mixed" ? "−" : state === "true" ? "✓" : "";
  }
  if (dialog.open) {
    $("gray-selection").ariaChecked = model.levelState(active.mode, active.id);
    $("gray-selection").disabled = !model.canToggle(active.mode, active.id);
  }
}

function toggle(mode, id) {
  model.toggle(mode, id);
  save();
  updateControls();
}

function choose(mode, feature) {
  const {id, properties} = feature;
  if (mode === "wijken" && properties.band === "home") return;
  if (properties.band !== "other" && model.canToggle(mode, id)) {
    toggle(mode, id);
    return;
  }
  if (properties.band !== "other") return;
  active = {mode, id};
  $("district-name").textContent = properties.buurtnaam;
  $("reason").value = requests.get(id) || "";
  $("extension-form").hidden = true;
  $("extend").hidden = false;
  dialog.showModal();
  updateControls();
}

function makeControl(mode, feature, inMap) {
  const {id, properties: {band, buurtnaam}} = feature;
  const isHome = mode === "wijken" && band === "home";
  const control = document.createElement(isHome ? "span" : "button");
  if (inMap && band === "home") control.classList.add("home-district-label");
  const name = document.createElement("span");
  name.textContent = buurtnaam;
  if (isHome) control.append(name);
  else {
    control.type = "button";
    control.setAttribute("role", "checkbox");
    control.setAttribute("aria-label", buurtnaam);
    if (band === "other") control.setAttribute("aria-haspopup", "dialog");
    control.onclick = () => choose(mode, feature);
    if (mode === "areas" && band !== "other" && !model.canToggle(mode, id)) control.disabled = true;
  }
  let icon;
  if (inMap) {
    if (!isHome) control.append(name);
    control.style.pointerEvents = "auto";
    L.DomEvent.disableClickPropagation(control);
  } else {
    control.classList.add("zone-row");
    control.dataset.band = band;
    const swatch = document.createElement("span");
    swatch.className = "zone-swatch";
    swatch.ariaHidden = "true";
    if (!isHome) {
      icon = document.createElement("span");
      icon.className = "zone-check";
      icon.ariaHidden = "true";
    }
    const caption = band === "other" ? words().outside : isHome ? words().origin :
      control.disabled ? words().noBulk : "";
    if (caption) {
      const status = document.createElement("small");
      status.className = "zone-status";
      status.textContent = caption;
      name.append(status);
    }
    control.append(swatch, ...(icon ? [icon] : []), name);
  }
  if (!isHome) controls.push({button: control, mode, id, icon});
  return control;
}

function renderList() {
  const list = $("district-list");
  list.replaceChildren();
  const sorted = features => [...features].sort((a, b) =>
    order.indexOf(a.properties.band) - order.indexOf(b.properties.band) ||
    a.properties.distance - b.properties.distance);
  const areas = sorted(collections.areas.features);
  if (level === "areas") {
    for (const area of areas) list.append(makeControl(level, area, false));
    return;
  }
  for (const area of [...areas, null]) {
    const group = document.createElement("details");
    const title = document.createElement("summary");
    title.textContent = area?.properties.buurtnaam || words().unassigned;
    group.open = area?.properties.band === "home";
    group.append(title);
    const members = model.members(area?.id || null).map(id => collections.wijkById.get(id));
    for (const member of sorted(members)) group.append(makeControl(level, member, false));
    if (members.length) list.append(group);
  }
}

function placeLabels() {
  if (!labels) return;
  const view = map.getContainer().getBoundingClientRect();
  const occupied = [pin.getElement().getBoundingClientRect(), frame.querySelector(".map-tools").getBoundingClientRect()];
  const overlaps = (a, b) => a.left < b.right + 3 && a.right > b.left - 3 &&
    a.top < b.bottom + 3 && a.bottom > b.top - 3;
  for (const {marker, text, outline} of labels) {
    const element = marker.getElement();
    element.hidden = false;
    text.style.translate = "";
    text.classList.remove("is-displaced");
    const path = outline.getElement();
    const matrix = path.getScreenCTM();
    if (!matrix) {
      element.hidden = true;
      continue;
    }
    const inverse = matrix.inverse();
    const first = text.getBoundingClientRect();
    const offsets = [[0, 0], [0, -18], [0, 18], [-24, 0], [24, 0], [-18, -18], [18, 18]];
    const isHome = text.classList.contains("home-district-label");
    const outlineBox = path.getBoundingClientRect();
    const homeVisible = isHome && outlineBox.width > 0 && outlineBox.height > 0 && overlaps(outlineBox, view);
    if (homeVisible) {
      for (const distance of [30, 45, 60, 75]) {
        offsets.push([0, -distance], [0, distance], [-distance, 0], [distance, 0],
          [-distance, -distance], [distance, distance]);
      }
    }
    const place = (rect, requirePolygon) => {
      if (rect.left < view.left || rect.top < view.top || rect.right > view.right ||
          rect.bottom > view.bottom - 20 || occupied.some(other => overlaps(rect, other))) return false;
      if (requirePolygon && ![rect.left, rect.right].every(px => [rect.top, rect.bottom].every(py =>
        path.isPointInFill(new DOMPoint(px, py).matrixTransform(inverse))))) return false;
      occupied.push(rect);
      return true;
    };
    let found = offsets.find(([x, y]) => place({
      left: first.left + x, top: first.top + y, right: first.right + x, bottom: first.bottom + y
    }, true));
    if (!found && homeVisible) {
      text.classList.add("is-displaced");
      const box = text.getBoundingClientRect();
      const left = view.left + 8;
      for (const top of [view.top + 8, view.bottom - box.height - 24]) {
        if (place({left, top, right: left + box.width, bottom: top + box.height}, false)) {
          found = [left - box.left, top - box.top];
          break;
        }
      }
    }
    element.hidden = !found;
    if (found) text.style.translate = found[0] + "px " + found[1] + "px";
  }
}

function draw() {
  layer?.remove();
  controls = [];
  labels = [];
  const fill = Object.fromEntries([...document.querySelectorAll(".campaign-legend [data-band]")].map(
    item => [item.dataset.band, getComputedStyle(item).getPropertyValue("--band").trim()]));
  const features = [...collections[level].features].sort((a, b) =>
    order.indexOf(a.properties.band) - order.indexOf(b.properties.band));
  layer = L.layerGroup().addTo(map);
  L.geoJSON(features, {smoothFactor: 0, style: f => ({
    className: "territory-outline", color: "white", weight: 2, fillOpacity: 1, fillColor: fill[f.properties.band]
  }), onEachFeature: (feature, outline) => {
    outline.on("click", () => choose(level, feature));
    const text = makeControl(level, feature, true);
    const marker = L.marker(feature.properties.label, {
      icon: L.divIcon({className: "district-marker", html: text, iconSize: [0, 0]}),
      keyboard: false, pane: "tooltipPane", interactive: false
    }).addTo(layer);
    labels.push({marker, text, outline});
  }}).addTo(layer);
  renderList();
  updateControls();
  translate();
  placeLabels();
}

function recenter() {
  map.setView(center, map.getSize().x < 550 ? 12.75 : 13.25, {animate: false});
}

function toggleFullscreen() {
  const expanded = frame.classList.toggle("is-expanded");
  document.body.classList.toggle("map-expanded", expanded);
  $("fullscreen").ariaPressed = String(expanded);
  map.invalidateSize();
  translate();
}

async function start() {
  const fetchLevel = async key => {
    const response = await fetch("data/amsterdam-levels-" + key + ".geojson");
    if (!response.ok) throw new Error("geometry");
    return response.json();
  };
  const [areas, wijken] = await Promise.all(["areas", "wijken"].map(fetchLevel));
  center = fixture ? wijken.borderFixture : reviewProfiles.dolores.center;
  for (const data of [areas, wijken]) {
    const result = classifySponsorTerritory(center, data.features, data.neighbors);
    for (const feature of data.features) {
      feature.properties.band = result.bands[feature.id];
      feature.properties.distance = feature.id === result.home ? 0 : distanceToTerritory(center, feature.geometry);
    }
  }
  const wijkById = new Map(wijken.features.map(feature => [feature.id, feature]));
  collections = {areas, wijken, wijkById};
  model = createLevelSelection(wijken.features, Object.fromEntries(wijken.features.map(f => [f.id, f.properties.band])),
    Array.isArray(draft.selected) ? draft.selected : []);
  map = L.map("campaign-map", {zoomControl: false, minZoom: 10, maxZoom: 19, zoomSnap: .25});
  recenter();
  const shopIcon = '<svg viewBox="0 0 28 36" aria-hidden="true"><path fill="#126c39" stroke="white" stroke-width="2" d="M14 34C10 29 1 19 1 14a13 13 0 0 1 26 0c0 5-9 15-13 20Z"/><path stroke="white" fill="none" stroke-width="1.5" d="M8 13h12v8H8z M7 13l2-5h10l2 5m-9 8v-5h4v5"/></svg>';
  pin = L.marker(center, {interactive: false, keyboard: false,
    title: fixture ? words().fixture : reviewProfiles.dolores.name,
    icon: L.divIcon({className: "shop-pin", html: shopIcon, iconSize: [28, 36], iconAnchor: [14, 34]})
  }).addTo(map);
  map.attributionControl.addAttribution('<a href="https://maps.amsterdam.nl/gebiedsindeling/">Gemeente Amsterdam</a> · CC0 1.0');
  draw();
  document.fonts.ready.then(placeLabels);
  map.on("moveend zoomend resize", placeLabels);
  new ResizeObserver(() => map.invalidateSize()).observe(map.getContainer());
  $("map-status").textContent = "";
  $("continue").disabled = false;
  $("zoom-in").onclick = () => map.zoomIn();
  $("zoom-out").onclick = () => map.zoomOut();
  $("recenter").onclick = recenter;
  $("fullscreen").onclick = toggleFullscreen;
  for (const mode of ["areas", "wijken"]) $(mode).onclick = () => {
    if (level === mode) return;
    level = mode;
    save();
    draw();
  };
}

$("menu").onclick = () => $("campaign-menu").showModal();
lang.onchange = () => {
  url.searchParams.set("lang", lang.value);
  history.replaceState(null, "", url);
  if (map) draw();
  else translate();
};
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !dialog.open && frame.classList.contains("is-expanded")) toggleFullscreen();
});
$("gray-selection").onclick = () => toggle(active.mode, active.id);
$("extend").onclick = () => {
  $("extension-form").hidden = false;
  $("extend").hidden = true;
  $("reason").focus();
};
$("extension-form").onsubmit = event => {
  event.preventDefault();
  const reason = $("reason").value.trim();
  if (!reason) return;
  requests.set(active.id, reason);
  $("message").textContent = save() ? words().saved : words().storageError;
  dialog.close();
};
$("continue").onclick = () => {
  if (!save()) {
    $("message").textContent = words().storageError;
    return;
  }
  const next = new URL("com-pub-spon-package.html", url);
  next.search = url.search;
  next.searchParams.set("demo", profile);
  next.searchParams.set("lang", lang.value);
  location.assign(next);
};
translate();
$("map-status").textContent = words().loading;
start().catch(() => {
  $("map-status").textContent = words().error + " ";
  const retry = document.createElement("button");
  retry.type = "button";
  retry.dataset.t = "retry";
  retry.textContent = words().retry;
  retry.onclick = () => location.reload();
  $("map-status").append(retry);
});
