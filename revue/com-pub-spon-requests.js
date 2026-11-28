"use strict";

const requestAdmin = bikeUrl.searchParams.get("role") === "admin";
const requestFixture = bikeUrl.searchParams.get("fixture") || "dolores";
const requestId = bikeUrl.searchParams.get("request");
const requestAd = extensionAd(bikeUrl);
const requestStatus = bikeElement("request-status");
const requestFilter = bikeElement("request-filter");
const requestForm = bikeElement("request-action");
const requestDecision = bikeElement("request-decision");
const requestScope = bikeElement("request-scope");
const requestUntil = bikeElement("request-until");
const actorForRequest = () => requestAdmin ? extensionAdmin(sessionStorage) : extensionActor(requestFixture);
const statuses = ["pending", "clarify", "accepted", "refused", "revoked"];
let displayed;
let pressMap;
let mapData;
let mapLoading = false;

function dateText(value) {
  return new Intl.DateTimeFormat(bikeLanguage.value, {dateStyle: "medium", timeStyle: "short",
    timeZone: "Europe/Amsterdam"}).format(new Date(value));
}
function ownRequests() {
  const actor = actorForRequest();
  return actor ? extensionRecords(localStorage).filter(record => requestAdmin || extensionOwns(actor, record)) : [];
}
function renderRequestList(requests) {
  const words = {...bikeWords(), ...geoAutoWords(bikeLanguage.value)};
  bikeElement("request-count").textContent = requestAdmin ? words.actionCount + " : " +
    requests.filter(r => r.status === "pending").length : "";
  const filter = requestFilter.value;
  requestFilter.replaceChildren(new Option(words.all, ""), ...statuses.map(s => new Option(words[s], s)));
  requestFilter.value = filter;
  const items = bikeElement("request-items");
  items.replaceChildren();
  for (const record of requests.filter(r => !filter || r.status === filter)) {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = extensionLink(requestFixture, bikeLanguage.value, {admin: requestAdmin, id: record.id, ad: requestAd});
    link.textContent = [record.zoneName, record.name, words[record.status], dateText(record.created)].join(" · ");
    li.append(link);
    items.append(li);
  }
  if (!items.children.length) {
    const li = document.createElement("li");
    li.textContent = words.empty;
    items.append(li);
  }
}

let requestNetwork;
let requestNetworkRevision = 0;
const requestKind = bikeElement("network-kind");
const requestMinutes = bikeElement("network-minutes");
function requestThresholds(record) {
  return resolveBikeThresholds(readBikeConfig(localStorage), "amsterdam", record.fixture);
}
function previewRequestMap() {
  const record = displayed;
  if (!record || !requestNetwork || !pressMap) return;
  const settings = requestThresholds(record);
  const grants = networkGrants(localStorage, record.fixture, record.ad);
  const base = networkBands(requestNetwork, mapData.wijken.features, settings, grants);
  const minutes = requestMinutes.valueAsNumber;
  const preview = requestAdmin && record.status === "pending" && requestDecision.value === "accepted" &&
    Number.isInteger(minutes) && minutes > settings.standard && minutes <= zoneMax;
  const proposed = preview ? networkBands(requestNetwork, mapData.wijken.features, settings,
    [...grants, {kind:requestKind.value, minutes, zone:record.zone}]) : base;
  const total = result => result.layers.reduce((sum, layer) => sum +
    (layer.properties.category === "extended" ? layer.properties.surface : 0), 0);
  bikeElement("network-surface").textContent = preview ?
    networkWords(bikeLanguage.value).addedSurface + " · " +
      new Intl.NumberFormat(bikeLanguage.value, {maximumFractionDigits:2}).format((total(proposed)-total(base))/1e6) + " km²" : "";
  pressMap.drawNetwork(proposed);
}

async function renderRequestMap(record) {
  const revision = ++requestNetworkRevision;
  try {
    mapData ||= await loadBikeData();
    const data = await loadNetworkZones(record.fixture, mapData.times);
    if (revision !== requestNetworkRevision) return;
    requestNetwork = data;
    if (!pressMap) pressMap = createBikeMap(mapData, record.fixture);
    else pressMap.setFixture(record.fixture);
    previewRequestMap();
    pressMap.highlight(record.zone);
  } catch {
    if (revision === requestNetworkRevision) {
      requestNetwork = null;
      requestStatus.textContent = bikeWords().error;
    }
  }
}

