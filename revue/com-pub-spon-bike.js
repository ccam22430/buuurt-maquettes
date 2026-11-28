"use strict";

const bikeCampaignId = bikeUrl.searchParams.get("campaign");
const bikeLocked = readBikeCampaign(localStorage, bikeCampaignId);
const bikeDialog = bikeElement("extension-dialog");
const bikeRequests = new Map();
let bikeData, bikeFixture, bikeSettings, bikeNetwork, bands, selected, view, active;
const checkboxControls = new Map();

function bikeScope() {
  return sponsorDraftScope(bikeProfile) + ":" + bikeFixture;
}

function persistBikeDraft() {
  return writeSponsorDraft({selected: [...selected], requests: [...bikeRequests], bands,
    thresholds: bikeSettings, fixture: bikeFixture, network: bikeNetwork}, bikeScope());
}

function chooseBikeNeighborhood(feature) {
  if (bikeLocked) return;
  const id = feature.id;
  if (bands[id] === "direct") {
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    for (const {button, icon} of checkboxControls.get(id) || []) syncBikeControl(button, icon, id);
    persistBikeDraft();
  }
  if (bands[id] !== "other") return;
  active = id;
  bikeElement("district-name").textContent = feature.properties.buurtnaam;
  bikeElement("reason").value = bikeRequests.get(id) || "";
  bikeElement("extension-form").hidden = true;
  bikeElement("extend").hidden = false;
  bikeDialog.showModal();
}

function syncBikeControl(button, icon, id) {
  const checked = selected.has(id);
  button.ariaChecked = String(checked);
  button.dataset.selected = String(checked);
  if (icon) icon.textContent = checked ? "✓" : "";
}

function makeBikeControl(feature, band, inMap) {
  const checkbox = band === "direct";
  const action = checkbox || (!inMap && band === "other" && !bikeLocked);
  const label = document.createElement(action ? "button" : "span");
  const name = document.createElement("span");
  name.textContent = feature.properties.buurtnaam;
  if (action) {
    label.type = "button";
    label.onclick = () => chooseBikeNeighborhood(feature);
  }
  if (checkbox) {
    label.role = "checkbox";
    label.ariaLabel = feature.properties.buurtnaam;
    label.disabled = Boolean(bikeLocked);
  } else if (action) label.ariaHasPopup = "dialog";
  let icon;
  if (inMap) label.append(name);
  else {
    label.classList.add("zone-row");
    label.dataset.band = band;
    const swatch = document.createElement("span");
    swatch.className = "zone-swatch";
    swatch.ariaHidden = "true";
    label.append(swatch);
    if (checkbox) {
      icon = document.createElement("span");
      icon.className = "zone-check";
      icon.ariaHidden = "true";
      label.append(icon);
    }
    const caption = document.createElement("small");
    caption.className = "zone-status";
    caption.textContent = bikeWords()[band];
    name.append(caption);
    label.append(name);
  }
  if (checkbox) {
    if (!checkboxControls.has(feature.id)) checkboxControls.set(feature.id, []);
    checkboxControls.get(feature.id).push({button: label, icon});
    syncBikeControl(label, icon, feature.id);
  }
  return label;
}

