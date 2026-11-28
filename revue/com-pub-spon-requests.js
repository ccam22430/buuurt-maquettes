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
  const words = {...bikeWords(), ...radiusRequestWords(bikeLanguage.value)};
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
let requestMapFixture;
const requestKind = bikeElement("network-kind");
const requestMinutes = bikeElement("network-minutes");
function requestThresholds(record) {
  return radiusSettings(localStorage, "amsterdam", record.fixture);
}
function previewRequestMap() {
  const record = displayed;
  if (!record || !requestNetwork || !pressMap) return;
  const settings = requestThresholds(record);
  const grants = networkGrants(localStorage, record.fixture, record.ad);
  const active = bikeElement("network-active");
  const words = {...networkWords(bikeLanguage.value), ...radiusRequestWords(bikeLanguage.value)};
  active.replaceChildren(...grants.map(grant => {
    const item = document.createElement("li");
    const district = mapData.wijken.features.find(feature => feature.id === grant.zone);
    item.textContent = [words[grant.kind], grant.kind === "targeted" ? district?.properties.buurtnaam : "",
      grant.metres ? grant.metres / 1000 + " km" : words.legacy, grant.until ? dateText(grant.until) : ""].filter(Boolean).join(" · ");
    return item;
  }));
  const base = radiusBands(requestNetwork, mapData.wijken.features, settings, grants);
  const metres = Math.round(requestMinutes.valueAsNumber * 1000);
  const preview = requestAdmin && (record.status === "pending" || !record.authorization?.metres) && requestDecision.value === "accepted" &&
    Number.isSafeInteger(metres) && metres > settings.standard && metres <= radiusMaximum;
  const proposed = preview ? radiusBands(requestNetwork, mapData.wijken.features, settings,
    [...grants, {kind:requestKind.value, metres, zone:record.zone}]) : base;
  bikeElement("network-surface").textContent = "";
  pressMap.drawNetwork(proposed);
}

async function renderRequestMap(record) {
  const revision = ++requestNetworkRevision;
  requestNetwork = null;
  try {
    mapData ||= await loadBikeData();
    const data = mapData.times.profiles[record.fixture];
    if (!data) throw Error("Unknown business");
    if (revision !== requestNetworkRevision) return;
    requestNetwork = data;
    if (!pressMap) pressMap = createBikeMap(mapData, record.fixture);
    else if (requestMapFixture !== record.fixture) pressMap.setFixture(record.fixture);
    requestMapFixture = record.fixture;
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
  const words = {...bikeWords(), ...radiusRequestWords(bikeLanguage.value)};
  displayed = record;
  const geo = networkWords(bikeLanguage.value);
  const previousKind = requestKind.value;
  requestKind.replaceChildren(new Option(geo.targeted, "targeted"), new Option(geo.global, "global"));
  requestKind.value = previousKind || "targeted";
  requestMinutes.min = (requestThresholds(record).standard + 1) / 1000;
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
  if (auth && !auth.metres && !auth.kind) info.push(words.legacy);
  if (auth) info.push(words[auth.scope], ...(auth.kind ? [geo[auth.kind], auth.metres ? auth.metres / 1000 + " km" : words.legacy, auth.network] : []), ...(auth.until ? [dateText(auth.until)] : []), ...(expiry ? [words.expired] : []));
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
  requestDecision.replaceChildren(...(revocable ? [new Option(words.revoke, "revoked"), ...(!auth?.metres ? [new Option(words.reissue, "accepted")] : [])] : ["accepted", "refused", "clarify"].map(value => new Option(words[value], value))));
  requestDecision.value = revocable ? "revoked" : decision === "revoked" ? "accepted" : decision || "accepted";
  const scope = requestScope.value;
  requestScope.replaceChildren(...["shop", "ad", "until"].map(value => {
    const opt = new Option(words[value], value);
    opt.disabled = value === "ad" && !record.ad;
    return opt;
  }));
  requestScope.value = auth?.scope || scope || "shop";
  if (auth?.until) requestUntil.value = auth.until.slice(0,10);
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
  const words = {...bikeWords(), ...radiusRequestWords(bikeLanguage.value)};
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
    await geoReviewLock(() => extensionChange(localStorage, actorForRequest(), displayed.id, {
      action: requestAdmin ? requestDecision.value : "reply",
      note: bikeElement("request-reply").value,
      scope: requestScope.value,
      kind: requestAdmin ? requestKind.value : undefined,
      metres: Math.round(requestMinutes.valueAsNumber * 1000),
      standard: requestThresholds(displayed).standard,
      network: requestNetwork && radiusVersion,
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
