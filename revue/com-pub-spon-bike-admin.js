"use strict";

let settings = {...readBikeConfig(localStorage).global};
let data, mapView;
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
      row.before.local + "/" + row.before.standard + " → " + row.after.local + "/" + row.after.standard + " min"].join(" · ");
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
  if (mapView) mapView.draw(bikeBands(data, fixture.value, settings));
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
  try {
    data = await loadBikeData();
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
bikeLanguageChange(() => {
  fillFixtures();
  showHistory();
});
if (sessionActor()) openAdmin();
