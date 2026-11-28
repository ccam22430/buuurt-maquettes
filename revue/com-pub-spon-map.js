"use strict";

const copy = {
  nl: {
    showStreets: "Kaart met straten", hideStreets: "Kaart zonder straten",
    demoShop: "Referentie voor deze demo. Geen klant- of partnerrelatie.",
    streetError: "De achtergrondkaart kon niet volledig worden geladen.",
    campaign: "Gesponsord bericht", postStep: "Bericht", territoryStep: "Gebied", budgetStep: "Budget", reviewStep: "Bevestiging", coordinates: "De winkellocatie ontbreekt.", boundary: "De winkel ligt op een buurtgrens.", territory: "De buurt kon niet eenduidig worden bepaald.", neighbors: "Geen aangrenzende buurten gevonden.", geometry: "Onbruikbare buurtgrenzen.",
    title: "Vergroot je zichtbaarheid", back: "Terug", intro: "Selecteer de buurten en steden waar je je berichten wilt verspreiden.",
    discovery: "Wanneer een voorbijganger de BUUURT-QR-code scant van een winkel in een van de geselecteerde gebieden, kan diegene ook je berichten ontdekken.",
    home: "Mijn buurt", direct: "Aangrenzende buurten", second: "Uitgebreid verzorgingsgebied", other: "Buiten het standaard verspreidingsgebied",
    recenter: "Centreer", fullscreen: "Volledig scherm", exit: "Klein scherm",
    zoomIn: "Inzoomen", zoomOut: "Uitzoomen", districts: "Buurten en plaatsen bekijken",
    scope: "De kaart toont geografische nabijheid. Aangrenzende buurtene buurten zijn vooraf geselecteerd voor deze demonstratie. GEO-IA en werkelijke capaciteit zijn hier niet beschikbaar.",
    why: "Waarom wordt deze buurt niet aanbevolen?",
    grayReason: "Deze buurt valt buiten de twee ringen van aangrenzende buurten rond je winkel. Voor deze buurt is hier geen GEO-IA-beoordeling beschikbaar.",
    extensionTerms: "Als een uitbreiding van je verspreidingsgebied gerechtvaardigd lijkt, kun je die aanvragen.\n\nAcceptatie is niet gegarandeerd: BUUURT geeft altijd voorrang aan de meest relevante berichten voor bewoners.",
    extend: "Uitbreiding aanvragen", returnMap: "Terug naar de kaart", reason: "Motivering",
    humanReview: "Gratis aanvraag. Een medewerker beslist over goedkeuring.", submit: "Opslaan in de maquette",
    storageError: "De selectie kon niet worden opgeslagen.", saved: "Aanvraag opgeslagen in deze maquette.", next: "Verder",
    geographicSelection: "Dit gebied selecteren",
    loading: "Gebieden laden…", error: "De kaart kon niet worden geladen.",
    library: "BUUURT-maquettes", choice: "Publicatiemethode", close: "Sluiten", menu: "BUUURT-menu"
  },
  en: {
    showStreets: "Map with streets", hideStreets: "Map without streets",
    demoShop: "Demo reference. No customer or partnership affiliation.",
    streetError: "The reference basemap could not be fully loaded.",
    campaign: "Sponsored post", postStep: "Post", territoryStep: "Area", budgetStep: "Budget", reviewStep: "Review", coordinates: "The shop location is unavailable.", boundary: "The shop is on a neighbourhood boundary.", territory: "The neighbourhood could not be identified unambiguously.", neighbors: "No directly adjacent neighbourhoods were found.", geometry: "Neighbourhood boundaries are invalid.",
    title: "Broaden your visibility", back: "Back", intro: "Select the neighbourhoods and cities where you want to distribute your posts.",
    discovery: "When a passer-by scans the BUUURT QR code of a shop in one of the selected territories, they will also be able to discover your posts.",
    home: "My neighbourhood", direct: "Adjacent neighbourhoods", second: "Extended catchment area", other: "Outside the standard distribution area",
    recenter: "Recenter", fullscreen: "Full screen", exit: "Exit full screen",
    zoomIn: "Zoom in", zoomOut: "Zoom out", districts: "Browse neighbourhoods and towns",
    scope: "The map shows geographic proximity. Adjacent neighbourhoods are preselected for this review. GEO-AI and live capacity are unavailable here.",
    why: "Why isn’t this neighbourhood recommended?",
    grayReason: "This neighbourhood lies outside the two rings of adjacent neighbourhoods around your shop. No GEO-AI assessment is available here for this neighbourhood.",
    extensionTerms: "If an extension of your delivery area seems justified, you can request one.\n\nAcceptance is not guaranteed: BUUURT always prioritises the most relevant posts for residents.",
    extend: "Request an area extension", returnMap: "Back to the map", reason: "Reason for your request",
    humanReview: "Requests are free. A person decides whether to approve them.", submit: "Save in the prototype",
    storageError: "The selection could not be saved.", saved: "Request saved in this prototype.", next: "Continue",
    geographicSelection: "Select this area",
    loading: "Loading territories…", error: "The map could not be loaded.",
    library: "BUUURT prototypes", choice: "Publication method", close: "Close", menu: "BUUURT menu"
  },
  fr: {
    showStreets: "Carte avec rues", hideStreets: "Carte sans rues",
    demoShop: "Commerce de référence pour la démonstration, sans affiliation client ou partenaire.",
    streetError: "Le fond cartographique de référence n’a pas pu être chargé entièrement.",
    campaign: "Annonce sponsorisée", postStep: "Annonce", territoryStep: "Territoire", budgetStep: "Budget", reviewStep: "Validation", coordinates: "Les coordonnées du commerce sont indisponibles.", boundary: "Le commerce est situé sur une limite de quartier.", territory: "Le quartier du commerce ne peut pas être identifié avec certitude.", neighbors: "Aucun voisin direct n’a été identifié.", geometry: "Les contours des quartiers sont invalides.",
    title: "Élargissez votre visibilité", back: "Retour", intro: "Sélectionnez les quartiers et les villes dans lesquels vous souhaitez diffuser vos annonces.",
    discovery: "Lorsqu'un passant scanne le QR code BUUURT d'un commerce situé dans l'un des territoires sélectionnés, il pourra également découvrir vos annonces.",
    home: "Mon quartier", direct: "Quartiers limitrophes", second: "Zone de chalandise élargie", other: "Hors zone de diffusion standard",
    recenter: "Recentrer", fullscreen: "Plein écran", exit: "Quitter le plein écran",
    zoomIn: "Zoom avant", zoomOut: "Zoom arrière", districts: "Voir les quartiers et les villes",
    scope: "Les territoires limitrophes de votre commerce sont présélectionnés.",
    why: "Pourquoi ce territoire n’est-il pas recommandé ?",
    grayReason: "Ce territoire se trouve au-delà des deux couronnes autour de votre commerce.",
    extensionTerms: "Si une extension de votre territoire de diffusion vous semble justifiée, vous pouvez en faire la demande.\n\nSon acceptation n’est toutefois pas garantie : BUUURT privilégie toujours les annonces les plus pertinentes pour les habitants.",
    extend: "Demander une extension de territoire", returnMap: "Revenir à la carte", reason: "Motif de votre demande",
    humanReview: "La demande est gratuite et soumise à une décision humaine.", submit: "Enregistrer dans la maquette",
    storageError: "La sélection n’a pas pu être enregistrée.", saved: "Demande enregistrée dans cette maquette.", next: "Continuer",
    geographicSelection: "Sélectionner ce territoire",
    loading: "Chargement des territoires…", error: "La carte n’a pas pu être chargée.",
    library: "Maquettes BUUURT", choice: "Choix du mode de publication", close: "Fermer", menu: "Menu BUUURT"
  }
};

