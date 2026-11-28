"use strict";

const bikeText = {
  fr: {
    extensionTitle: "Demande d’extension", extensionSend: "Envoyer ma demande", extensionCancel: "Annuler",
    home: "Zone locale gratuite", direct: "Extension sponsorisée standard", other: "Extension sur demande",
    wijken: "Sous-quartiers", areas: "Voir les quartiers", list: "Territoires",
    estimate: "Temps estimés sur le réseau cyclable. La limite s’applique à au moins la moitié des voies parcourables du sous-quartier.",
    locked: "Périmètre enregistré pour cette campagne.", grayBikeReason: "Ce sous-quartier est hors du périmètre standard. Une demande d’extension est nécessaire.",
    unassigned: "Westpoort · sous-quartiers sans rattachement", adminTitle: "Paramètres géographiques",
    adminDemo: "La session et les réglages de cette maquette sont locaux à ce navigateur.",
    enterAdmin: "Ouvrir la session administrateur de démonstration", actor: "Administrateur de démonstration · Paramètres globaux",
    fixtureLabel: "Commerce de référence", saveGeo: "Enregistrer", cancel: "Annuler", reset: "Rétablir les valeurs initiales",
    history: "Historique", emptyHistory: "Aucune modification enregistrée.", savedGeo: "Paramètres enregistrés.",
    cancelledGeo: "Modifications annulées.", resetGeo: "Valeurs initiales prévisualisées. Enregistrez pour les appliquer.",
    configError: "Les paramètres n’ont pas pu être enregistrés.", campaignMissing: "Cette campagne enregistrée est indisponible dans ce navigateur.",
    retry: "Réessayer", border: "Point fictif · limite Helmersbuurt–Overtoomse Sluis",
    canal: "Point fictif · canal Brouwersgracht", junction: "Point fictif · plusieurs limites administratives"
  },
  nl: {
    extensionTitle: "Uitbreidingsaanvraag", extensionSend: "Mijn aanvraag versturen", extensionCancel: "Annuleren",
    home: "Gratis lokaal gebied", direct: "Standaard gesponsord uitbreidingsgebied", other: "Uitbreiding op aanvraag",
    wijken: "Wijken", areas: "Gebieden bekijken", list: "Gebieden",
    estimate: "Geschatte tijden op het fietsnetwerk. De grens geldt voor minstens de helft van de berijdbare wegen in de wijk.",
    locked: "Gebied opgeslagen voor deze campagne.", grayBikeReason: "Deze wijk valt buiten het standaardgebied. Vraag een uitbreiding aan.",
    unassigned: "Westpoort · wijken zonder gebied", adminTitle: "Geografische instellingen",
    adminDemo: "De sessie en instellingen van deze demo zijn lokaal in deze browser.",
    enterAdmin: "Demosessie voor beheerders openen", actor: "Demobeheerder · Algemene instellingen",
    fixtureLabel: "Referentiewinkel", saveGeo: "Opslaan", cancel: "Annuleren", reset: "Beginwaarden herstellen",
    history: "Geschiedenis", emptyHistory: "Geen opgeslagen wijzigingen.", savedGeo: "Instellingen opgeslagen.",
    cancelledGeo: "Wijzigingen geannuleerd.", resetGeo: "Beginwaarden in voorbeeld. Sla op om ze toe te passen.",
    configError: "De instellingen konden niet worden opgeslagen.", campaignMissing: "Deze opgeslagen campagne is niet beschikbaar in deze browser.",
    retry: "Opnieuw proberen", border: "Fictief punt · grens Helmersbuurt–Overtoomse Sluis",
    canal: "Fictief punt · Brouwersgracht", junction: "Fictief punt · meerdere gebiedsgrenzen"
  },
  en: {
    extensionTitle: "Extension request", extensionSend: "Send my request", extensionCancel: "Cancel",
    home: "Free local area", direct: "Standard sponsored extension", other: "Extension by request",
    wijken: "Neighborhoods", areas: "Show areas", list: "Territories",
    estimate: "Estimated bicycle network times. The time limit applies to at least half of the neighborhood’s rideable roads.",
    locked: "Saved targeting for this campaign.", grayBikeReason: "This neighborhood is outside standard coverage. Request an extension to use it.",
    unassigned: "Westpoort · unassigned neighborhoods", adminTitle: "Geographic settings",
    adminDemo: "This prototype’s session and settings are local to this browser.",
    enterAdmin: "Open a demo administrator session", actor: "Demo administrator · Global settings",
    fixtureLabel: "Reference shop", saveGeo: "Save", cancel: "Cancel", reset: "Restore initial values",
    history: "Change history", emptyHistory: "No saved changes.", savedGeo: "Settings saved.",
    cancelledGeo: "Changes cancelled.", resetGeo: "Initial values previewed. Save to apply them.",
    configError: "Settings could not be saved.", campaignMissing: "This saved campaign is unavailable in this browser.",
    retry: "Try again", border: "Fictional point · Helmersbuurt–Overtoomse Sluis boundary",
    canal: "Fictional point · Brouwersgracht canal", junction: "Fictional point · several administrative boundaries"
  }
};

