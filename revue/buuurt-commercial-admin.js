"use strict";

const $a = id => document.getElementById(id);
const panelURL = new URL(location.href);
const pane = panelURL.searchParams.get("view") || "tracking";
const adminPane = !["tracking", "resident"].includes(pane);
const language = $a("lang");
language.value = Object.hasOwn(commercialCopy, panelURL.searchParams.get("lang")) ? panelURL.searchParams.get("lang") : "nl";
const fixture = panelURL.searchParams.get("fixture") || "dolores";
const shop = extensionActor(fixture)?.shop;
const content = $a("panel-content");
let features, pools, draftConfig;
const adminTabs = ["settings", "capacity", "campaigns", "strategy", "demand"];
const dictionary = {
  fr: ["Mes campagnes", "Paramètres des annonces sponsorisées", "Capacité publicitaire", "Campagnes et remboursements", "Pilotage stratégique", "Demande territoriale",
    "Ouvrir la session Super Admin de démonstration", "Enregistrer", "Annuler", "Rétablir les valeurs initiales",
    "Historique", "Aucune campagne", "Affichages délivrés", "Restant", "Remboursement", "Avoir",
    "Signaler 100 affichages (simulation)", "Simuler la fin indicative", "Simuler l’expiration de l’annonce",
    "Prolongation gratuite", "Remboursement à traiter", "Remboursement effectué (simulation)", "Avoir accordé (simulation)",
    "Terminée · objectif atteint", "Arrêtée avant objectif", "Programmée", "Active", "Réservée",
    "Recommandation statistique de secours · aucune IA connectée", "Analyser la journée (simulation)",
    "Données insuffisantes · conserver les réglages", "Conditions favorables à une ouverture", "Surveiller les indicateurs",
    "Appliquer au brouillon", "Reporter", "Refuser", "E-mail de test · aperçu local, aucun envoi",
    "Habitants intéressés", "Commerces partenaires", "Prévisualisation", "Modification enregistrée",
    "Action indisponible. Vérifiez les valeurs ou votre session."],
  nl: ["Mijn campagnes", "Instellingen gesponsorde advertenties", "Advertentiecapaciteit", "Campagnes en terugbetalingen", "Strategisch overzicht", "Lokale belangstelling",
    "Open de Super Admin-demosessie", "Opslaan", "Annuleren", "Beginwaarden herstellen",
    "Geschiedenis", "Geen campagnes", "Geleverde weergaven", "Resterend", "Terugbetaling", "Tegoed",
    "100 weergaven simuleren", "Indicatieve einddatum simuleren", "Verloop advertentie simuleren",
    "Gratis verlenging", "Terugbetaling te verwerken", "Terugbetaald (simulatie)", "Tegoed verleend (simulatie)",
    "Afgerond · doel bereikt", "Gestopt vóór doel", "Gepland", "Actief", "Gereserveerd",
    "Statistisch advies · geen verbonden AI", "Analyseer de dag (simulatie)",
    "Onvoldoende gegevens · instellingen behouden", "Gunstige omstandigheden voor opening", "Volg de indicatoren",
    "Toepassen op concept", "Uitstellen", "Afwijzen", "Testmail · lokaal voorbeeld, niet verzonden",
    "Geïnteresseerde bewoners", "Partnerwinkels", "Voorbeeld", "Wijziging opgeslagen",
    "Controleer de waarden of je sessie."],
  en: ["My campaigns", "Sponsored ad settings", "Advertising capacity", "Campaigns and refunds", "Strategic review", "Territorial demand",
    "Open the demo Super Admin session", "Save", "Cancel", "Restore initial values",
    "History", "No campaigns", "Delivered displays", "Remaining", "Refund", "Credit",
    "Simulate 100 displays", "Simulate indicative end", "Simulate ad expiry",
    "Free extension", "Refund pending", "Refund completed (simulation)", "Credit granted (simulation)",
    "Complete · target reached", "Stopped before target", "Scheduled", "Active", "Reserved",
    "Statistical fallback · no AI service connected", "Analyze the day (simulation)",
    "Insufficient data · keep settings", "Conditions support opening", "Monitor the indicators",
    "Apply to draft", "Defer", "Decline", "Test email · local preview, no message sent",
    "Interested residents", "Partner shops", "Preview", "Change saved", "Check the values or your session."]
};
const labels = ["tracking","settings","capacity","campaigns","strategy","demand","login","save","cancel","reset","history","empty",
 "delivered","remaining","refund","creditChoice","deliver","end","expire","extended","reimbursement","refunded","credit","complete",
 "under","scheduled","active","held","fallback","run","missing","mature","monitor","apply","defer","decline","email","residents","shops",
 "preview","saved","error"];
