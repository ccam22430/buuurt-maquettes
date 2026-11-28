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

function updateReturn() {
  const destination = new URL("com-pub-spon-003.html", bikeUrl);
  destination.searchParams.set("lang", bikeLanguage.value);
  destination.searchParams.set("fixture", fixture);
  destination.searchParams.set("v", "extension-page-20261128");
  if (ad) destination.searchParams.set("ad", ad);
  back.href = destination;
  bikeElement("extension-requests").href = extensionLink(fixture, bikeLanguage.value, {ad});
  reason.placeholder = bikeWords().example;
}
updateReturn();
translateBike();
installExtensionBell(actor, () => bikeLanguage.value, ad);
bikeLanguageChange(updateReturn);
bikeElement("menu").onclick = () => bikeElement("campaign-menu").showModal();

reason.oninput = () => writeSponsorDraft({reason: reason.value}, commentScope);
form.onsubmit = event => {
  event.preventDefault();
  const text = reason.value.trim();
  if (!text) return;
  const draft = readSponsorDraft(scope);
  if (draft.bands?.[zone] !== "other") return;
  const requests = new Map(Array.isArray(draft.requests) ? draft.requests : []);
  let submitted;
  try {
    submitted = extensionSubmit(localStorage, actor, {zone, name: bikeElement("district-name").textContent,
      note: text, ad, band: extensionApply(draft.bands, localStorage, fixture, ad)[zone]});
  } catch {
    status.textContent = bikeWords().invalid;
    return;
  }
  if (!submitted.duplicate) requests.set(zone, text);
  if (!writeSponsorDraft({requests: [...requests]}, scope)) {
    status.textContent = bikeWords().storageError;
    return;
  }
  writeSponsorDraft({reason: null}, commentScope);
  const destination = new URL(back.href);
  destination.searchParams.set("extension", submitted.duplicate ? "duplicate" : "sent");
  location.replace(destination);
};

async function showExtensionForm() {
  const draft = readSponsorDraft(scope);
  if (!actor || !zone || draft.bands?.[zone] !== "other") throw new Error("zone");
  const response = await fetch("data/amsterdam-levels-wijken.geojson");
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