const bikeElement = id => document.getElementById(id);
const bikeUrl = new URL(location.href);
const bikeLanguage = bikeElement("lang");
bikeLanguage.value = Object.hasOwn(bikeText, bikeUrl.searchParams.get("lang")) ? bikeUrl.searchParams.get("lang") : "nl";
const bikeWords = () => ({...copy[bikeLanguage.value], ...bikeText[bikeLanguage.value]});
const bikeFixtureNames = () => ({dolores: "Dolores Del Dia Vintage & Modern", pilot: "Jan Evertsenstraat 55-H",
  border: bikeWords().border, canal: bikeWords().canal, junction: bikeWords().junction});

function translateBike() {
  const words = bikeWords();
  document.documentElement.lang = bikeLanguage.value;
  for (const element of document.querySelectorAll("[data-t]")) element.textContent = words[element.dataset.t];
  for (const [id, key] of [["zoom-in", "zoomIn"], ["zoom-out", "zoomOut"], ["recenter", "recenter"], ["fullscreen", "fullscreen"]]) {
    bikeElement(id).ariaLabel = words[key];
  }
}

function bikeLanguageChange(update) {
  bikeLanguage.addEventListener("change", () => {
    bikeUrl.searchParams.set("lang", bikeLanguage.value);
    history.replaceState(null, "", bikeUrl);
    translateBike();
    update();
  });
}

async function loadBikeData() {
  const [areas, wijken, times] = await Promise.all(
    ["amsterdam-levels-areas.geojson", "amsterdam-levels-wijken.geojson", "amsterdam-bike-times.json"].map(async name => {
      const response = await fetch("data/" + name);
      if (!response.ok) throw new Error(name);
      return response.json();
    }));
  return {areas, wijken, times};
}

function bikeBands(data, fixture, settings) {
  const profile = data.times.profiles[fixture];
  return Object.fromEntries(data.wijken.features.map(({id}) =>
    [id, classifyBikeSeconds(profile.wijken[id]?.seconds, settings)]));
}

function bikeFailure(text = bikeWords().error) {
  const node = bikeElement("map-status");
  node.textContent = text + " ";
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = bikeWords().retry;
  button.onclick = () => location.reload();
  node.append(button);
}

