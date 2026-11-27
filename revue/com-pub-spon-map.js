"use strict";

const copy = {
  nl: {
    title: "Stel je gesponsorde campagne in", back: "Terug", package: "Kies je pakket",
    impressions: "doelvertoningen", zones: "Kies je verspreidingsgebied",
    home: "Buurt van je winkel", direct: "Direct aangrenzend", second: "Tweede ring", other: "Overige buurten",
    recenter: "Centreer", fullscreen: "Volledig scherm", exit: "Klein scherm",
    zoomIn: "Inzoomen", zoomOut: "Uitzoomen", districts: "Buurten op naam bekijken",
    scope: "De kaart toont geografische nabijheid. De voorselectie volgt de GEO-06-testrechten. GEO-IA en werkelijke capaciteit zijn hier niet beschikbaar.",
    why: "Waarom wordt deze buurt niet aanbevolen?",
    grayReason: "Deze buurt valt buiten de twee ringen van aangrenzende buurten rond je winkel. Voor deze buurt is hier geen GEO-IA-beoordeling beschikbaar.",
    extensionTerms: "Als een uitbreiding van je verspreidingsgebied gerechtvaardigd lijkt, kun je die aanvragen.\n\nAcceptatie is niet gegarandeerd: BUUURT geeft altijd voorrang aan de meest relevante berichten voor bewoners.",
    extend: "Uitbreiding aanvragen", returnMap: "Terug naar de kaart", reason: "Motivering",
    humanReview: "Gratis aanvraag. Een medewerker beslist over goedkeuring.", submit: "Opslaan in de maquette",
    saved: "Aanvraag opgeslagen in deze maquette.", next: "Verder", duration: "Looptijd",
    durationNote: "Indicatieve looptijd voor de maquette.", days: "dagen",
    geographicSelection: "Geografische selectie voor de maquette", reviewTitle: "Campagneoverzicht", done: "Werkelijke capaciteit en rechten moeten worden gecontroleerd vóór bevestiging.",
    loading: "Officiële grenzen laden…", error: "De kaart kon niet worden geladen.",
    library: "BUUURT-maquettes", choice: "Publicatiemethode", close: "Sluiten", menu: "BUUURT-menu",
    stages: ["Bericht", "Gebieden", "Looptijd", "Overzicht"]
  },
  en: {
    title: "Configure your sponsored campaign", back: "Back", package: "Choose your package",
    impressions: "target impressions", zones: "Choose your delivery area",
    home: "Your shop’s neighbourhood", direct: "Direct neighbours", second: "Second ring", other: "Other neighbourhoods",
    recenter: "Recenter", fullscreen: "Full screen", exit: "Exit full screen",
    zoomIn: "Zoom in", zoomOut: "Zoom out", districts: "Browse neighbourhoods by name",
    scope: "The map shows geographic proximity. The default selection uses GEO-06 test permissions. GEO-AI and live capacity are unavailable here.",
    why: "Why isn’t this neighbourhood recommended?",
    grayReason: "This neighbourhood lies outside the two rings of adjacent neighbourhoods around your shop. No GEO-AI assessment is available here for this neighbourhood.",
    extensionTerms: "If an extension of your delivery area seems justified, you can request one.\n\nAcceptance is not guaranteed: BUUURT always prioritises the most relevant posts for residents.",
    extend: "Request an area extension", returnMap: "Back to the map", reason: "Reason for your request",
    humanReview: "Requests are free. A person decides whether to approve them.", submit: "Save in the prototype",
    saved: "Request saved in this prototype.", next: "Continue", duration: "Campaign duration",
    durationNote: "Indicative duration for the prototype.", days: "days",
    geographicSelection: "Geographic selection for the prototype", reviewTitle: "Campaign summary", done: "Live capacity and permissions must be checked before confirmation.",
    loading: "Loading official boundaries…", error: "The map could not be loaded.",
    library: "BUUURT prototypes", choice: "Publication method", close: "Close", menu: "BUUURT menu",
    stages: ["Post", "Areas", "Duration", "Review"]
  },
  fr: {
    title: "Configurer votre campagne sponsorisée", back: "Retour", package: "Choisissez votre forfait",
    impressions: "impressions cibles", zones: "Sélectionnez vos zones de diffusion",
    home: "Quartier de votre commerce", direct: "Voisins directs", second: "Deuxième couronne", other: "Autres quartiers",
    recenter: "Recentrer", fullscreen: "Plein écran", exit: "Quitter le plein écran",
    zoomIn: "Zoom avant", zoomOut: "Zoom arrière", districts: "Consulter les quartiers par nom",
    scope: "La carte représente la proximité géographique. La présélection reprend les droits d’essai GEO-06. Les recommandations GEO-IA et la capacité réelle sont indisponibles ici.",
    why: "Pourquoi ce quartier n’est-il pas recommandé ?",
    grayReason: "Ce quartier se situe au-delà des deux couronnes de quartiers limitrophes autour de votre commerce. Aucune évaluation GEO-IA de ce quartier n’est disponible ici.",
    extensionTerms: "Si une extension de votre territoire de diffusion vous semble justifiée, vous pouvez en faire la demande.\n\nSon acceptation n’est toutefois pas garantie : BUUURT privilégie toujours les annonces les plus pertinentes pour les habitants.",
    extend: "Demander une extension de territoire", returnMap: "Revenir à la carte", reason: "Motif de votre demande",
    humanReview: "La demande est gratuite et soumise à une décision humaine.", submit: "Enregistrer dans la maquette",
    saved: "Demande enregistrée dans cette maquette.", next: "Continuer", duration: "Durée de diffusion",
    durationNote: "Durée indicative de la maquette.", days: "jours",
    geographicSelection: "Sélection géographique de la maquette", reviewTitle: "Récapitulatif de la campagne", done: "La capacité et les droits réels doivent être contrôlés avant toute confirmation.",
    loading: "Chargement des contours officiels…", error: "La carte n’a pas pu être chargée.",
    library: "Maquettes BUUURT", choice: "Choix du mode de publication", close: "Fermer", menu: "Menu BUUURT",
    stages: ["Annonce", "Zones", "Durée", "Récapitulatif"]
  }
};

