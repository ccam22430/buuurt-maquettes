"use strict";

const copy = {
  nl: {
    title: "Kies je verspreidingsgebied", back: "Terug", intro: "Tik op de buurten waar je je bericht wilt verspreiden.",
    home: "Buurt van je winkel", direct: "Direct aangrenzend", second: "Tweede ring", other: "Overige buurten",
    recenter: "Centreer", fullscreen: "Volledig scherm", exit: "Klein scherm",
    zoomIn: "Inzoomen", zoomOut: "Uitzoomen", districts: "Buurten op naam bekijken",
    scope: "De kaart toont geografische nabijheid. De voorselectie volgt de GEO-06-testrechten. GEO-IA en werkelijke capaciteit zijn hier niet beschikbaar.",
    why: "Waarom wordt deze buurt niet aanbevolen?",
    grayReason: "Deze buurt valt buiten de twee ringen van aangrenzende buurten rond je winkel. Voor deze buurt is hier geen GEO-IA-beoordeling beschikbaar.",
    extensionTerms: "Als een uitbreiding van je verspreidingsgebied gerechtvaardigd lijkt, kun je die aanvragen.\n\nAcceptatie is niet gegarandeerd: BUUURT geeft altijd voorrang aan de meest relevante berichten voor bewoners.",
    extend: "Uitbreiding aanvragen", returnMap: "Terug naar de kaart", reason: "Motivering",
    humanReview: "Gratis aanvraag. Een medewerker beslist over goedkeuring.", submit: "Opslaan in de maquette",
    storageError: "De selectie kon niet worden opgeslagen.", saved: "Aanvraag opgeslagen in deze maquette.", next: "Verder",
    geographicSelection: "Geografische selectie voor de maquette",
    loading: "Officiële grenzen laden…", error: "De kaart kon niet worden geladen.",
    library: "BUUURT-maquettes", choice: "Publicatiemethode", close: "Sluiten", menu: "BUUURT-menu"
  },
  en: {
    title: "Choose your delivery area", back: "Back", intro: "Tap the neighbourhoods where you’d like your post to appear.",
    home: "Your shop’s neighbourhood", direct: "Direct neighbours", second: "Second ring", other: "Other neighbourhoods",
    recenter: "Recenter", fullscreen: "Full screen", exit: "Exit full screen",
    zoomIn: "Zoom in", zoomOut: "Zoom out", districts: "Browse neighbourhoods by name",
    scope: "The map shows geographic proximity. The default selection uses GEO-06 test permissions. GEO-AI and live capacity are unavailable here.",
    why: "Why isn’t this neighbourhood recommended?",
    grayReason: "This neighbourhood lies outside the two rings of adjacent neighbourhoods around your shop. No GEO-AI assessment is available here for this neighbourhood.",
    extensionTerms: "If an extension of your delivery area seems justified, you can request one.\n\nAcceptance is not guaranteed: BUUURT always prioritises the most relevant posts for residents.",
    extend: "Request an area extension", returnMap: "Back to the map", reason: "Reason for your request",
    humanReview: "Requests are free. A person decides whether to approve them.", submit: "Save in the prototype",
    storageError: "The selection could not be saved.", saved: "Request saved in this prototype.", next: "Continue",
    geographicSelection: "Geographic selection for the prototype",
    loading: "Loading official boundaries…", error: "The map could not be loaded.",
    library: "BUUURT prototypes", choice: "Publication method", close: "Close", menu: "BUUURT menu"
  },
  fr: {
    title: "Choisissez votre zone de diffusion", back: "Retour", intro: "Touchez les quartiers dans lesquels vous souhaitez diffuser votre annonce.",
    home: "Quartier de votre commerce", direct: "Voisins directs", second: "Deuxième couronne", other: "Autres quartiers",
    recenter: "Recentrer", fullscreen: "Plein écran", exit: "Quitter le plein écran",
    zoomIn: "Zoom avant", zoomOut: "Zoom arrière", districts: "Consulter les quartiers par nom",
    scope: "La carte représente la proximité géographique. La présélection reprend les droits d’essai GEO-06. Les recommandations GEO-IA et la capacité réelle sont indisponibles ici.",
    why: "Pourquoi ce quartier n’est-il pas recommandé ?",
    grayReason: "Ce quartier se situe au-delà des deux couronnes de quartiers limitrophes autour de votre commerce. Aucune évaluation GEO-IA de ce quartier n’est disponible ici.",
    extensionTerms: "Si une extension de votre territoire de diffusion vous semble justifiée, vous pouvez en faire la demande.\n\nSon acceptation n’est toutefois pas garantie : BUUURT privilégie toujours les annonces les plus pertinentes pour les habitants.",
    extend: "Demander une extension de territoire", returnMap: "Revenir à la carte", reason: "Motif de votre demande",
    humanReview: "La demande est gratuite et soumise à une décision humaine.", submit: "Enregistrer dans la maquette",
    storageError: "La sélection n’a pas pu être enregistrée.", saved: "Demande enregistrée dans cette maquette.", next: "Continuer",
    geographicSelection: "Sélection géographique de la maquette",
    loading: "Chargement des contours officiels…", error: "La carte n’a pas pu être chargée.",
    library: "Maquettes BUUURT", choice: "Choix du mode de publication", close: "Fermer", menu: "Menu BUUURT"
  }
};

