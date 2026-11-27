const ERRORS = {
  NL: { invalidDraft: "Controleer de tekst, duur en geselecteerde buurten.", staleDraft: "Dit concept is gewijzigd. De laatste serverversie is opgehaald.", zoneChanged: "De toegestane buurten zijn gewijzigd.", disabled: "Gesponsorde publicatie is uitgeschakeld.", alreadyPublished: "Dit concept is al bevestigd.", invalidSettings: "De testinstellingen zijn ongeldig.", forbidden: "Je hebt geen toegang tot deze actie.", unavailable: "Het lokale testplatform is niet bereikbaar.", logout: "Gebruik je testlink om opnieuw aan te melden.", saved: "Concept opgeslagen in het testplatform.", saving: "Concept opslaan…", emptyList: "Geen testpublicaties." },
  EN: { invalidDraft: "Check the text, duration and selected districts.", staleDraft: "This draft changed. The latest server version has been loaded.", zoneChanged: "The eligible districts have changed.", disabled: "Sponsored publication is disabled.", alreadyPublished: "This draft has already been confirmed.", invalidSettings: "The test settings are invalid.", forbidden: "You cannot perform this action.", unavailable: "The local test platform is unavailable.", logout: "Use your test link to sign in again.", saved: "Draft saved in the test platform.", saving: "Saving draft…", emptyList: "No test publications." },
  FR: { invalidDraft: "Vérifie le texte, la durée et les quartiers sélectionnés.", staleDraft: "Le brouillon a changé. La dernière version du serveur a été chargée.", zoneChanged: "Les quartiers autorisés ont changé.", disabled: "La publication sponsorisée est désactivée.", alreadyPublished: "Ce brouillon a déjà été confirmé.", invalidSettings: "Les paramètres d’essai sont invalides.", forbidden: "Tu n’as pas accès à cette action.", unavailable: "Le banc d’essai local est indisponible.", logout: "Utilise ton lien d’essai pour te reconnecter.", saved: "Brouillon enregistré dans le banc d’essai.", saving: "Enregistrement du brouillon…", emptyList: "Aucune publication d’essai." }
};
const $ = id => document.getElementById(id);
const text = (id, value) => { $(id).textContent = value; };
let lang = localStorage.getItem("buuurt-essai-lang");
if (!Object.hasOwn(COPY, lang)) lang = "NL";
const t = key => ERRORS[lang][key] || COPY[lang][key] || ERRORS[lang].unavailable;
const number = value => new Intl.NumberFormat(lang.toLowerCase()).format(value);
let state, draft, view = "choice", dirty = false, edit = 0, saving = null, timer;
const sections = ["settings", "editor", "choice", "preview", "campaign"];
sections.forEach(id => { $(id).hidden = true; });