const $ = id => document.getElementById(id);
const language = $("lang");
const pageUrl = new URL(location.href);
const requestedLanguage = pageUrl.searchParams.get("lang");
language.value = Object.hasOwn(copy, requestedLanguage) ? requestedLanguage : "nl";
const storageKey = "buuurt-review:com-pub-spon-001:cbs-2025";
let draft = {};
try { draft = JSON.parse(sessionStorage.getItem(storageKey)) || {}; } catch {}
const requests = new Map(Array.isArray(draft.requests) ? draft.requests : []);
const extension = $("extension-dialog");
const frame = $("map-frame");
const duration = $("duration");
const budget = () => document.querySelector("[name=budget]:checked");
const targets = {15: 500, 30: 1200, 50: 2500};
const colors = {home: "#83cf97", direct: "#ffe086", second: "#f6aaca", other: "#ddd9de"};
const words = () => copy[language.value];
const districtButtons = new Map();
const canSelect = code => districts.get(code).band !== "home";
let selected;

let map;
let districts;
let activeDistrict;
let status = "loading";
let notification = "";

for (const input of document.querySelectorAll("[name=budget]")) {
  if (input.value === draft.budget) input.checked = true;
  input.addEventListener("change", saveDraft);
}
if ([...duration.options].some(option => option.value === draft.duration)) duration.value = draft.duration;
duration.addEventListener("change", saveDraft);
$("duration-panel").hidden = !draft.durationVisible;

function saveDraft() {
  if (!selected) return;
  try {
    sessionStorage.setItem(storageKey, JSON.stringify({
      selected: [...selected], requests: [...requests], budget: budget().value,
      duration: duration.value, durationVisible: !$("duration-panel").hidden
    }));
  } catch {}
  renderReview();
}

function renderReview() {
  if (!districts) return;
  const format = new Intl.NumberFormat(language.value);
  const names = [...selected].map(code => districts.get(code).buurtnaam);
  $("review-summary").textContent = [
    format.format(targets[budget().value]) + " " + words().impressions,
    budget().value + " €",
    duration.value + " " + words().days,
    ...names
  ].join(" · ");
}