const $ = id => document.getElementById(id);
const language = $("lang");
const pageUrl = new URL(location.href);
const requestedLanguage = pageUrl.searchParams.get("lang");
language.value = Object.hasOwn(copy, requestedLanguage) ? requestedLanguage : "nl";
const draft = readSponsorDraft();
const requests = new Map(Array.isArray(draft.requests) ? draft.requests : []);
const extension = $("extension-dialog");
const frame = $("map-frame");
const words = () => copy[language.value];
const districtButtons = new Map();
const canSelect = code => districts.get(code).band !== "home";
let selected;

let map;
let districts;
let activeDistrict;
let status = "loading";
let notification = "";

function saveDraft() {
  return writeSponsorDraft({selected: [...selected], requests: [...requests]});
}

function translate() {
  const lang = language.value;
  document.documentElement.lang = lang;
  for (const element of document.querySelectorAll("[data-t]")) element.textContent = words()[element.dataset.t];
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
}
language.addEventListener("change", () => {
  pageUrl.searchParams.set("lang", language.value);
  history.replaceState(null, "", pageUrl);
  translate();
});
translate();

$("menu").onclick = () => $("campaign-menu").showModal();
$("continue").onclick = () => {
  if (!saveDraft()) {
    notification = "storageError";
    translate();
    return;
  }
  const next = new URL("com-pub-spon-package.html", pageUrl);
  next.search = pageUrl.search;
  next.searchParams.set("lang", language.value);
  location.assign(next);
};

window.addEventListener("pageshow", event => {
  if (event.persisted) location.reload();
});

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
  notification = saveDraft() ? "saved" : "storageError";
  extension.close();
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
    if (district.band === "other") label.setAttribute("aria-haspopup", "dialog");
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
  const overview = L.geoJSON(data, {
    filter: feature => ["home", "direct"].includes(feature.properties.band)
  }).getBounds();
  const recenter = () => map.fitBounds(overview, {padding: [26, 38], maxZoom: 15.5});
  recenter();
  map.attributionControl.addAttribution('<a href="https://www.pdok.nl/introductie/-/article/cbs-wijken-en-buurten" target="_blank" rel="noopener">CBS/Kadaster via PDOK · 2025 · CC BY 4.0</a>');
  const fills = Object.fromEntries([...document.querySelectorAll("[data-band]")].map(item =>
    [item.dataset.band, getComputedStyle(item).getPropertyValue("--band").trim()]));
  const polygons = new Map();
  L.geoJSON(data, {
    style: feature => ({
      color: "#fff", weight: 2,
      fillColor: fills[feature.properties.band],
      fillOpacity: 1
    }),
    onEachFeature: (feature, layer) => {
      polygons.set(feature.id, layer);
      layer.on("click", () => choose(feature.id));
    }
  }).addTo(map);

  const origin = L.marker(center, {
    interactive: false,
    keyboard: false,
    title: districts.get(data.pilot.home).buurtnaam,
    zIndexOffset: 1000,
    icon: L.divIcon({
      className: "shop-pin",
      iconSize: [34, 40],
      iconAnchor: [17, 39],
      html: '<svg viewBox="0 0 34 40" aria-hidden="true"><path d="M17 39C13 34 1 23 1 17a16 16 0 1 1 32 0c0 6-12 17-16 22Z" fill="#168741" stroke="white" stroke-width="2"/><path d="M10 16v8h14v-8m-9 8v-6h4v6M9 16l2-6h12l2 6H9Z" fill="none" stroke="white" stroke-width="1.5" stroke-linejoin="round"/></svg>'
    })
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
    const name = document.createElement("span");
    name.textContent = district.buurtnaam;
    label.replaceChildren(name);
    label.style.pointerEvents = "auto";
    L.DomEvent.disableClickPropagation(label);
    labels.push({district, label, name, element, polygon: polygons.get(code)});
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
    for (const {district, label, name, element, polygon} of labels) {
      const anchor = map.latLngToContainerPoint(district.label);
      if (anchor.x < 0 || anchor.x > viewport.width || anchor.y < 0 || anchor.y > viewport.height) {
        element.hidden = true;
        continue;
      }
      const path = polygon.getElement();
      const matrix = path.getScreenCTM();
      if (!matrix) {
        element.hidden = true;
        continue;
      }
      const transform = matrix.inverse();
      const fitsPolygon = box => [box.left, (box.left + box.right) / 2, box.right].every(x =>
        [box.top, (box.top + box.bottom) / 2, box.bottom].every(y =>
          path.isPointInFill(new DOMPoint(x, y).matrixTransform(transform))));
      const maxWidth = Math.min(132, path.getBoundingClientRect().width - 4);
      element.hidden = false;
      name.hidden = false;
      label.style.maxWidth = Math.max(0, maxWidth) + "px";
      let box = label.getBoundingClientRect();
      if (!fitsPolygon(box)) {
        const [lat, lng] = district.label;
        const radius = map.latLngToLayerPoint([lat, lng + district.clearance]).distanceTo(
          map.latLngToLayerPoint(district.label));
        label.style.maxWidth = Math.min(maxWidth, radius * 1.9) + "px";
        box = label.getBoundingClientRect();
      }
      const fits = rect => label.scrollWidth <= label.clientWidth && fitsPolygon(rect) &&
        rect.left >= viewport.left && rect.right <= viewport.right &&
        rect.top >= viewport.top && rect.bottom <= viewport.bottom - 20 &&
        !occupied.some(other => overlaps(rect, other));
      if (!fits(box) && district.band === "direct") {
        name.hidden = true;
        label.title = district.buurtnaam;
        box = label.getBoundingClientRect();
      }
      element.hidden = !fits(box);
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
