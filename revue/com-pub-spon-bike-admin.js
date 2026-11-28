"use strict";

let settings;
const radiusScope = bikeElement("radius-scope");
let data, mapView, previewRevision = 0;
const uplift = bikeElement("network-uplift");
const adminWorkspace = bikeElement("admin-workspace");
const fixture = bikeElement("fixture");
const status = bikeElement("map-status");
const local = bikeElement("local");
const standard = bikeElement("standard");
const sessionActor = () => sessionStorage.getItem(bikeAdminKey) === bikeAdmin.id ? bikeAdmin : null;

function showHistory() {
  const history = readRadiusConfig(localStorage).history;
  const list = bikeElement("geo-history");
  list.replaceChildren();
  if (!history.length) list.textContent = bikeWords().emptyHistory;
  for (const row of history) {
    const item = document.createElement("li");
    const date = new Intl.DateTimeFormat(bikeLanguage.value, {dateStyle: "medium", timeStyle: "medium",
      timeZone: "Europe/Amsterdam"}).format(new Date(row.at));
    item.textContent = [date, row.admin, row.scope,
      [row.before,row.after].map(value => value.local / 1000 + "/" + value.standard / 1000 + " km").join(" → ")].join(" · ");
    list.append(item);
  }
}

function showInputs() {
  local.min = 0.001;
  local.max = (settings.standard - 1)/1000;
  standard.min = (settings.local + 1)/1000;
  standard.max = (radiusMaximum - 1)/1000;
  local.value = settings.local/1000;
  standard.value = settings.standard/1000;
  uplift.value = readBikeConfig(localStorage).global.uplift ?? 50;
  bikeElement("network-uplift-label").textContent = networkWords(bikeLanguage.value).uplift;
  preview();
}
function preview() {
  bikeElement("local-value").value = local.value + " km";
  bikeElement("standard-value").value = standard.value + " km";
  if (mapView && validRadius(settings)) mapView.drawNetwork(radiusBands(data.times.profiles[fixture.value], data.wijken.features, settings));
}
function loadSettings() {
  const city = radiusScope.value === "rural" ? "rural-demo" : "amsterdam";
  const shop = radiusScope.value === "shops" ? fixture.value : null;
  settings = {...radiusSettings(localStorage, city, shop, radiusScope.value === "rural" ? "rural" : "urban")};
  showInputs();
}
function translateScope() {
  const selected = radiusScope.value || "cities";
  const words = {fr:["Rayons appliqués à","Amsterdam · ville","Commerce de référence","Profil rural de recette"],
    nl:["Stralen voor","Amsterdam · stad","Referentiezaak","Landelijk testprofiel"],
    en:["Apply radii to","Amsterdam · city","Reference business","Rural review profile"]}[bikeLanguage.value];
  bikeElement("radius-scope-label").textContent = words[0];
  radiusScope.replaceChildren(...["cities","shops","rural"].map((key,index)=>new Option(words[index+1],key)));
  radiusScope.value = selected;
}

function fillFixtures() {
  const current = fixture.value;
  fixture.replaceChildren(...Object.entries(bikeFixtureNames()).map(([id, name]) => new Option(name, id)));
  if (Object.hasOwn(bikeFixtureNames(), current)) fixture.value = current;
}

async function openAdmin() {
  if (!sessionActor() || mapView) return;
  installExtensionBell(extensionAdmin(sessionStorage), () => bikeLanguage.value);
  bikeElement("extension-requests").href = extensionLink(null, bikeLanguage.value, {admin: true});
  bikeElement("demo-admin").hidden = true;
  adminWorkspace.hidden = false;
  bikeElement("save-geo").disabled = true;
  status.textContent = bikeWords().loading;
  showHistory();
  fillFixtures();
  translateScope();
  try {
    data = await loadBikeData();
    mapView = createBikeMap(data, fixture.value);
    loadSettings();
    status.textContent = "";
    bikeElement("save-geo").disabled = false;
  } catch {
    bikeFailure();
  }
}

bikeElement("demo-admin").onclick = () => {
  try {
    sessionStorage.setItem(bikeAdminKey, bikeAdmin.id);
    openAdmin();
  } catch {
    status.textContent = bikeWords().configError;
  }
};
local.oninput = standard.oninput = () => {
  settings = {local:Math.round(local.valueAsNumber*1000),standard:Math.round(standard.valueAsNumber*1000)};
  preview();
};
fixture.onchange = () => { mapView?.setFixture(fixture.value); loadSettings(); };
radiusScope.onchange = loadSettings;
bikeElement("cancel-geo").onclick = () => {loadSettings();status.textContent = bikeWords().cancelledGeo;};
bikeElement("reset-geo").onclick = () => {
  settings = {...radiusDefaults[radiusScope.value === "rural" ? "rural" : "urban"]};
  showInputs();
  status.textContent = bikeWords().resetGeo;
};
bikeElement("geo-settings").onsubmit = event => {
  event.preventDefault();
  if (!mapView) return;
  try {
    const scope = radiusScope.value;
    saveRadiusConfig(sessionActor(), localStorage, scope === "shops" ? "shops" : "cities",
      scope === "shops" ? fixture.value : scope === "rural" ? "rural-demo" : "amsterdam", settings);
    saveBikeConfig(sessionActor(), {...readBikeConfig(localStorage).global,uplift:uplift.valueAsNumber}, localStorage);
    showHistory();
    status.textContent = bikeWords().savedGeo;
  } catch { status.textContent = bikeWords().configError; }
};
bikeElement("menu").onclick = () => bikeElement("campaign-menu").showModal();
translateBike();
bikeLanguageChange(() => {
  fillFixtures();
  translateScope();
  showHistory();
  showInputs();
});
if (sessionActor()) openAdmin();