function createBikeMap(data, fixture, onChoose) {
  const frame = bikeElement("map-frame");
  const map = L.map("campaign-map", {zoomControl: false, doubleClickZoom: !onChoose, minZoom: 10, maxZoom: 19, zoomSnap: .25});
  let center = data.times.profiles[fixture].center;
  const recenter = () => map.setView(center, map.getSize().x < 550 ? 13.5 : 14, {animate: false});
  recenter();
  const image = '<svg viewBox="0 0 28 36" aria-hidden="true"><path fill="#126c39" stroke="white" stroke-width="2" d="M14 34C10 29 1 19 1 14a13 13 0 0 1 26 0c0 5-9 15-13 20Z"/><path stroke="white" fill="none" stroke-width="1.5" d="M8 13h12v8H8z M7 13l2-5h10l2 5m-9 8v-5h4v5"/></svg>';
  const pin = L.marker(center, {interactive: false, keyboard: false,
    icon: L.divIcon({className: "shop-pin", html: image, iconSize: [28, 36], iconAnchor: [14, 34]})
  }).addTo(map);
  const fills = Object.fromEntries([...document.querySelectorAll(".campaign-legend [data-band]")].map(
    item => [item.dataset.band, getComputedStyle(item).getPropertyValue("--band").trim()]));
  map.attributionControl.addAttribution('<a href="https://maps.amsterdam.nl/gebiedsindeling/">Amsterdam · CC0</a> · <a href="https://www.pdok.nl/introductie/-/article/basisregistratie-topografie-topnl">Kadaster/PDOK · TOP10NL · CC BY 4.0</a>');
  let bands = {};
  // Leaflet suppresses drag clicks, but a browser can still synthesize a click after a pinch.
  const pointers = new Map();
  let gestureMoved = false;
  const surface = map.getContainer();
  surface.addEventListener("pointerdown", event => {
    if (!pointers.size) gestureMoved = false;
    pointers.set(event.pointerId, [event.clientX, event.clientY]);
    if (pointers.size > 1) gestureMoved = true;
  }, true);
  window.addEventListener("pointermove", event => {
    const start = pointers.get(event.pointerId);
    if (start && Math.hypot(event.clientX - start[0], event.clientY - start[1]) > 5) gestureMoved = true;
  }, true);
  window.addEventListener("pointerup", event => pointers.delete(event.pointerId), true);
  window.addEventListener("pointercancel", event => {
    if (pointers.delete(event.pointerId)) gestureMoved = true;
  }, true);
  map.on("dragstart zoomstart", () => { gestureMoved = true; });
  const labels = new Map();
  const outline = L.geoJSON(data.wijken, {smoothFactor: 0, style: () => ({
    color: "white", weight: 2, fillOpacity: 1, className: "territory-outline"
  }), onEachFeature(feature, polygon) {
    polygon.on("click", () => {
      if (!gestureMoved && bands[feature.id] !== "home") onChoose?.(feature);
    });
    const label = document.createElement("span");
    label.textContent = feature.properties.buurtnaam;
    const check = document.createElement("span");
    check.className = "territory-check";
    check.textContent = "✓";
    check.ariaHidden = "true";
    check.hidden = true;
    const content = document.createElement("div");
    content.append(label, check);
    L.marker(feature.properties.label, {
      icon: L.divIcon({className: "district-marker bike-label", html: content, iconSize: [0, 0]}),
      keyboard: false, pane: "tooltipPane", interactive: false
    }).addTo(map);
    labels.set(feature.id, {polygon, label, check, selected: false});
  }}).addTo(map);
  const areaPane = map.createPane("areaOutlines");
  areaPane.style.zIndex = "410";
  areaPane.style.pointerEvents = "none";
  const overlays = L.layerGroup([L.geoJSON(data.areas, {pane: "areaOutlines", interactive: false, smoothFactor: 0,
    style: {className: "area-outline", color: "#463365", weight: 4, opacity: 1, fill: false}})]);
  const names = data.areas.features.map(feature => {
    const name = document.createElement("span");
    name.textContent = feature.properties.buurtnaam;
    return L.tooltip({permanent: true, interactive: false, className: "area-name", direction: "center"})
      .setLatLng(feature.properties.label).setContent(name);
  });
  for (const label of names) overlays.addLayer(label);

  function placeLabels() {
    const view = map.getContainer().getBoundingClientRect();
    const occupied = [pin.getElement().getBoundingClientRect(), frame.querySelector(".map-tools").getBoundingClientRect()];
    if (map.hasLayer(overlays)) {
      for (const name of names) occupied.push(name.getElement().getBoundingClientRect());
    }
    const overlap = (a, b) => a.left < b.right + 3 && a.right > b.left - 3 &&
      a.top < b.bottom + 3 && a.bottom > b.top - 3;
    const fit = (element, polygon, offsets) => {
      element.hidden = false;
      element.style.translate = "";
      const box = element.getBoundingClientRect();
      const path = polygon.getElement();
      const inverse = path.getScreenCTM()?.inverse();
      const offset = inverse && offsets.find(([x, y]) => {
        const rect = {left: box.left + x, top: box.top + y, right: box.right + x, bottom: box.bottom + y};
        if (rect.left < view.left || rect.top < view.top || rect.right > view.right ||
            rect.bottom > view.bottom - 20 || occupied.some(other => overlap(rect, other))) return false;
        if (![rect.left, rect.right].every(px => [rect.top, rect.bottom].every(py =>
          path.isPointInFill(new DOMPoint(px, py).matrixTransform(inverse))))) return false;
        occupied.push(rect);
        return true;
      });
      element.hidden = !offset;
      if (offset) element.style.translate = offset[0] + "px " + offset[1] + "px";
    };
    for (const {polygon, check, selected} of labels.values()) {
      check.hidden = !selected;
      if (selected) fit(check, polygon, [[0, 0]]);
    }
    for (const {polygon, label} of labels.values()) {
      fit(label, polygon, [[0, 0], [0, -16], [0, 16], [-20, 0], [20, 0]]);
    }
  }

  function setSelection(selected) {
    for (const [id, entry] of labels) {
      const checked = bands[id] === "direct" && selected.has(id);
      if (entry.selected === checked) continue;
      entry.selected = checked;
      entry.polygon.setStyle({color: checked ? "#362446" : "white", weight: checked ? 5 : 2});
      if (checked) entry.polygon.bringToFront();
    }
    placeLabels();
  }

  function draw(newBands) {
    bands = newBands;
    outline.setStyle(feature => ({fillColor: fills[bands[feature.id]]}));
    for (const [id, {polygon}] of labels) {
      polygon.getElement().dataset.wijk = id;
      polygon.getElement().classList.toggle("is-action", Boolean(onChoose && bands[id] !== "home"));
    }
    placeLabels();
  }

  function setOverlay(visible) {
    if (visible) overlays.addTo(map);
    else overlays.remove();
    bikeElement("areas").ariaPressed = String(visible);
    bikeElement("wijken").ariaPressed = String(!visible);
    placeLabels();
  }
  function fullscreen() {
    const expanded = frame.classList.toggle("is-expanded");
    document.body.classList.toggle("map-expanded", expanded);
    bikeElement("fullscreen").ariaPressed = String(expanded);
    bikeElement("fullscreen").textContent = expanded ? bikeWords().exit : bikeWords().fullscreen;
    map.invalidateSize();
  }
  bikeElement("areas").onclick = () => setOverlay(true);
  bikeElement("wijken").onclick = () => setOverlay(false);
  bikeElement("zoom-in").onclick = () => map.zoomIn();
  bikeElement("zoom-out").onclick = () => map.zoomOut();
  bikeElement("recenter").onclick = recenter;
  bikeElement("fullscreen").onclick = fullscreen;
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !document.querySelector("dialog[open]") && frame.classList.contains("is-expanded")) fullscreen();
  });
  map.on("moveend zoomend resize", placeLabels);
  new ResizeObserver(() => map.invalidateSize()).observe(map.getContainer());
  document.fonts.ready.then(placeLabels);
  return {draw, setSelection, setFixture(name) {
    center = data.times.profiles[name].center;
    pin.setLatLng(center);
    recenter();
  }};
}
