"use strict";

const fixture = bikeUrl.searchParams.get("fixture") || "dolores";
const ad = extensionAd(bikeUrl);
const scope = extensionDraftScope(bikeProfile, fixture, ad);
const actor = extensionActor(fixture);
const zone = bikeUrl.searchParams.get("zone");
const commentScope = scope + ":extension:" + zone;
const reason = bikeElement("reason");
const form = bikeElement("extension-form");
const status = bikeElement("extension-status");
const back = bikeElement("extension-back");
const requestedReceipt = bikeUrl.searchParams.get("receipt");
let receipt;
let geography;
let evidence;

function updateReturn() {
  const destination = new URL("com-pub-spon-003.html", bikeUrl);
  destination.searchParams.set("lang", bikeLanguage.value);
  destination.searchParams.set("fixture", fixture);
  destination.searchParams.set("v", "geo-auto-1");
  if (ad) destination.searchParams.set("ad", ad);
  back.href = destination;
  bikeElement("extension-requests").href = extensionLink(fixture, bikeLanguage.value, {ad});
  reason.placeholder = bikeWords().example;
  translateGeoAuto(bikeLanguage.value);
  if (receipt) {
    bikeElement("extension-title").textContent = geoAutoWords(bikeLanguage.value).autoTitle;
    back.hidden = true;
  }
}
updateReturn();
translateBike();
installExtensionBell(actor, () => bikeLanguage.value, ad);
bikeLanguageChange(updateReturn);
bikeElement("menu").onclick = () => bikeElement("campaign-menu").showModal();

reason.oninput = () => writeSponsorDraft({reason: reason.value}, commentScope);
form.onsubmit = async event => {
  event.preventDefault();
  const text = reason.value.trim();
  if (!text) return;
  const draft = readSponsorDraft(scope);
  if (draft.bands?.[zone] !== "other") return;
  const requests = new Map(Array.isArray(draft.requests) ? draft.requests : []);
  const submit = form.querySelector("button[type=submit]");
  if (submit.disabled) return;
  submit.disabled = true;
  let submitted;
  try {
    submitted = await geoAutoSerialize(() => {
      const config = readBikeConfig(localStorage);
      const settings = resolveBikeThresholds(config, "amsterdam", fixture);
      const base = geography ? classifyBikeSeconds(geography.profiles?.[fixture]?.wijken?.[zone]?.seconds, settings) : draft.bands?.[zone];
      const band = extensionAuthorized(localStorage, fixture, ad).has(zone) ? "direct" : base;
      const assessment = geoAutoEvaluate(evidence, geography, fixture, zone, settings.standard,
        config.global.extension);
      return extensionSubmit(localStorage, actor, {zone, name: bikeElement("district-name").textContent,
        note: text, ad, band, evidence: assessment});
    });
  } catch {
    submit.disabled = false;
    status.textContent = bikeWords().invalid;
    return;
  }
  if (!submitted.duplicate) requests.set(zone, text);
  const automatic = !submitted.duplicate && submitted.status === "accepted";
  const changes = {requests: [...requests]};
  if (automatic) {
    changes.selected = [...new Set([...(readSponsorDraft(scope).selected || []), zone])];
    changes.extensionReceipt = submitted.id;
  }
  if (!writeSponsorDraft(changes, scope)) {
    submit.disabled = false;
    status.textContent = bikeWords().storageError;
    return;
  }
  writeSponsorDraft({reason: null}, commentScope);
  if (automatic) {
    bikeUrl.searchParams.set("receipt", submitted.id);
    history.replaceState(null, "", bikeUrl);
    showReceipt(submitted);
    return;
  }
  const destination = new URL(back.href);
  destination.searchParams.set("extension", submitted.duplicate ? "duplicate" : "sent");
  location.replace(destination);
};

function showReceipt(record) {
  receipt = record;
  form.hidden = true;
  bikeElement("district-name").textContent = record.zoneName;
  bikeElement("extension-confirmation").hidden = false;
  updateReturn();
  const heading = bikeElement("extension-title");
  heading.tabIndex = -1;
  heading.focus();
}

function returnFromReceipt(remove) {
  const current = readSponsorDraft(scope);
  const selected = Array.isArray(current.selected) ? current.selected : [];
  if (!writeSponsorDraft({extensionReceipt: null,
    selected: remove ? selected.filter(id => id !== receipt.zone) : selected}, scope)) {
    status.textContent = bikeWords().storageError;
    return;
  }
  location.replace(back.href);
}
bikeElement("auto-keep").onclick = () => returnFromReceipt(false);
bikeElement("auto-remove").onclick = () => returnFromReceipt(true);

async function showExtensionForm() {
  const draft = readSponsorDraft(scope);
  const confirmed = requestedReceipt && draft.extensionReceipt === requestedReceipt &&
    extensionRecords(localStorage).find(record => record.id === requestedReceipt && record.zone === zone &&
      record.ad === ad && extensionOwns(actor, record) && record.status === "accepted" &&
      record.events.some(item => item.origin === "automatic"));
  if (confirmed) {
    showReceipt(confirmed);
    return;
  }
  if (!actor || !zone || draft.bands?.[zone] !== "other") throw new Error("zone");
  const [response] = await Promise.all([fetch("data/amsterdam-levels-wijken.geojson"),
    fetch("data/amsterdam-bike-times.json").then(response => response.ok ? response.json() : null)
      .then(value => { geography = value; }).catch(() => {}),
    loadGeoAutoEvidence().then(value => { evidence = value; })]);
  if (!response.ok) throw new Error("geography");
  const {features} = await response.json();
  const feature = features.find(({id}) => id === zone);
  if (!feature) throw new Error("zone");
  bikeElement("district-name").textContent = feature.properties.buurtnaam;
  const requests = new Map(Array.isArray(draft.requests) ? draft.requests : []);
  reason.value = readSponsorDraft(commentScope).reason ?? requests.get(zone) ?? "";
  form.hidden = false;
}
showExtensionForm().catch(() => { status.textContent = bikeWords().error; });