function translate() {
  const lang = language.value;
  document.documentElement.lang = lang;
  for (const element of document.querySelectorAll("[data-t]")) element.textContent = words()[element.dataset.t];
  for (const element of document.querySelectorAll("[data-stage]")) element.textContent = words().stages[element.dataset.stage];
  for (const option of duration.options) option.textContent = option.value + " " + words().days;
  $("zoom-in").setAttribute("aria-label", words().zoomIn);
  $("zoom-out").setAttribute("aria-label", words().zoomOut);
  $("fullscreen").textContent = frame.classList.contains("is-expanded") ? words().exit : words().fullscreen;
  for (const id of ["recenter", "fullscreen"]) {
    $(id).title = $(id).textContent;
    $(id).setAttribute("aria-label", $(id).textContent);
  }
  $("menu-heading").textContent = words().menu;
  $("map-status").textContent = words()[status] || "";
  $("message").textContent = words()[notification] || "";
  const backUrl = new URL("com-pub-002.html", pageUrl);
  backUrl.search = pageUrl.search;
  backUrl.searchParams.delete("lang");
  backUrl.searchParams.delete("notifications");
  backUrl.hash = lang + "-MER-PUB-002";
  document.querySelector(".back").href = backUrl;
  $("choice-link").href = backUrl;
  renderReview();
}
language.addEventListener("change", () => {
  pageUrl.searchParams.set("lang", language.value);
  history.replaceState(null, "", pageUrl);
  translate();
});
translate();

$("menu").onclick = () => $("campaign-menu").showModal();
$("continue").onclick = () => {
  const panel = $("duration-panel");
  if (panel.hidden) {
    panel.hidden = false;
    saveDraft();
    duration.focus();
    return;
  }
  $("campaign-review").hidden = false;
  renderReview();
  $("campaign-review").focus();
};

function showExtension(code) {
  activeDistrict = code;
  $("district-name").textContent = districts.get(code).buurtnaam;
  $("reason").value = requests.get(code) || "";
  $("gray-selection").setAttribute("aria-checked", selected.has(code));
  $("extension-form").hidden = true;
  $("extend").hidden = false;
  extension.showModal();
}
$("gray-selection").onclick = () => {
  toggleSelection(activeDistrict);
  $("gray-selection").setAttribute("aria-checked", selected.has(activeDistrict));
};
$("extend").onclick = () => {
  $("extension-form").hidden = false;
  $("extend").hidden = true;
  $("reason").focus();
};
$("extension-form").onsubmit = event => {
  event.preventDefault();
  const reason = $("reason").value.trim();
  if (!reason) {
    $("reason").value = "";
    $("reason").reportValidity();
    return;
  }
  requests.set(activeDistrict, reason);
  saveDraft();
  extension.close();
  notification = "saved";
  translate();
};

function choose(code) {
  if (districts.get(code).band === "other") {
    showExtension(code);
    return;
  }
  if (canSelect(code)) toggleSelection(code);
}

function toggleSelection(code) {
  if (selected.has(code)) selected.delete(code);
  else selected.add(code);
  for (const button of districtButtons.get(code) || []) {
    if (button.hasAttribute("aria-checked")) button.setAttribute("aria-checked", selected.has(code));
  }
  saveDraft();
}

function districtLabel(code) {
  const district = districts.get(code);
  const interactive = canSelect(code);
  const label = document.createElement(interactive ? "button" : "span");
  label.textContent = district.buurtnaam;
  if (interactive) {
    label.type = "button";
    label.setAttribute("aria-label", district.buurtnaam);
    label.onclick = () => choose(code);
    if (district.band !== "other") {
      label.setAttribute("role", "checkbox");
      label.setAttribute("aria-checked", selected.has(code));
    }
    if (!districtButtons.has(code)) districtButtons.set(code, []);
    districtButtons.get(code).push(label);
  }
  return label;
}