function renderRequestDetail(record) {
  const words = {...bikeWords(), ...geoAutoWords(bikeLanguage.value)};
  displayed = record;
  const geo = networkWords(bikeLanguage.value);
  const previousKind = requestKind.value;
  requestKind.replaceChildren(new Option(geo.targeted, "targeted"), new Option(geo.global, "global"));
  requestKind.value = previousKind || "targeted";
  requestMinutes.min = requestThresholds(record).standard + 1;
  bikeElement("network-minutes-label").textContent = geo.minutes;
  bikeElement("request-zone").textContent = record.zoneName;
  const mapLink = bikeElement("request-map-link");
  const mapUrl = new URL("com-pub-spon-003.html", bikeUrl);
  mapUrl.searchParams.set("lang", bikeLanguage.value);
  mapUrl.searchParams.set("fixture", record.fixture);
  if (record.ad || requestAd) mapUrl.searchParams.set("ad", record.ad || requestAd);
  mapLink.href = mapUrl.href;
  mapLink.hidden = requestAdmin || record.status !== "accepted" ||
    !extensionAuthorized(localStorage, record.fixture, record.ad || requestAd).has(record.zone);
  const auth = record.authorization;
  const expiry = auth?.until && Date.parse(auth.until) <= Date.now();
  const info = [record.name, record.address, record.category, dateText(record.created), words[record.status]];
  if (auth) info.push(words[auth.scope], ...(auth.kind ? [geo[auth.kind], auth.minutes + " min", auth.network] : []), ...(auth.until ? [dateText(auth.until)] : []), ...(expiry ? [words.expired] : []));
  bikeElement("request-info").textContent = info.join(" · ");
  const events = bikeElement("request-history");
  events.replaceChildren();
  for (const event of record.events) {
    const row = document.createElement("li");
    row.textContent = [event.origin === "automatic" ? words.autoOrigin : words[event.type], dateText(event.at), event.actor, event.message].filter(Boolean).join(" · ");
    events.append(row);
  }
  if (requestAdmin && record.assessment) {
    const row = document.createElement("li");
    const {outcome, standard, version, metrics, criteria} = record.assessment;
    row.textContent = [words[outcome], version || "—", standard + " min",
      (metrics.metres ?? "—") + "/" + (metrics.totalMetres ?? "—") + " m", metrics.addresses ?? "—",
      criteria.percent + "% / " + criteria.metres + " m / " + criteria.addresses].join(" · ");
    events.append(row);
  }
  const revocable = requestAdmin && record.status === "accepted";
  const canRespond = requestAdmin ? record.status === "pending" || revocable : record.status === "clarify";
  requestForm.hidden = !canRespond;
  requestDecision.hidden = !requestAdmin;
  bikeElement("request-decision-label").hidden = !requestAdmin;
  const decision = requestDecision.value;
  requestDecision.replaceChildren(...(revocable ? [new Option(words.revoke, "revoked")] : ["accepted", "refused", "clarify"].map(value => new Option(words[value], value))));
  requestDecision.value = revocable ? "revoked" : decision === "revoked" ? "accepted" : decision || "accepted";
  const scope = requestScope.value;
  requestScope.replaceChildren(...["shop", "ad", "until"].map(value => {
    const opt = new Option(words[value], value);
    opt.disabled = value === "ad" && !record.ad;
    return opt;
  }));
  requestScope.value = scope || "shop";
  bikeElement("request-submit").textContent = requestAdmin ? words.decide : words.answer;
  updateRequestFields();
  renderRequestMap(record);
}

function updateRequestFields() {
  const accepting = requestAdmin && requestDecision.value === "accepted";
  bikeElement("request-authorization").hidden = !accepting;
  requestUntil.hidden = !accepting || requestScope.value !== "until";
  bikeElement("request-until-label").hidden = requestUntil.hidden;
  requestUntil.required = !requestUntil.hidden;
  bikeElement("request-reply").required = !accepting;
  requestMinutes.required = accepting;
  previewRequestMap();
}

function renderRequests() {
  translateBike();
  const actor = actorForRequest();
  const words = {...bikeWords(), ...geoAutoWords(bikeLanguage.value)};
  const back = bikeElement("request-back");
  const url = requestId ? extensionLink(requestFixture, bikeLanguage.value, {admin: requestAdmin, ad: requestAd}) :
    new URL(requestAdmin ? "adm-geo-003.html" : "com-pub-spon-003.html", bikeUrl);
  if (!requestId) {
    url.searchParams.set("lang", bikeLanguage.value);
    if (!requestAdmin) url.searchParams.set("fixture", requestFixture);
    if (requestAd) url.searchParams.set("ad", requestAd);
  }
  back.href = url;
  bikeElement("request-title").textContent = requestAdmin ? words.requests : words.mine;
  bikeElement("request-admin-login").hidden = !requestAdmin || Boolean(actor);
  bikeElement("request-list").hidden = !actor || Boolean(requestId);
  const requests = ownRequests();
  const record = requests.find(item => item.id === requestId);
  bikeElement("request-detail").hidden = !record;
  if (!actor) return;
  if (requestId && !record) {
    requestStatus.textContent = words.invalid;
  } else if (record) renderRequestDetail(record);
  else renderRequestList(requests);
}

bikeElement("request-admin-login").onclick = () => {
  sessionStorage.setItem(bikeAdminKey, bikeAdmin.id);
  installExtensionBell(actorForRequest(), () => bikeLanguage.value, requestAd);
  renderRequests();
};
bikeElement("menu").onclick = () => bikeElement("campaign-menu").showModal();
requestFilter.onchange = renderRequests;
requestDecision.onchange = requestScope.onchange = updateRequestFields;
requestKind.onchange = requestMinutes.oninput = previewRequestMap;
requestForm.onsubmit = async event => {
  event.preventDefault();
  if (!displayed) return;
  try {
    await geoAutoSerialize(() => extensionChange(localStorage, actorForRequest(), displayed.id, {
      action: requestAdmin ? requestDecision.value : "reply",
      note: bikeElement("request-reply").value,
      scope: requestScope.value,
      kind: requestAdmin ? requestKind.value : undefined,
      minutes: requestMinutes.valueAsNumber,
      standard: requestThresholds(displayed).standard,
      network: requestNetwork?.version,
      until: requestUntil.value ? requestUntil.value + "T23:59:59" : "",
      revision: displayed.events.length
    }));
    bikeElement("request-reply").value = "";
    window.dispatchEvent(new Event("buuurt-notifications-change"));
    requestStatus.textContent = "";
  } catch {
    requestStatus.textContent = bikeWords().invalid;
  }
  renderRequests();
};
bikeLanguageChange(renderRequests);
window.addEventListener("storage", event => { if (event.key === extensionKey) renderRequests(); });
installExtensionBell(actorForRequest(), () => bikeLanguage.value, requestAd);
renderRequests();
