"use strict";

const translations = {
  nl: ["Kies je gesponsorde pakket", "Pakketten", "doelvertoningen", "Indicatieve looptijd", "Gekozen gebieden",
    "Terug", "Verder", "Campagneoverzicht", "Werkelijke capaciteit en rechten moeten worden gecontroleerd vóór bevestiging.",
    "dagen", "Geen aanvullende gebieden gekozen.", "De selectie is niet beschikbaar.", "BUUURT-maquettes", "Publicatiemethode", "Sluiten"],
  en: ["Choose your sponsored package", "Packages", "target impressions", "Indicative duration", "Selected territories",
    "Back", "Continue", "Campaign summary", "Live capacity and permissions must be checked before confirmation.",
    "days", "No additional territories selected.", "The selection is unavailable.", "BUUURT prototypes", "Publication method", "Close"],
  fr: ["Choisissez votre forfait sponsorisé", "Forfaits", "affichages à l’écran", "Durée indicative", "Territoires sélectionnés",
    "Retour", "Continuer", "Récapitulatif de la campagne", "La capacité et les droits réels doivent être contrôlés avant toute confirmation.",
    "jours", "Aucun territoire supplémentaire sélectionné.", "La sélection est indisponible.", "Maquettes BUUURT", "Choix du mode de publication", "Fermer"]
};
const keys = ["title", "packages", "impressions", "duration", "selection", "back", "next", "review", "done",
  "days", "empty", "error", "library", "choice", "close"];
const $ = id => document.getElementById(id);
const language = $("lang");
const url = new URL(location.href);
const requested = url.searchParams.get("lang");
language.value = Object.hasOwn(translations, requested) ? requested : "nl";
const duration = $("duration");
const options = [...document.querySelectorAll("[name=budget]")];
const chosenBudget = () => options.find(option => option.checked).value;
const targets = {15: 500, 30: 1200, 50: 2500};
const profile = url.searchParams.get("demo") || defaultReviewProfile;
const isBike = profile === "amsterdam-bike";
const bikeId = isBike && (url.searchParams.get("campaign") || url.searchParams.get("draft"));
const bikeFixture = isBike && url.searchParams.get("fixture");
let engagedBike = isBike && readBikeCampaign(localStorage, bikeId);
const scope = isBike ? extensionDraftScope(profile, bikeFixture, extensionAd(url)) + ":" + bikeId : sponsorDraftScope(profile) + (profile === "amsterdam-levels" && url.searchParams.get("fixture") === "border" ? ":border" : "");
const draft = readSponsorDraft(scope);
let selectedNames;
let selectionUnavailable = false;
let bikeBandsForBudget;
let displayedBikeSelection;
const budgetPage = document.querySelector("main");
if (isBike) {
  budgetPage.hidden = true;
  installExtensionBell(extensionActor(bikeFixture), () => language.value, extensionAd(url));
}

function bikeBudgetSelection() {
  if (!bikeBandsForBudget) return [];
  if (engagedBike) return eligibleBikeSelection(engagedBike.selected, bikeBandsForBudget);
  const activeBands = extensionApply(bikeBandsForBudget, localStorage, bikeFixture, extensionAd(url));
  const current = readSponsorDraft(extensionDraftScope(profile, bikeFixture, extensionAd(url)));
  const latest = new Set(eligibleBikeSelection(current.selected, activeBands));
  return eligibleBikeSelection(readSponsorDraft(scope).selected, activeBands)
    .filter(id => latest.has(id));
}

function returnToBikeTerritory() {
  const map = new URL("com-pub-spon-003.html", url);
  map.searchParams.set("lang", language.value);
  if (bikeFixture) map.searchParams.set("fixture", bikeFixture);
  const ad = extensionAd(url);
  if (ad) map.searchParams.set("ad", ad);
  map.searchParams.set("v", "territory-gate-20261128");
  location.replace(map);
}

for (const option of options) {
  if (option.value === draft.budget) option.checked = true;
  option.addEventListener("change", savePackage);
}
if ([...duration.options].some(option => option.value === draft.duration)) duration.value = draft.duration;
duration.addEventListener("change", savePackage);

function savePackage() {
  writeSponsorDraft({budget: chosenBudget(), duration: duration.value}, scope);
  translatePackage();
}