const tr = () => Object.fromEntries(labels.map((key, i) => [key, dictionary[language.value][i]]));
const fieldNames = {
  fr: ["Ventes sponsorisées", "Minimum à l’achat", "Pas du curseur", "Marge de sécurité (%)", "Plafond par commerce (%)", "Jours d’historique", "Commerces actifs", "Commerces équipés", "Scans valides sur 30 jours", "Capacité de référence sur 30 jours", "Interpolation"],
  nl: ["Gesponsorde verkoop", "Aankoopminimum", "Stap", "Veiligheidsmarge (%)", "Limiet per winkel (%)", "Dagen historie", "Actieve winkels", "Winkels met QR", "Geldige scans in 30 dagen", "Referentiecapaciteit in 30 dagen", "Interpolatie"],
  en: ["Sponsored sales", "Minimum purchase", "Slider step", "Safety margin (%)", "Per-shop cap (%)", "History days", "Active shops", "QR-equipped shops", "Valid scans over 30 days", "30-day reference capacity", "Interpolation"]
};
const fieldKeys = ["enabled","minimum","step","margin","quota","days","shops","qrShops","scans","maturity","pricing"];
const node = (tag, text, parent) => {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  parent?.append(element);
  return element;
};
const button = (text, parent, action) => {
  const element = node("button", text, parent);
  element.type = "button";
  element.className = "back";
  element.onclick = action;
  return element;
};
const actor = () => extensionAdmin(sessionStorage);
async function mutate(handler, requiresAdmin = true) {
  try {
    await commercialLocked(() => {
      if (requiresAdmin && !actor()) throw Error("role");
      const state = commercialRead(localStorage);
      handler(state);
      commercialSave(localStorage, state);
    });
    $a("panel-status").textContent = tr().saved;
    installCommercialBell();
    renderPanel();
  } catch { $a("panel-status").textContent = tr().error; }
}
function formatInteger(n) { return new Intl.NumberFormat(language.value).format(n); }
function euro(cents) {
  return new Intl.NumberFormat(language.value, {style: "currency", currency: "EUR"}).format(cents / 100);
}
function capacityFor(id, period, config, orders = []) {
  return commercialCapacity({zones: [id], days: period, config, pools, orders, shop});
}
function settingsPanel(state) {
  const words = tr();
  draftConfig ||= structuredClone(state.config);
  const form = node("form", null, content);
  for (const [index, key] of fieldKeys.entries()) {
    const label = node("label", fieldNames[language.value][index], form);
    if (key === "pricing") {
      const input = node("select", null, label);
      input.append(new Option("Total €", "linear"), new Option("€/display", "unit"));
      input.value = draftConfig[key];
      input.onchange = () => {draftConfig[key] = input.value;};
      continue;
    }
    const input = node("input", null, label);
    input.type = key === "enabled" ? "checkbox" : "number";
    input.checked = draftConfig[key] === true;
    input.value = draftConfig[key];
    input.oninput = () => {
      draftConfig[key] = key === "enabled" ? input.checked : input.valueAsNumber;
      updateSample();
    };
  }
  draftConfig.rates.forEach(([volume, cents], i) => {
    const group = node("fieldset", null, form);
    node("legend", commercialWords(language.value).price + " " + (i + 1), group);
    for (const [j, [value, title]] of [[volume, commercialWords(language.value).volume], [cents / 100, "EUR"]].entries()) {
      const label = node("label", title, group);
      const input = node("input", null, label);
      input.type = "number";
      input.step = j ? ".01" : "1";
      input.value = value;
      input.oninput = () => {draftConfig.rates[i][j] = j ? Math.round(input.valueAsNumber * 100) : input.valueAsNumber;updateSample();};
    }
  });
  const sample = node("output", null, form);
  function updateSample() {
    const valid = commercialValid(draftConfig);
    sample.textContent = words.preview + " · " + (valid ?
      euro(commercialPrice(draftConfig.minimum, draftConfig)) + " · " + commercialDurations.map(days =>
        days + "d: " + capacityFor(features[0].id, days, {...draftConfig, enabled:true}, state.orders).max).join(" / ") : words.error);
  }
  updateSample();
  button(words.save, form, () => mutate(current => {
    if (!commercialValid(draftConfig) || (draftConfig.enabled && !pools.some(pool => pool.active && pool.reliable &&
        pool.history >= draftConfig.days))) throw Error("config");
    current.history.unshift({admin: actor().id, at: new Date().toISOString(), before: current.config, after: draftConfig});
    current.config = draftConfig;
    draftConfig = null;
  }));
  button(words.cancel, form, () => {draftConfig = null;renderPanel();});
  button(words.reset, form, () => {draftConfig = structuredClone(commercialDefaults);renderPanel();});
  node("h2", words.history, content);
  for (const event of state.history) {
    const details = node("details", null, content);
    node("summary", event.at + " · " + event.admin, details);
    node("p", JSON.stringify(event.before) + " → " + JSON.stringify(event.after), details);
  }
}