async function api(path, data) {
  let response;
  try {
    response = await fetch("/api/" + path, data === undefined ? {} : {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    });
  } catch { throw new Error("unavailable"); }
  const info = await response.json();
  if (!response.ok) throw new Error(response.status === 401 ? "logout" : info.error);
  return info;
}
function reset(source, preserveView = true) {
  state = source;
  if (state.role === "merchant") {
    draft = structuredClone(state.draft);
    dirty = false;
    if (!preserveView || !state.enabled) showOff();
  }
}
async function refresh() {
  if (dirty || saving) return;
  try {
    reset(await api("state"));
    render();
  } catch (error) { text("appError", t(error.message)); }
}
function storeChange() {
  dirty = true;
  edit++;
  text("draftStatus", t("saving"));
  clearTimeout(timer);
  timer = setTimeout(() => { void flush(); }, 220);
}
async function flush() {
  clearTimeout(timer);
  if (saving) {
    const success = await saving;
    return success && (!dirty || await flush());
  }
  if (!dirty) return true;
  const version = edit;
  saving = (async () => {
    try {
      const fresh = await api("draft", draft);
      if (version === edit) {
        reset(fresh);
        render();
      } else {
        state = fresh;
        draft.revision = fresh.draft.revision;
      }
      return true;
    } catch (error) {
      try { reset(await api("state")); render(); } catch { /* Keep the last reachable view. */ }
      text("appError", t(error.message));
      return false;
    }
  })();
  const result = await saving;
  saving = null;
  return result && (!dirty || await flush());
}
function show(name) {
  view = name;
  if (state.role === "merchant") sessionStorage.setItem("buuurt-essai-view-" + state.profile.id, view);
  render();
}
function svg(tag) { return document.createElementNS("http://www.w3.org/2000/svg", tag); }
function toggle(code) {
  if (!state.enabled || !state.allowed.includes(code)) return;
  draft.selected = draft.selected.includes(code) ? draft.selected.filter(item => item !== code) : [...draft.selected, code];
  renderMap();
  storeChange();
}
function renderMap() {
  const map = $("map"), list = $("districts"), focus = document.activeElement;
  map.replaceChildren();
  list.replaceChildren();
  map.setAttribute("aria-label", t("map"));
  for (const district of state.profile.districts) {
    const permitted = state.allowed.includes(district.code);
    const checked = draft.selected.includes(district.code);
    const shape = svg("path");
    shape.setAttribute("d", district.path);
    shape.setAttribute("fill-rule", "evenodd");
    shape.setAttribute("fill", district.code === state.profile.home ? "#a7d7a9" : permitted ? (checked ? "#f1cf5a" : "#faf0c8") : "#d5d8da");
    shape.dataset.district = district.code;
    const title = svg("title");
    title.textContent = district.name;
    shape.append(title);
    if (permitted) {
      shape.setAttribute("role", "button");
      shape.setAttribute("tabindex", "0");
      shape.setAttribute("aria-label", district.name);
      shape.setAttribute("aria-pressed", String(checked));
      shape.onclick = () => toggle(district.code);
      shape.onkeydown = event => {
        if (["Enter", " "].includes(event.key)) { event.preventDefault(); toggle(district.code); }
      };
    }
    map.append(shape);
    if (state.profile.neighbors.includes(district.code)) {
      const label = document.createElement("label");
      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = checked;
      box.disabled = !permitted;
      box.dataset.district = district.code;
      box.onchange = () => toggle(district.code);
      label.append(box, district.name);
      list.append(label);
    }
  }
  const pin = svg("circle");
  for (const [name, value] of Object.entries({ cx: state.profile.point[0], cy: state.profile.point[1], r: 5, fill: "#a90042", "pointer-events": "none" })) {
    pin.setAttribute(name, value);
  }
  map.append(pin);
  const source = focus?.dataset?.district;
  if (source) document.querySelector(focus.tagName + '[data-district="' + source + '"]')?.focus();
}
function render() {
  document.documentElement.lang = lang.toLowerCase();
  $("lang").value = lang;
  document.querySelectorAll("[data-key]").forEach(node => { node.textContent = t(node.dataset.key); });
  if (!state) return;
  const admin = state.role === "admin";
  $("settings").hidden = !admin;
  $("editor").hidden = admin;
  if (admin) {
    const profile = state.merchants[$("profile").value];
    $("enabled").checked = state.enabled;
    $("revoked").checked = profile.revoked;
    $("capacityMode").value = profile.available;
    return;
  }
  if (!state.enabled && view === "sponsored") showOff();
  const current = state.enabled ? view : "free";
  $("choice").hidden = current !== "choice";
  $("preview").hidden = current !== "free";
  $("campaign").hidden = current !== "sponsored";
  $("freeBack").hidden = !state.enabled;
  text("address", state.profile.address);
  const publications = state.publications.map(item => item.id === "C‑001"
    ? t("running") : t(item.kind === "free" ? "freeDone" : "sponsoredDone"));
  text("history", publications.join(" | ") || t("emptyList"));
  if ($("draft").value !== draft.body) $("draft").value = draft.body;
  text("listing", draft.body);
  text("draftStatus", t(dirty ? "saving" : "saved"));
  $("duration").value = draft.duration;
  $("package").replaceChildren(...state.packages.map((plan, i) => new Option(number(plan.impressions) + " · " + plan.euros + " €", i)));
  $("package").value = draft.package;
  text("revocation", state.revoked ? t("revoked") : "");
  const enough = state.capacity !== null && state.capacity >= state.packages[draft.package].impressions;
  text("capacity", state.capacity === null ? t("unknown") : t("capacity") + " · " + number(state.capacity) + (enough ? "" : " · " + t("insufficient")));
  $("confirmSponsored").disabled = !enough;
  if (current === "sponsored") renderMap();
}
function showOff() {
  view = "choice";
  sessionStorage.setItem("buuurt-essai-view-" + state.profile.id, view);
}
async function confirm(kind) {
  if (!await flush()) return;
  try {
    const response = await api("publication", { kind, revision: draft.revision });
    reset(response);
    render();
    text(kind === "free" ? "freeResult" : "sponsoredResult", t(kind === "free" ? "freeDone" : "sponsoredDone"));
    text("appError", "");
  } catch (error) {
    await refresh();
    text("appError", t(error.message));
  }
}
async function adminChange() {
  try {
    reset(await api("settings", { merchant: $("profile").value, enabled: $("enabled").checked,
      available: $("capacityMode").value, revoked: $("revoked").checked }));
    render();
    text("appError", "");
  } catch (error) { text("appError", t(error.message)); }
}
const publicationList = document.createElement("p");
publicationList.id = "history";
$("editor").append(publicationList);
$("settings").hidden = true;
$("lang").onchange = event => { lang = event.target.value; localStorage.setItem("buuurt-essai-lang", lang); render(); };
$("draft").oninput = event => { draft.body = event.target.value; text("listing", draft.body); storeChange(); };
$("duration").onchange = event => { draft.duration = Number(event.target.value); storeChange(); };
$("package").onchange = event => { draft.package = Number(event.target.value); storeChange(); };
$("free").onclick = () => show("free");
$("sponsored").onclick = () => { if (state.enabled) show("sponsored"); };
$("back").onclick = $("freeBack").onclick = () => show("choice");
$("confirmFree").onclick = () => { void confirm("free"); };
$("confirmSponsored").onclick = () => { void confirm("sponsored"); };
$("profile").onchange = render;
["enabled", "revoked", "capacityMode"].forEach(id => { $(id).onchange = adminChange; });
window.addEventListener("focus", () => { void refresh(); });
(async () => {
  try {
    reset(await api("state"));
    if (state.role === "merchant" && state.enabled) {
      const previous = sessionStorage.getItem("buuurt-essai-view-" + state.profile.id);
      if (["free", "sponsored"].includes(previous)) view = previous;
    }
    render();
  } catch (error) { text("appError", t(error.message)); }
})();