async function loadMap() {
  const response = await fetch("data/amsterdam-cbs-2025.geojson");
  if (!response.ok) throw new Error("CBS snapshot unavailable");
  const data = await response.json();
  const {center, demoEligible} = data.pilot;
  districts = new Map(data.features.map(feature => [feature.id, feature.properties]));
  selected = new Set(Array.isArray(draft.selected) ? draft.selected.filter(code => districts.has(code) && canSelect(code)) : demoEligible);
  map = L.map("campaign-map", {zoomControl: false, minZoom: 11, maxZoom: 19, zoomSnap: 0.5, scrollWheelZoom: true});
  const recenter = () => map.setView(center, map.getSize().x < 500 ? 15.5 : 16);
  recenter();
  map.attributionControl.addAttribution('<a href="https://www.pdok.nl/introductie/-/article/cbs-wijken-en-buurten" target="_blank" rel="noopener">CBS/Kadaster via PDOK · 2025 · CC BY 4.0</a>');
  L.geoJSON(data, {
    style: feature => ({color: "#675d65", weight: 1, fillColor: colors[feature.properties.band], fillOpacity: 0.86}),
    onEachFeature: (feature, layer) => layer.on("click", () => choose(feature.id))
  }).addTo(map);

  const origin = L.circleMarker(center, {
    radius: 7, color: "white", weight: 3, fillColor: "#18733e", fillOpacity: 1, interactive: false
  }).addTo(map);
  const labels = [];
  const list = $("district-list");
  const priority = ["home", "direct", "second", "other"];
  const ranked = [...districts].sort(([, a], [, b]) => priority.indexOf(a.band) - priority.indexOf(b.band));

  for (const [code, district] of ranked) {
    const label = districtLabel(code);
    const marker = L.marker(district.label, {
      icon: L.divIcon({className: "district-marker", html: label, iconSize: [0, 0]}),
      keyboard: false, pane: "tooltipPane", interactive: false
    }).addTo(map);
    const element = marker.getElement();
    label.style.pointerEvents = "auto";
    L.DomEvent.disableClickPropagation(label);
    labels.push({district, label, element});
  }
  for (const [code] of [...districts].sort(([, a], [, b]) => a.buurtnaam.localeCompare(b.buurtnaam, "nl"))) {
    list.append(districtLabel(code));
  }

  function renderLabels() {
    const viewport = map.getContainer().getBoundingClientRect();
    const controls = frame.querySelector(".map-tools").getBoundingClientRect();
    const originBox = origin.getElement().getBoundingClientRect();
    const occupied = [controls, originBox];
    const overlaps = (a, b) => a.left < b.right + 4 && a.right > b.left - 4 &&
      a.top < b.bottom + 4 && a.bottom > b.top - 4;
    for (const {district, label, element} of labels) {
      element.hidden = false;
      const box = label.getBoundingClientRect();
      const [lat, lng] = district.label;
      const radius = map.latLngToLayerPoint([lat, lng + district.clearance]).distanceTo(
        map.latLngToLayerPoint(district.label));
      const latitudeScale = Math.cos(lat * Math.PI / 180);
      element.hidden = Math.hypot(box.width, box.height * latitudeScale) / 2 > radius ||
        box.left < viewport.left || box.right > viewport.right ||
        box.top < viewport.top || box.bottom > viewport.bottom - 20 ||
        occupied.some(other => overlaps(box, other));
      if (!element.hidden) occupied.push(box);
    }
  }

  const toggleFullscreen = () => {
    const expanded = frame.classList.toggle("is-expanded");
    document.body.classList.toggle("map-expanded", expanded);
    $("fullscreen").setAttribute("aria-pressed", expanded);
    map.invalidateSize();
    translate();
    renderLabels();
  };
  $("fullscreen").onclick = toggleFullscreen;
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !extension.open && frame.classList.contains("is-expanded")) toggleFullscreen();
  });
  $("zoom-in").onclick = () => map.zoomIn();
  $("zoom-out").onclick = () => map.zoomOut();
  $("recenter").onclick = recenter;
  map.on("moveend zoomend resize", renderLabels);
  const resize = new ResizeObserver(() => map.invalidateSize());
  resize.observe(map.getContainer());
  document.fonts.ready.then(renderLabels);
  renderLabels();
  status = "";
  $("continue").disabled = false;
  translate();
}

loadMap().catch(error => {
  console.error(error);
  status = "error";
  translate();
});