function capacityPanel(state) {
  const duration = node("select", null, content);
  duration.ariaLabel = commercialWords(language.value).duration;
  duration.append(...commercialDurations.map(value => new Option(value + " " + commercialWords(language.value).day, value)));
  duration.value = 30;
  const list = node("div", null, content);
  function refresh() {
    list.replaceChildren();
    for (const {id, properties} of features) {
      const pool = pools.find(p => p.id === id);
      const info = capacityFor(id, +duration.value, state.config, state.orders);
      const row = node("section", null, list);
      row.className = "commercial-card";
      node("strong", properties.buurtnaam, row);
      node("p", [
        commercialWords(language.value).capacity + " " + formatInteger(info.available),
        language.value === "fr" ? "Estimée / réservée / après marge" : "Estimated / booked / after margin",
        [info.estimate, info.reserved, info.commercializable].map(formatInteger).join(" / "),
        pool.consultations + " visits / " + pool.scans + " QR / " + pool.history + "d",
        info.missing ? tr().missing : info.available < state.config.minimum ? "⚠" : ""
      ].join(" · "), row);
    }
  }
  duration.onchange = refresh;
  refresh();
}

function campaignPanel(state) {
  const words = tr();
  const orderId = panelURL.searchParams.get("order");
  const orders = state.orders.filter(o => o.state !== "held" && (adminPane || (o.shop === shop && (!orderId || o.id === orderId))));
  if (!orders.length) node("p", words.empty, content);
  for (const order of orders) {
    const card = node("article", null, content);
    card.className = "commercial-card";
    const now = order.demoTime || Date.now();
    const status = commercialCampaignStatus(order, now);
    const update = (handler, privileged = true) => mutate(current => {
      const active = current.orders.find(o => o.id === order.id && (privileged || o.shop === shop));
      if (!active) throw Error("order");
      handler(active, active.demoTime || Date.now());
    }, privileged);
    node("h2", order.shopName + " · " + order.ad, card);
    node("p", (words[status] || status) + " · " + euro(order.paid) + " · " + order.volume + " " +
      commercialWords(language.value).volume.toLowerCase() + " · " + order.days + " " + commercialWords(language.value).day, card);
    node("p", order.names.join(" · ") + " · " + new Date(order.validUntil).toLocaleDateString(language.value), card);
    const progress = node("progress", null, card);
    progress.max = order.volume;progress.value = order.delivered;progress.ariaLabel = words.delivered;
    node("p", words.delivered + " " + order.delivered + " · " + words.remaining + " " + (order.volume-order.delivered), card);
    if (["under","reimbursement","refunded","credit"].includes(status)) node("p", words.refund + " · " + euro(commercialProrata(order)), card);
    if (!adminPane && ["under", "reimbursement"].includes(status)) {
      for (const [choice, title] of [["refund",words.refund],["credit",words.creditChoice]]) {
        button(title, card, () => update((active, now) => {
          if (!["under", "reimbursement"].includes(commercialCampaignStatus(active, now))) throw Error("state");
          active.state = "reimbursement";active.choice = choice;
          active.events.push({at: Date.now(), label: choice});
        }, false));
      }
    }
    if (adminPane && status === "reimbursement") button(words.save, card, () => update(active => {
      if (active.state !== "reimbursement") throw Error("state");
      active.state = active.choice === "credit" ? "credit" : "refunded";
      active.events.push({at: Date.now(), label: active.state, actor: actor().id});
    }));
    if (adminPane && ["scheduled","active","extended"].includes(status)) {
      button(words.deliver, card, () => update((active, now) => commercialDelivery(active, 100, now)));
      button(words.end, card, () => update(active => {
        active.demoTime = active.created + active.days * commercialDay + 1;
        if (!active.events.some(e => e.label === "extended") && commercialCampaignStatus(active, active.demoTime) === "extended") {
          active.events.push({at: Date.now(), label: "extended"});
        }
      }));
      button(words.expire, card, () => update(active => {
        active.demoTime = active.validUntil;
        active.state = "reimbursement";
        active.choice = "refund";
        active.events.push({at: Date.now(), label: "reimbursement", actor: actor().id});
      }));
    }
    for (const e of order.events) node("p", new Date(e.at).toLocaleString(language.value) + " · " + (words[e.label] || e.label), card);
  }
}

