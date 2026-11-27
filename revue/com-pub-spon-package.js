"use strict";

const translations = {
  nl: ["Kies je gesponsorde pakket", "Pakketten", "doelvertoningen", "Indicatieve looptijd", "Gekozen buurten",
    "Terug", "Verder", "Campagneoverzicht", "Werkelijke capaciteit en rechten moeten worden gecontroleerd vóór bevestiging.",
    "dagen", "Geen aanvullende buurten gekozen.", "De selectie is niet beschikbaar.", "BUUURT-maquettes", "Publicatiemethode", "Sluiten"],
  en: ["Choose your sponsored package", "Packages", "target impressions", "Indicative duration", "Selected neighbourhoods",
    "Back", "Continue", "Campaign summary", "Live capacity and permissions must be checked before confirmation.",
    "days", "No additional neighbourhoods selected.", "The selection is unavailable.", "BUUURT prototypes", "Publication method", "Close"],
  fr: ["Choisissez votre forfait sponsorisé", "Forfaits", "impressions cibles", "Durée indicative", "Quartiers sélectionnés",
    "Retour", "Continuer", "Récapitulatif de la campagne", "La capacité et les droits réels doivent être contrôlés avant toute confirmation.",
    "jours", "Aucun quartier supplémentaire sélectionné.", "La sélection est indisponible.", "Maquettes BUUURT", "Choix du mode de publication", "Fermer"]
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
const draft = readSponsorDraft();
let selectedNames;
let selectionUnavailable = false;

for (const option of options) {
  if (option.value === draft.budget) option.checked = true;
  option.addEventListener("change", savePackage);
}
if ([...duration.options].some(option => option.value === draft.duration)) duration.value = draft.duration;
duration.addEventListener("change", savePackage);

function savePackage() {
  writeSponsorDraft({budget: chosenBudget(), duration: duration.value});
  translatePackage();
}

function translatePackage() {
  const lang = language.value;
  const words = Object.fromEntries(keys.map((key, index) => [key, translations[lang][index]]));
  document.documentElement.lang = lang;
  for (const element of document.querySelectorAll("[data-t]")) element.textContent = words[element.dataset.t];
  for (const option of duration.options) option.textContent = option.value + " " + words.days;
  const back = new URL("com-pub-spon-001.html", url);
  back.search = url.search;
  back.searchParams.set("lang", lang);
  document.querySelector(".back").href = back;
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
  savePackage();
  $("campaign-review").hidden = false;
  $("campaign-review").focus();
};
translatePackage();

async function showSelectedDistricts() {
  if (!Array.isArray(draft.selected)) throw new Error("No saved territory selection");
  const response = await fetch("data/amsterdam-cbs-2025.geojson");
  if (!response.ok) throw new Error("CBS snapshot unavailable");
  const {features} = await response.json();
  const names = new Map(features.map(feature => [feature.id, feature.properties.buurtnaam]));
  selectedNames = draft.selected.map(code => names.get(code)).filter(Boolean);
  $("continue").disabled = false;
  translatePackage();
}
showSelectedDistricts().catch(() => {
  selectionUnavailable = true;
  translatePackage();
});