const $ = id => document.getElementById(id);
const language = $("lang");
const pageUrl = new URL(location.href);
const requestedLanguage = pageUrl.searchParams.get("lang");
language.value = Object.hasOwn(copy, requestedLanguage) ? requestedLanguage : "nl";
const requestedProfile = pageUrl.searchParams.get("demo") || defaultReviewProfile;
const profile = Object.hasOwn(reviewProfiles, requestedProfile) ? reviewProfiles[requestedProfile] : null;
const draft = readSponsorDraft(sponsorDraftScope(requestedProfile));
const requests = new Map(Array.isArray(draft.requests) ? draft.requests : []);
const extension = $("extension-dialog");
const frame = $("map-frame");
const words = () => copy[language.value];
const districtButtons = new Map();
const canSelect = code => districts.get(code).band !== "home";
let selected;

let map;
let districts;
let territory;
let activeDistrict;
let status = "loading";
let notification = "";
let streetsVisible = pageUrl.searchParams.get("reference") === "streets";
let streetLoadFailed = false;

function saveDraft() {
  return writeSponsorDraft({selected: [...selected], requests: [...requests], merchantId: profile.merchantId,
    address: profile.address, center: profile.center, home: territory.home, bands: territory.bands}, sponsorDraftScope(requestedProfile));
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
  $("reference-toggle").textContent = streetsVisible ? words().hideStreets : words().showStreets;
  $("reference-toggle").setAttribute("aria-pressed", streetsVisible);
  $("reference-status").textContent = streetsVisible && streetLoadFailed ? words().streetError : "";
  const backUrl = new URL("com-pub-002.html", pageUrl);
  backUrl.search = pageUrl.search;
  backUrl.searchParams.delete("lang");
  backUrl.searchParams.delete("demo");
  backUrl.searchParams.delete("reference");
  backUrl.searchParams.delete("notifications");
  backUrl.hash = lang + "-MER-PUB-002";
  document.querySelector(".back").href = backUrl;
  $("choice-link").href = backUrl;
  for (const caption of document.querySelectorAll(".district-category")) caption.textContent = words()[caption.dataset.category];
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
  next.searchParams.delete("reference");
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
    button.dataset.selected = String(selected.has(code));
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
    label.dataset.selected = String(selected.has(code));
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
  if (!profile) throw new Error("coordinates");
  const base = "data/" + sponsorDataset(profile);
  const sources = [base + ".geojson", base + "-neighbors.json"];
  if (profile.water) sources.push(base + "-water.geojson");
  const [data, graph, water] = await Promise.all(sources.map(async url => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("error");
    return response.json();
  }));
  const {center} = profile;
  frame.classList.toggle("historic-map", Boolean(profile.dataset));
  if (profile.name) {
    $("reference-shop-name").textContent = profile.name;
    $("reference-shop-address").textContent = profile.address;
    $("reference-shop").hidden = false;
  }
  territory = classifySponsorTerritory(center, data.features, graph.neighbors);
  for (const feature of data.features) feature.properties.band = territory.bands[feature.id];
  districts = new Map(data.features.map(feature => [feature.id, feature.properties]));
  selected = new Set(Array.isArray(draft.selected) ?
    draft.selected.filter(code => districts.has(code) && canSelect(code)) : territory.direct);
  map = L.map("campaign-map", {zoomControl: false, minZoom: 11, maxZoom: 19, zoomSnap: 0.25, scrollWheelZoom: true});
  const priorityDistricts = [...districts.values()].filter(district =>
    district.band === "home" || district.band === "direct");
  const overview = L.latLngBounds([center, ...priorityDistricts.map(district => district.label)]);
  const recenter = () => {
    const compact = map.getSize().x < 500;
    map.fitBounds(overview, {
      paddingTopLeft: compact ? [44, 48] : [64, 44],
      paddingBottomRight: compact ? [66, 48] : [80, 50],
      maxZoom: 15.75
    });
    if (compact && profile.water) map.setZoom(map.getZoom() + .25, {animate: false});
  };
  recenter();
  map.attributionControl.addAttribution(profile.dataset
    ? '<a href="https://data.overheid.nl/dataset/5l2csm77flzgya" target="_blank" rel="noopener">Gemeente Amsterdam · CC0</a> · <a href="https://data.overheid.nl/dataset/83996-cbs-gebiedsindelingen-1995---2015" target="_blank" rel="noopener">CBS/Kadaster · CC BY 4.0</a>'
    : '<a href="https://www.pdok.nl/introductie/-/article/cbs-wijken-en-buurten" target="_blank" rel="noopener">CBS/Kadaster via PDOK · 2025 · CC BY 4.0</a>');
  const fills = Object.fromEntries([...document.querySelectorAll("[data-band]")].map(item =>
    [item.dataset.band, getComputedStyle(item).getPropertyValue("--band").trim()]));
  const polygons = new Map();
  const boundaries = L.geoJSON(data, {
    smoothFactor: 0,
    style: feature => ({
      className: "territory-outline", color: "#fff", weight: 2,
      fillColor: fills[feature.properties.band],
      fillOpacity: 1
    }),
    onEachFeature: (feature, layer) => {
      polygons.set(feature.id, layer);
      layer.on("click", () => choose(feature.id));
    }
  }).addTo(map);

  const pinSize = profile.dataset && map.getSize().x < 500 ? [27, 32] : [34, 40];
  const waterLayer = water && L.geoJSON(water, {
    interactive: false, bubblingMouseEvents: false, smoothFactor: 0,
    style: {className: "commercial-water", stroke: false, fillColor: "#8ecae8", fillOpacity: 1}
  });
  waterLayer?.addTo(map);
  if (waterLayer) {
    map.attributionControl.addAttribution('<a href="https://data.overheid.nl/dataset/81148-bestand-bodemgebruik-2010" target="_blank" rel="noopener">CBS water 2010 · CC BY 4.0</a>');
  }

  const origin = L.marker(center, {
    interactive: false,
    keyboard: false,
    title: profile.name || districts.get(territory.home).buurtnaam,
    zIndexOffset: 1000,
    icon: L.divIcon({
      className: "shop-pin",
      iconSize: pinSize,
      iconAnchor: [pinSize[0] / 2, pinSize[1] - 1],
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
    if (district.band === "home") label.classList.add("home-district-label");
    const element = marker.getElement();
    const name = document.createElement("span");
    name.textContent = district.buurtnaam;
    label.replaceChildren(name);
    label.style.pointerEvents = "auto";
    L.DomEvent.disableClickPropagation(label);
    labels.push({district, label, name, element, polygon: polygons.get(code)});
  }
  for (const [code] of [...districts].sort(([, a], [, b]) => a.buurtnaam.localeCompare(b.buurtnaam, "nl"))) {
    const label = districtLabel(code);
    const caption = document.createElement("small");
    caption.className = "district-category";
    caption.dataset.category = districts.get(code).band;
    label.append(caption);
    const localities = districts.get(code).localities;
    if (localities?.length) {
      const towns = document.createElement("small");
      towns.className = "district-category";
      towns.textContent = localities.join(" · ");
      label.append(towns);
    }
    list.append(label);
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
      const isHome = district.band === "home";
      if (!isHome && (anchor.x < 0 || anchor.x > viewport.width || anchor.y < 0 || anchor.y > viewport.height)) {
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
      const outline = path.getBoundingClientRect();
      if (isHome && (outline.width === 0 || outline.height === 0 || outline.right <= viewport.left ||
          outline.left >= viewport.right || outline.bottom <= viewport.top || outline.top >= viewport.bottom)) {
        element.hidden = true;
        continue;
      }
      label.classList.remove("is-displaced");
      const maxWidth = Math.max(0, Math.min(132, outline.width - 4));
      element.hidden = false;
      name.hidden = false;
      label.style.translate = "";
      const [lat, lng] = district.label;
      const radius = map.latLngToLayerPoint([lat, lng + district.clearance]).distanceTo(
        map.latLngToLayerPoint(district.label));
      const offsets = [[0, 0]];
      const step = Math.min(14, Math.max(5, Math.round(radius / 3)));
      if (district.band !== "other") {
        for (const scale of [1, 2, 3, 4, 5]) {
          const shift = scale * step;
          offsets.push([0, -shift], [0, shift], [-shift, 0], [shift, 0],
            [-shift, -shift], [shift, -shift], [-shift, shift], [shift, shift],
            [-step, shift], [step, shift], [-step, -shift], [step, -shift],
            [-shift, step], [shift, step], [-shift, -step], [shift, -step]);
        }
      }
      const findPlacement = (candidates = offsets) => {
        if (label.scrollWidth > label.clientWidth) return null;
        const box = label.getBoundingClientRect();
        for (const [x, y] of candidates) {
          const rect = {left: box.left + x, right: box.right + x, top: box.top + y, bottom: box.bottom + y};
          if (rect.left < viewport.left || rect.right > viewport.right || rect.top < viewport.top ||
              rect.bottom > viewport.bottom - 20 || occupied.some(other => overlaps(rect, other)) ||
              !fitsPolygon(rect)) continue;
          return {x, y, rect};
        }
        return null;
      };
      let placement;
      label.classList.remove("district-label-inline");
      const widths = [maxWidth, maxWidth * .84, maxWidth * .70, Math.min(maxWidth, radius * 2.1)];
      for (const inline of [false, true]) {
        label.classList.toggle("district-label-inline", inline);
        for (const width of new Set(widths.map(Math.round))) {
          label.style.maxWidth = width + "px";
          placement = findPlacement();
          if (placement) break;
        }
        if (placement) break;
      }
      if (!placement && (district.band === "home" || district.band === "direct")) {
        const alternatives = [];
        const centerX = viewport.left + anchor.x;
        const centerY = viewport.top + anchor.y;
        for (let y = Math.max(outline.top, viewport.top); y < Math.min(outline.bottom, viewport.bottom); y += 5) {
          for (let x = Math.max(outline.left, viewport.left); x < Math.min(outline.right, viewport.right); x += 5) {
            alternatives.push([x - centerX, y - centerY]);
          }
        }
        alternatives.sort(([x, y], [a, b]) => x * x + y * y - a * a - b * b);
        label.classList.remove("district-label-inline");
        label.style.maxWidth = Math.round(Math.min(maxWidth, 85)) + "px";
        placement = findPlacement(alternatives);
      }
      if (!placement && isHome) {
        // At low zoom the polygon may be smaller than its name. Keep the label
        // inside the viewport and reserve its space before placing other labels.
        label.classList.add("is-displaced");
        label.style.maxWidth = Math.min(160, viewport.width - 20) + "px";
        const box = label.getBoundingClientRect();
        const left = Math.max(viewport.left + 8, Math.min(box.left, viewport.right - box.width - 8));
        const top = Math.max(viewport.top + 8, Math.min(box.top, viewport.bottom - box.height - 24));
        const candidateTops = [top, originBox.top - box.height - 8, originBox.bottom + 8, viewport.top + 8, viewport.bottom - box.height - 24];
        const candidateLefts = [left, viewport.left + 8];
        for (const y of candidateTops) {
          for (const x of candidateLefts) {
            const rect = {left: x, right: x + box.width, top: y, bottom: y + box.height};
            if (y < viewport.top + 8 || rect.bottom > viewport.bottom - 24 ||
                occupied.some(other => overlaps(rect, other))) continue;
            placement = {x: x - box.left, y: y - box.top, rect};
            break;
          }
          if (placement) break;
        }
      }
      if (!placement && district.band === "direct") {
        name.hidden = true;
        label.title = district.buurtnaam;
        placement = findPlacement();
      }
      element.hidden = !placement;
      if (placement) {
        label.style.translate = placement.x + "px " + placement.y + "px";
        occupied.push(placement.rect);
      }
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
  const streets = L.tileLayer(
    "https://service.pdok.nl/kadaster/brt-achtergrondkaart/wmts/v2_0/standaard/EPSG:3857/{z}/{x}/{y}.png",
    {maxNativeZoom: 19, attribution: '<a href="https://www.pdok.nl/introductie/-/article/basisregistratie-topografie-brt-achtergrondkaart" target="_blank" rel="noopener">BRT © Kadaster · PDOK</a>'}
  );
  streets.on("tileerror", () => {
    if (streetLoadFailed) return;
    streetLoadFailed = true;
    translate();
  });
  function showReferenceMode() {
    if (streetsVisible) {
      streetLoadFailed = false;
      streets.addTo(map);
      waterLayer?.remove();
      boundaries.setStyle({fillOpacity: .12, color: "#414353"});
    } else {
      streets.remove();
      waterLayer?.addTo(map);
      boundaries.setStyle({fillOpacity: 1, color: "#fff"});
    }
    translate();
  }
  $("reference-toggle").onclick = () => {
    streetsVisible = !streetsVisible;
    if (streetsVisible) pageUrl.searchParams.set("reference", "streets");
    else pageUrl.searchParams.delete("reference");
    history.replaceState(null, "", pageUrl);
    showReferenceMode();
  };
  $("reference-toggle").disabled = false;
  showReferenceMode();
  $("zoom-in").onclick = () => map.zoomIn();
  $("zoom-out").onclick = () => map.zoomOut();
  $("recenter").onclick = recenter;
  let pendingFrame;
  const scheduleLabels = () => {
    cancelAnimationFrame(pendingFrame);
    pendingFrame = requestAnimationFrame(renderLabels);
  };
  map.on("moveend zoomend resize", scheduleLabels);
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
  status = ["coordinates", "boundary", "territory", "neighbors", "geometry"].includes(error.message) ? error.message : "error";
  translate();
});