function analyzeStrategy(state, pool) {
  const outcome = commercialRecommendation(pool, state.config);
  if (!outcome?.mature) return;
  const signature = [pool.id, outcome.capacity, pool.active, pool.qr, pool.scans, pool.history,
    state.config.quota, state.config.margin].join(":");
  if (!state.alerts.some(item => item.signature === signature)) {
    state.alerts.unshift({signature, at: Date.now(), status: "pending", read: false});
  }
}

function installCommercialBell() {
  if (adminPane && !actor()) return;
  window.buuurtReviewNotifications = () => {
    const state = commercialRead(localStorage);
    const entries = adminPane ? state.alerts.map(alert => {
      const target = new URL(panelURL);
      target.searchParams.set("view", "strategy");
      target.searchParams.set("lang", language.value);
      target.hash = "alert-" + alert.at;
      return {id: "strategy:" + alert.signature, label: tr().mature, href: target.href};
    }) : state.orders.filter(order => order.shop === shop).flatMap(order =>
      order.events.filter(e => ["extended", "reimbursement", "refunded", "credit"].includes(e.label)).map(e => {
        const target = new URL(panelURL);
        target.searchParams.set("view", "tracking");
        target.searchParams.set("order", order.id);
        return {id: order.id + ":" + e.at + ":" + e.label,
          label: (tr()[e.label] || e.label) + " · " + order.ad, href: target.href};
      }));
    return entries.map(entry => {
      const key = commercialKey + ":notice:" + entry.id;
      return {...entry, unread: localStorage.getItem(key) !== "read",
        markRead: () => localStorage.setItem(key, "read")};
    });
  };
  window.dispatchEvent(new Event("buuurt-notifications-change"));
}