function renderBikeList() {
  const container = bikeElement("district-list");
  const opened = new Set([...container.querySelectorAll("details[open]")].map(el => el.dataset.group));
  const hadGroups = container.children.length > 0;
  const ring = {home: 0, direct: 1, other: 2};
  const scores = bikeData.times.profiles[bikeFixture].wijken;
  const areaGroups = [...bikeData.areas.features, null].map(area => {
    const id = area?.id || null;
    const children = bikeData.wijken.features.filter(wijk => wijk.properties.parent === id).sort((a, b) =>
      ring[bands[a.id]] - ring[bands[b.id]] || (scores[a.id].seconds ?? Infinity) - (scores[b.id].seconds ?? Infinity) ||
      a.properties.buurtnaam.localeCompare(b.properties.buurtnaam, "nl"));
    return {id, name: area?.properties.buurtnaam || bikeWords().unassigned, children};
  }).filter(group => group.children.length);
  areaGroups.sort((a, b) => ring[bands[a.children[0].id]] - ring[bands[b.children[0].id]] ||
    (scores[a.children[0].id].seconds ?? Infinity) - (scores[b.children[0].id].seconds ?? Infinity) ||
    a.name.localeCompare(b.name, "nl"));
  container.replaceChildren();
  for (const group of areaGroups) {
    const el = document.createElement("details");
    el.dataset.group = group.id || "unassigned";
    el.open = hadGroups ? opened.has(el.dataset.group) : group.children.some(child => bands[child.id] === "home");
    const title = document.createElement("summary");
    title.textContent = group.name;
    el.append(title, ...group.children.map(feature => makeBikeControl(feature, bands[feature.id], false)));
    container.append(el);
  }
}

function refreshBike() {
  const note = bikeElement("fixture-note");
  note.hidden = bikeFixture === "dolores";
  note.textContent = bikeFixtureNames()[bikeFixture];
  bikeElement("campaign-lock").hidden = !bikeLocked;
  checkboxControls.clear();
  view.draw(bands);
  renderBikeList();
}

async function startBike() {
  if (bikeCampaignId && !bikeLocked) {
    bikeFailure(bikeWords().campaignMissing);
    return;
  }
  bikeData = await loadBikeData();
  const request = bikeLocked?.fixture || bikeUrl.searchParams.get("fixture");
  bikeFixture = Object.hasOwn(bikeData.times.profiles, request) ? request : "dolores";
  bikeSettings = bikeLocked?.thresholds || resolveBikeThresholds(readBikeConfig(localStorage), "amsterdam", bikeFixture);
  bikeNetwork = bikeLocked?.network || bikeData.times.version;
  bands = bikeLocked?.bands || bikeBands(bikeData, bikeFixture, bikeSettings);
  const draft = readSponsorDraft(bikeScope());
  const previous = bikeLocked?.selected || draft.selected;
  selected = new Set(Array.isArray(previous) ? previous.filter(id => bands[id] === "direct") : []);
  for (const [id, reason] of Array.isArray(draft.requests) ? draft.requests : []) bikeRequests.set(id, reason);
  view = createBikeMap(bikeData, bikeFixture, bikeLocked ? null : chooseBikeNeighborhood, makeBikeControl);
  refreshBike();
  bikeElement("map-status").textContent = "";
  if (!bikeLocked) bikeElement("continue").disabled = false;
}

bikeElement("menu").onclick = () => bikeElement("campaign-menu").showModal();
bikeElement("extend").onclick = () => {
  bikeElement("extension-form").hidden = false;
  bikeElement("extend").hidden = true;
  bikeElement("reason").focus();
};
bikeElement("extension-form").onsubmit = event => {
  event.preventDefault();
  const reason = bikeElement("reason").value.trim();
  if (!reason || bikeLocked) return;
  bikeRequests.set(active, reason);
  const saved = persistBikeDraft();
  bikeElement("message").textContent = saved ? bikeWords().saved : bikeWords().storageError;
  if (saved) bikeDialog.close();
};
bikeElement("continue").onclick = () => {
  if (bikeLocked || !persistBikeDraft()) return;
  const next = new URL("com-pub-spon-package.html", bikeUrl);
  next.searchParams.set("demo", bikeProfile);
  next.searchParams.set("fixture", bikeFixture);
  next.searchParams.set("lang", bikeLanguage.value);
  const id = crypto.randomUUID();
  const draft = readSponsorDraft(bikeScope());
  if (!writeSponsorDraft(draft, bikeScope() + ":" + id)) return;
  next.searchParams.set("draft", id);
  location.assign(next);
};
translateBike();
bikeElement("map-status").textContent = bikeWords().loading;
bikeLanguageChange(() => { if (view) refreshBike(); });
startBike().catch(() => bikeFailure());