function translatePackage() {
  const lang = language.value;
  const words = Object.fromEntries(keys.map((key, index) => [key, translations[lang][index]]));
  document.documentElement.lang = lang;
  for (const element of document.querySelectorAll("[data-t]")) element.textContent = words[element.dataset.t];
  for (const option of duration.options) option.textContent = option.value + " " + words.days;
  const back = new URL(reviewProfiles[profile]?.mapPage || "com-pub-spon-001.html", url);
  back.search = url.search;
  back.searchParams.set("lang", lang);
  if (isBike) {
    back.searchParams.delete("draft");
    if (engagedBike) back.searchParams.set("campaign", bikeId);
  }
  (document.querySelector("#legacy-package .back") || document.querySelector(".back")).href = back;
  $("choice-link").href = back;
  $("selection-summary").textContent = selectionUnavailable ? words.error :
    selectedNames?.length ? selectedNames.join(" · ") : selectedNames ? words.empty : "";
  const budget = chosenBudget();
  $("review-summary").textContent = [
    new Intl.NumberFormat(lang).format(targets[budget]) + " " + words.impressions,
    budget + " €", duration.value + " " + words.days
  ].join(" · ");
}

language.addEventListener("change", () => {
  url.searchParams.set("lang", language.value);
  history.replaceState(null, "", url);
  translatePackage();
});
$("menu").onclick = () => $("campaign-menu").showModal();
$("continue").onclick = () => {
  const verified = isBike && bikeBudgetSelection();
  if (isBike && (!verified.length || verified.join() !== displayedBikeSelection?.join())) {
    returnToBikeTerritory();
    return;
  }
  savePackage();
  if (isBike && !engagedBike) {
    try {
      engagedBike = engageBikeCampaign(localStorage, bikeId, {...draft, selected: verified, bands: extensionApply(bikeBandsForBudget, localStorage, bikeFixture, extensionAd(url))});
      url.searchParams.delete("draft");
      url.searchParams.set("campaign", bikeId);
      history.replaceState(null, "", url);
      translatePackage();
    } catch {
      selectionUnavailable = true;
      translatePackage();
      return;
    }
  }
  $("campaign-review").hidden = false;
  $("campaign-review").focus();
};
translatePackage();

async function showSelectedDistricts() {
  const snapshot = engagedBike || draft;
  let identifiers = snapshot.selected;
  if (!Array.isArray(identifiers)) throw new Error("No saved territory selection");
  if (!Object.hasOwn(reviewProfiles, profile)) throw new Error("Unknown review profile");
  const response = await fetch("data/" + sponsorDataset(reviewProfiles[profile]) + ".geojson");
  if (!response.ok) throw new Error("Territory snapshot unavailable");
  const {features} = await response.json();
  const names = new Map(features.map(feature => [feature.id, feature.properties.buurtnaam]));
  if (isBike) {
    if (!/^[\da-f-]{36}$/i.test(bikeId || "") || !validBikeThresholds(snapshot.thresholds) ||
        snapshot.fixture !== bikeFixture) throw new Error("Invalid bike draft");
    if (engagedBike) {
      // Existing campaigns retain the eligibility recorded when they were confirmed.
      bikeBandsForBudget = Object.fromEntries(features.map(({id}) => [id, snapshot.bands?.[id]]));
    } else {
      const timesResponse = await fetch("data/amsterdam-bike-times.json");
      if (!timesResponse.ok) throw new Error("Bike times unavailable");
      const times = await timesResponse.json();
      if (snapshot.network !== times.version || !Object.hasOwn(times.profiles, bikeFixture)) {
        throw new Error("Invalid bike network");
      }
      const {wijken} = times.profiles[bikeFixture];
      bikeBandsForBudget = Object.fromEntries(features.map(({id}) =>
        [id, classifyBikeSeconds(wijken[id]?.seconds, snapshot.thresholds)]));
    }
    identifiers = bikeBudgetSelection();
    if (!identifiers.length) throw new Error("No eligible bike selection");
    displayedBikeSelection = identifiers;
    if (!engagedBike) {
      selectedNames = identifiers.map(code => names.get(code));
      initCommercialBudget(features, names);
      budgetPage.hidden = false;
      return;
    }
  }
  selectedNames = identifiers.map(code => names.get(code)).filter(Boolean);
  $("continue").disabled = false;
  if (isBike) budgetPage.hidden = false;
  translatePackage();
}
showSelectedDistricts().catch(() => {
  if (isBike) {
    returnToBikeTerritory();
    return;
  }
  selectionUnavailable = true;
  translatePackage();
});