function strategyPanel(state) {
  const words = tr();
  node("p", words.fallback, content);
  const pool = pools[0];
  const recommendation = commercialRecommendation(pool, state.config);
  const metrics = pool.active + " / " + pool.qr + " / " + pool.scans + " / " + pool.history + "d";
  node("p", metrics + " · " + (recommendation ? formatInteger(recommendation.capacity) + " · " +
    (recommendation.mature ? words.mature : words.monitor) : words.missing), content);
  node("p", commercialDurations.map(days => days + "d: " + capacityFor(pool.id, days, {...state.config, enabled:true}, state.orders).max).join(" · "), content);
  const byShop = new Map();
  for (const order of state.orders.filter(order => order.state !== "held")) {
    byShop.set(order.shop, (byShop.get(order.shop) || 0) + order.volume);
  }
  const total = [...byShop.values()].reduce((a, b) => a + b, 0);
  const concentration = total ? Math.max(...byShop.values()) / total : 0;
  const sampleQuota = recommendation && state.orders.length >= 4 && concentration > .5 && state.config.quota > 7 ? 7 : null;
  if (sampleQuota) {
    node("p", state.config.quota + "% → " + sampleQuota + "% · " + new Intl.NumberFormat(language.value, {style:"percent"}).format(concentration), content);
    button(words.apply, content, () => {draftConfig = {...state.config, quota: sampleQuota}; location.hash = "draft";paneNavigation("settings");});
  } else node("p", words.missing, content);
  button(words.run, content, () => mutate(current => analyzeStrategy(current, pool)));
  for (const alert of state.alerts) {
    const box = node("section", null, content);box.className = "commercial-card";box.id = "alert-" + alert.at;
    node("p", new Date(alert.at).toLocaleString(language.value) + " · " + words.mature + " · " + alert.status, box);
    node("p", words.email, box);
    for (const choice of ["apply","defer","decline"]) button(words[choice], box, async () => {
      await mutate(current => {
      const fresh = commercialRecommendation(pool, current.config);
      if (choice === "apply" && !fresh?.mature) throw Error("forecast");
      const live = current.alerts.find(a => a.signature === alert.signature);
      live.status = choice;
      });
      if (choice === "apply" && commercialRead(localStorage).alerts.find(a => a.signature === alert.signature)?.status === "apply") {
        draftConfig = {...commercialRead(localStorage).config};
        paneNavigation("settings");
      }
    });
  }
}

function demandPanel() {
  const words = tr();
  node("p", words.shops + " / " + words.residents, content);
  for (const id of interestList(localStorage)) {
    const zone = features.find(f => f.id === id);
    if (zone) node("p", zone.properties.buurtnaam + " · " + words.residents + " 1 · demo", content);
  }
  for (const [name, businesses, residents] of [["Erquy",18,147],["Plurien",0,83],["Fréhel",0,62],["La Bouillie",0,31]]) {
    node("p", name + " · " + businesses + " / " + residents, content);
  }
}

const residentCopy = {
 fr: ["Découvrir des territoires", "Scénario de démonstration", "Couverture locale", "Commerces voisins", "Commerces éloignés", "Aucun commerce accessible", "Géolocalisation refusée ou service indisponible",
  "BUUURT n'est pas encore présent dans votre commune, mais vous pouvez déjà découvrir les commerces partenaires des communes voisines.",
  "Nous ne sommes pas encore près de chez vous.", "Et si BUUURT arrivait bientôt chez vous ?",
  "Sélection manuelle", "Mémoriser mes territoires", "Prévenez-moi", "Retirer mon consentement", "Je souhaite être informé de l’arrivée de BUUURT dans le territoire choisi."],
 nl: ["Ontdek gebieden", "Demoscenario", "Lokale dekking", "Winkels in de buurt", "Verder weg", "Geen bereikbare winkels", "Locatie geweigerd of dienst onbeschikbaar",
  "Ontdek partnerwinkels in nabijgelegen gemeenten.", "We zijn nog niet bij je in de buurt.", "Binnenkort BUUURT bij jou?",
  "Handmatige keuze", "Gebieden bewaren", "Houd me op de hoogte", "Toestemming intrekken", "Ik wil weten wanneer BUUURT in dit gebied beschikbaar wordt."],
 en: ["Discover territories", "Demo scenario", "Local coverage", "Nearby shops", "Distant shops", "No accessible shops", "Location denied or service unavailable",
  "Discover partner shops in nearby municipalities.", "We aren’t near you yet.", "What if BUUURT came to your area?",
  "Manual selection", "Remember my territories", "Notify me", "Withdraw consent", "I want to be told when BUUURT reaches this area."]
};
function residentPanel() {
  const w = residentCopy[language.value];
  const label = node("label", w[1], content);
  const choice = node("select", null, label);
  choice.append(...w.slice(2,7).map((label, i) => new Option(label, i)));
  const message = node("p", null, content);
  choice.onchange = () => {
    const variant = +choice.value;
    const result = geoCoverage({direct: variant === 0, reliable: variant !== 4, nearbyLimit: 10,
      reasonableLimit: 25, routed: variant === 3 ? [] : [{minutes: variant === 1 ? 7 : 20, active: 1}]});
    message.textContent = ({covered:w[2], near:w[7], far:w[8], none:w[9], manual:w[10]})[result];
  };
  choice.onchange();
  const manual = node("label", w[10], content);
  const zones = node("select", null, manual);
  zones.multiple = true;
  zones.style.display = "block";
  const previous = JSON.parse(localStorage.getItem(preferenceKey) || "[]");
  zones.append(...features.map(f => new Option(f.properties.buurtnaam, f.id, false, previous.includes(f.id))));
  const selected = () => [...zones.selectedOptions].map(o => o.value);
  button(w[11], content, () => localStorage.setItem(preferenceKey, JSON.stringify(selected())));
  const consentLabel = node("label", w[14], content);
  const consent = node("input", null, consentLabel);
  consent.type = "checkbox";
  button(w[12], content, () => {
    if (consent.checked) for (const id of selected()) recordInterest(localStorage, id, true);
  });
  button(w[13], content, () => {
    for (const id of selected()) recordInterest(localStorage, id, false);
    consent.checked = false;
  });
}

