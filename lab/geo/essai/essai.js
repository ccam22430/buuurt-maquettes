"use strict";
const COPY = {
  NL: {
    language: "Taal", banner: "Demonstratie · je berichten zijn niet openbaar. Alle publicaties en capaciteit zijn gesimuleerd.",
    settings: "Testinstellingen", profile: "Winkelprofiel", capacityMode: "Capaciteitsscenario",
    normal: "Normaal", low: "Laag", missing: "Onbekend", enabled: "Gesponsorde campagnes inschakelen",
    revoke: "Trek de eerste buurtmachtiging in", revoked: "De ingetrokken buurt is uit de selectie verwijderd.",
    running: "Lopende testcampagne C‑001: wordt weergegeven.", publication: "Bericht publiceren",
    draft: "Concepttekst", saved: "Concept bewaard in deze browser.", storageError: "Concept bewaren is niet beschikbaar in deze browser.",
    choice: "Hoe wil je publiceren?", free: "Gratis publiceren", sponsored: "Gesponsorde campagne",
    preview: "Voorbeeld gratis bericht", confirmFree: "Bevestig gratis testpublicatie", back: "Terug",
    package: "Pakket", duration: "Duur in dagen (test)", home: "Gratis buurt", eligible: "Beschikbare buurten", blocked: "Geblokkeerd",
    capacity: "Beschikbare testvertoningen", unknown: "Capaciteit onbekend. Bevestigen is geblokkeerd.",
    insufficient: "Onvoldoende testcapaciteit voor dit pakket.", confirmSponsored: "Bevestig testcampagne",
    freeDone: "Gratis testpublicatie bevestigd.", sponsoredDone: "Testcampagne bevestigd.", empty: "Vul eerst een bericht in.",
    map: "Kaart met buurten", source: "Contouren CBS / Kadaster 2025 via PDOK (CC BY 4.0). Profielen en instellingen uitsluitend voor de test."
  },
  EN: {
    language: "Language", banner: "Demo · your posts are private. Publications and capacity are simulated.",
    settings: "Test settings", profile: "Shop profile", capacityMode: "Capacity scenario",
    normal: "Normal", low: "Low", missing: "Unknown", enabled: "Enable sponsored campaigns",
    revoke: "Revoke the first district permission", revoked: "The revoked district was removed from your selection.",
    running: "Existing test campaign C‑001: displaying.", publication: "Publish a post",
    draft: "Draft text", saved: "Draft saved in this browser.", storageError: "This browser could not save your draft.",
    choice: "How would you like to publish?", free: "Publish for free", sponsored: "Sponsored campaign",
    preview: "Free post preview", confirmFree: "Confirm free test publication", back: "Back",
    package: "Package", duration: "Duration in days (test)", home: "Free district", eligible: "Eligible districts", blocked: "Blocked",
    capacity: "Available test impressions", unknown: "Capacity is unknown. Confirmation is blocked.",
    insufficient: "This package exceeds the available test capacity.", confirmSponsored: "Confirm test campaign",
    freeDone: "Free test publication confirmed.", sponsoredDone: "Test campaign confirmed.", empty: "Enter a post first.",
    map: "District map", source: "CBS / Kadaster 2025 boundaries via PDOK (CC BY 4.0). Profiles and settings are for testing."
  },
  FR: {
    language: "Langue", banner: "Démonstration · vos annonces restent privées. Les publications et la capacité sont simulées.",
    settings: "Paramètres d’essai", profile: "Profil commerce", capacityMode: "Scénario de capacité",
    normal: "Normale", low: "Faible", missing: "Inconnue", enabled: "Activer le sponsoring",
    revoke: "Révoquer l’autorisation du premier quartier", revoked: "Le quartier révoqué a été retiré de ta sélection.",
    running: "Campagne d’essai C‑001 en cours : diffusion maintenue.", publication: "Publier une annonce",
    draft: "Texte du brouillon", saved: "Brouillon conservé dans ce navigateur.", storageError: "Ce navigateur n’a pas pu conserver le brouillon.",
    choice: "Comment souhaitez-vous publier ?", free: "Publier gratuitement", sponsored: "Campagne sponsorisée",
    preview: "Aperçu de l’annonce gratuite", confirmFree: "Confirmer la publication gratuite d’essai", back: "Retour",
    package: "Forfait", duration: "Durée en jours (essai)", home: "Quartier gratuit", eligible: "Quartiers éligibles", blocked: "Bloqué",
    capacity: "Impressions disponibles en essai", unknown: "Capacité inconnue. La confirmation est bloquée.",
    insufficient: "La capacité d’essai est insuffisante pour ce forfait.", confirmSponsored: "Confirmer la campagne d’essai",
    freeDone: "Publication gratuite d’essai confirmée.", sponsoredDone: "Campagne d’essai confirmée.", empty: "Saisis d’abord une annonce.",
    map: "Carte des quartiers", source: "Contours CBS / Kadaster 2025 via PDOK (CC BY 4.0). Profils et paramètres réservés à l’essai."
  }
};
const PACKAGES = [{ impressions: 500, euros: 15 }, { impressions: 1200, euros: 30 }, { impressions: 2500, euros: 50 }];
const KEY = "buuurt-geo06-local-v1";
const $ = id => document.getElementById(id);
const text = (id, value) => { $(id).textContent = value; };
const own = (object, key) => Object.hasOwn(object, key);
const makeDraft = profile => ({ body: "", selected: [...MAPS[profile].neighbors], package: 0, duration: 7, step: "entry" });
function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}
const saved = load();
const state = {
  lang: own(COPY, saved.lang) ? saved.lang : "NL",
  profile: own(MAPS, saved.profile) ? saved.profile : "amsterdam",
  enabled: saved.enabled === true,
  revoked: saved.revoked === true,
  capacityMode: ["normal", "low", "missing"].includes(saved.capacityMode) ? saved.capacityMode : "normal",
  drafts: Object.fromEntries(Object.keys(MAPS).map(key => [key, { ...makeDraft(key), ...saved.drafts?.[key] }]))
};
let notice = "";
let persisted = false;
function current() { return state.drafts[state.profile]; }
function t(key) { return COPY[state.lang][key]; }
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); persisted = true; }
  catch { persisted = false; }
}
function allowed(profile) {
  return MAPS[profile].neighbors.filter((_, index) => !state.revoked || index !== 0);
}
function normalize() {
  for (const profile of Object.keys(MAPS)) {
    const draft = state.drafts[profile];
    draft.body = typeof draft.body === "string" ? draft.body : "";
    draft.selected = [...new Set((Array.isArray(draft.selected) ? draft.selected : []).filter(code => allowed(profile).includes(code)))];
    draft.package = own(PACKAGES, draft.package) && Number.isInteger(draft.package) ? draft.package : 0;
    if (!["entry", "free", "sponsored"].includes(draft.step) || (!state.enabled && draft.step === "sponsored")) draft.step = "entry";
  }
}
function format(value) { return new Intl.NumberFormat(state.lang.toLowerCase()).format(value); }
function step() { return current().step === "entry" ? (state.enabled ? "choice" : "free") : current().step; }
function capacity() {
  const { duration, selected } = current();
  if (state.capacityMode === "missing") return null;
  if (!Number.isInteger(duration) || duration < 1 || duration > 30) return 0;
  const daily = state.capacityMode === "low" ? 2 : (state.profile === "amsterdam" ? 44 : 24);
  return daily * duration * (selected.length + 1);
}
function svg(tag) { return document.createElementNS("http://www.w3.org/2000/svg", tag); }
function toggle(code) {
  if (!state.enabled || !allowed(state.profile).includes(code)) return;
  const draft = current();
  draft.selected = draft.selected.includes(code)
    ? draft.selected.filter(value => value !== code) : [...draft.selected, code];
  update();
}
function renderMap() {
  const map = $("map");
  const list = $("districts");
  const restore = document.activeElement?.dataset?.district;
  const restoreTag = document.activeElement?.tagName;
  map.replaceChildren();
  list.replaceChildren();
  map.setAttribute("aria-label", t("map"));
  const profile = MAPS[state.profile];
  const active = allowed(state.profile);
  for (const district of profile.districts) {
    const eligible = active.includes(district.code);
    const checked = current().selected.includes(district.code);
    const shape = svg("path");
    shape.setAttribute("d", district.path);
    shape.setAttribute("fill-rule", "evenodd");
    shape.setAttribute("fill", district.code === profile.home ? "#a7d7a9" : (eligible ? (checked ? "#f1cf5a" : "#faf0c8") : "#d5d8da"));
    shape.dataset.district = district.code;
    const title = svg("title");
    title.textContent = district.name;
    shape.append(title);
    if (eligible) {
      shape.setAttribute("role", "button");
      shape.setAttribute("tabindex", "0");
      shape.setAttribute("aria-label", district.name);
      shape.setAttribute("aria-pressed", String(checked));
      shape.addEventListener("click", () => toggle(district.code));
      shape.addEventListener("keydown", event => {
        if (["Enter", " "].includes(event.key)) { event.preventDefault(); toggle(district.code); }
      });
    }
    map.append(shape);
    if (profile.neighbors.includes(district.code)) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = checked;
      input.disabled = !eligible;
      input.dataset.district = district.code;
      input.addEventListener("change", () => toggle(district.code));
      label.append(input, district.name);
      list.append(label);
    }
  }
  const marker = svg("circle");
  marker.setAttribute("cx", profile.point[0]);
  marker.setAttribute("cy", profile.point[1]);
  marker.setAttribute("r", "5");
  marker.setAttribute("fill", "#a90042");
  marker.setAttribute("pointer-events", "none");
  map.append(marker);
  if (restore) document.querySelector(restoreTag + '[data-district="' + restore + '"]')?.focus();
}
function renderCapacity() {
  const available = capacity();
  const enough = available !== null && available >= PACKAGES[current().package].impressions;
  text("capacity", available === null ? t("unknown") : t("capacity") + " · " + format(available)
    + (enough ? "" : " · " + t("insufficient")));
  $("confirmSponsored").disabled = !enough || !state.enabled;
}
function render() {
  const draft = current();
  document.documentElement.lang = state.lang.toLowerCase();
  document.querySelectorAll("[data-key]").forEach(node => { node.textContent = t(node.dataset.key); });
  $("lang").value = state.lang;
  $("profile").value = state.profile;
  $("enabled").checked = state.enabled;
  $("revoked").checked = state.revoked;
  $("capacityMode").value = state.capacityMode;
  $("draft").value = draft.body;
  $("duration").value = draft.duration;
  $("package").replaceChildren(...PACKAGES.map((item, index) => {
    const option = new Option(format(item.impressions) + " · " + item.euros + " €", index);
    return option;
  }));
  $("package").value = draft.package;
  const show = step();
  $("choice").hidden = show !== "choice";
  $("preview").hidden = show !== "free";
  $("campaign").hidden = show !== "sponsored";
  $("freeBack").hidden = !state.enabled;
  text("address", MAPS[state.profile].address);
  text("running", t("running"));
  text("listing", draft.body);
  text("draftStatus", persisted ? t("saved") : "");
  text("revocation", state.revoked ? t("revoked") : "");
  text("freeResult", show === "free" && notice ? t(notice) : "");
  text("sponsoredResult", show === "sponsored" && notice ? t(notice) : "");
  if (show === "sponsored") renderMap();
  renderCapacity();
}
function update() { notice = ""; normalize(); persist(); render(); }
$("enabled").onchange = event => {
  state.enabled = event.target.checked;
  current().step = "entry";
  update();
};
$("revoked").onchange = event => { state.revoked = event.target.checked; update(); };
$("capacityMode").onchange = event => { state.capacityMode = event.target.value; update(); };
$("profile").onchange = event => { state.profile = event.target.value; update(); };
$("lang").onchange = event => { state.lang = event.target.value; update(); };
$("draft").oninput = event => {
  current().body = event.target.value;
  persist();
  text("draftStatus", persisted ? t("saved") : t("storageError"));
  text("listing", current().body);
};
$("package").onchange = event => { current().package = Number(event.target.value); update(); };
$("duration").onchange = event => { current().duration = Number(event.target.value); update(); };
$("free").onclick = () => { current().step = "free"; update(); };
$("sponsored").onclick = () => { if (state.enabled) { current().step = "sponsored"; update(); } };
$("back").onclick = $("freeBack").onclick = () => { current().step = "entry"; update(); };
$("confirmFree").onclick = () => {
  if (step() !== "free") return;
  notice = current().body.trim() ? "freeDone" : "empty";
  render();
};
$("confirmSponsored").onclick = () => {
  if (!state.enabled || step() !== "sponsored") return;
  normalize();
  const available = capacity();
  if (available === null || available < PACKAGES[current().package].impressions) return;
  notice = current().body.trim() ? "sponsoredDone" : "empty";
  render();
};
normalize();
persist();
render();
