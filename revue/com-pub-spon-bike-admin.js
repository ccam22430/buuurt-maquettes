"use strict";

let settings = {...readBikeConfig(localStorage).global};
let data, mapView, autoEvidence;
const autoPreview = bikeElement("auto-preview");
const autoFields = ["percent", "metres", "addresses"];
const adminWorkspace = bikeElement("admin-workspace");
const fixture = bikeElement("fixture");
const status = bikeElement("map-status");
const local = bikeElement("local");
const standard = bikeElement("standard");
const sessionActor = () => sessionStorage.getItem(bikeAdminKey) === bikeAdmin.id ? bikeAdmin : null;

function showHistory() {
  const history = readBikeConfig(localStorage).history;
  const list = bikeElement("geo-history");
  list.replaceChildren();
  if (!history.length) list.textContent = bikeWords().emptyHistory;
  for (const row of history) {
    const item = document.createElement("li");
    const date = new Intl.DateTimeFormat(bikeLanguage.value, {dateStyle: "medium", timeStyle: "medium",
      timeZone: "Europe/Amsterdam"}).format(new Date(row.at));
    item.textContent = [date, row.admin, row.scope,
      [row.before, row.after].map(value => {
        const {percent, metres, addresses} = value.extension || geoAutoDefaults;
        return value.local + "/" + value.standard + " min · " + percent + "% · " + metres + " m · " + addresses;
      }).join(" → ")].join(" · ");
    list.append(item);
  }
}

function preview() {
  local.min = bikeMin;
  local.max = settings.standard - 1;
  standard.min = settings.local + 1;
  standard.max = bikeMax;
  local.value = settings.local;
  standard.value = settings.standard;
  bikeElement("local-value").value = settings.local + " min";
  bikeElement("standard-value").value = settings.standard + " min";
  for (const key of autoFields) bikeElement("auto-" + key).value = (settings.extension || geoAutoDefaults)[key];
  if (mapView) {
    mapView.draw(bikeBands(data, fixture.value, settings));
    previewAuto();
  }
}

function previewAuto() {
  const words = geoAutoWords(bikeLanguage.value);
  const bands = bikeBands(data, fixture.value, settings);
  const rows = data.wijken.features.filter(({id}) => bands[id] === "other").map(feature => {
    const result = geoAutoEvaluate(autoEvidence, data.times, fixture.value, feature.id, settings.standard, settings.extension);
    const item = document.createElement("li");
    const {metres, percent, addresses} = result.metrics;
    item.textContent = [feature.properties.buurtnaam, words[result.outcome], metres !== null ? metres + " m" : "—",
      percent !== null ? new Intl.NumberFormat(bikeLanguage.value, {maximumFractionDigits: 1}).format(percent) + "%" : "—",
      addresses ?? "—"].join(" · ");
    return item;
  });
  autoPreview.replaceChildren(...rows);
}

for (const key of autoFields) bikeElement("auto-" + key).oninput = () => {
  settings.extension = Object.fromEntries(autoFields.map(field => [field, bikeElement("auto-" + field).valueAsNumber]));
  if (data) previewAuto();
};

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
  try {
    [data, autoEvidence] = await Promise.all([loadBikeData(), loadGeoAutoEvidence()]);
    mapView = createBikeMap(data, fixture.value);
    preview();
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
local.oninput = () => {
  settings = {...settings, local: Number(local.value)};
  preview();
};
standard.oninput = () => {
  settings = {...settings, standard: Number(standard.value)};
  preview();
};
fixture.onchange = () => {
  mapView?.setFixture(fixture.value);
  preview();
};
bikeElement("cancel-geo").onclick = () => {
  settings = {...readBikeConfig(localStorage).global};
  preview();
  status.textContent = bikeWords().cancelledGeo;
};
bikeElement("reset-geo").onclick = () => {
  settings = {...bikeDefaults};
  preview();
  status.textContent = bikeWords().resetGeo;
};
bikeElement("geo-settings").onsubmit = event => {
  event.preventDefault();
  if (!mapView) return;
  try {
    saveBikeConfig(sessionActor(), settings, localStorage);
    showHistory();
    status.textContent = bikeWords().savedGeo;
  } catch {
    status.textContent = bikeWords().configError;
  }
};
bikeElement("menu").onclick = () => bikeElement("campaign-menu").showModal();
translateBike();
translateGeoAuto(bikeLanguage.value);
bikeLanguageChange(() => {
  fillFixtures();
  translateGeoAuto(bikeLanguage.value);
  if (data) previewAuto();
  showHistory();
});
if (sessionActor()) openAdmin();