function paneNavigation(view) {
  const destination = new URL(panelURL);
  destination.searchParams.set("view", view);
  destination.searchParams.set("lang", language.value);
  if (draftConfig) sessionStorage.setItem(commercialKey + ":settings-draft", JSON.stringify(draftConfig));
  location.assign(destination);
}
function renderPanel() {
  const words = tr();
  document.documentElement.lang = language.value;
  const back = $a("commercial-return");
  back.textContent = "← " + commercialWords(language.value).back;
  if (!adminPane && panelURL.searchParams.get("return")) {
    const candidate = new URL(panelURL.searchParams.get("return"), panelURL);
    if (candidate.origin === location.origin && /\/revue\/com-pub-spon-package\.html$/.test(candidate.pathname)) back.href = candidate.href;
  }
  $a("panel-title").textContent = pane === "resident" ? residentCopy[language.value][0] : words[pane] || words.settings;
  $a("panel-demo").textContent = commercialWords(language.value).demo;
  $a("commercial-admin-login").textContent = words.login;
  $a("commercial-admin-login").hidden = !adminPane || Boolean(actor());
  const nav = $a("commercial-admin-nav");
  nav.hidden = !adminPane || !actor();
  nav.replaceChildren();
  for (const tab of adminTabs) button(words[tab], nav, () => paneNavigation(tab));
  content.replaceChildren();
  if (!features || (adminPane && !actor())) return;
  const state = commercialRead(localStorage);
  if (pane === "settings") settingsPanel(state);
  else if (pane === "capacity") capacityPanel(state);
  else if (pane === "strategy") strategyPanel(state);
  else if (pane === "demand") demandPanel();
  else if (pane === "resident") residentPanel();
  else campaignPanel(state);
}
$a("commercial-admin-login").onclick = () => {
  sessionStorage.setItem(bikeAdminKey, bikeAdmin.id);
  installCommercialBell();
  renderPanel();
};
$a("menu").onclick = () => $a("campaign-menu").showModal();
language.onchange = renderPanel;
if (pane === "settings") {
  const proposed = sessionStorage.getItem(commercialKey + ":settings-draft");
  if (proposed) {
    draftConfig = JSON.parse(proposed);
    sessionStorage.removeItem(commercialKey + ":settings-draft");
  }
}
renderPanel();
fetch("data/amsterdam-levels-wijken.geojson").then(response => {
  if (!response.ok) throw Error("data");
  return response.json();
}).then(data => {
  features = data.features;
  pools = commercialDemoPools(features);
  installCommercialBell();
  renderPanel();
  if (adminPane && actor() && navigator.locks) {
    commercialLocked(() => {
      const state = commercialRead(localStorage);
      const day = new Date().toISOString().slice(0, 10);
      if (state.analysisDay === day) return;
      analyzeStrategy(state, pools[0]);
      state.analysisDay = day;
      commercialSave(localStorage, state);
    }).then(() => {installCommercialBell();renderPanel();}).catch(() => {});
  }
}).catch(() => {$a("panel-status").textContent = tr().error;});
