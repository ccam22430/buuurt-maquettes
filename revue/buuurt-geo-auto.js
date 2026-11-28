"use strict";

const geoAutoDefaults = Object.freeze({percent: 10, metres: 500, addresses: 50});

function validGeoAuto(value) {
  return value && [["percent", 100], ["metres", 100000], ["addresses", 100000]].every(([key, max]) =>
    Number.isInteger(value[key]) && value[key] > 0 && value[key] <= max);
}

async function loadGeoAutoEvidence() {
  try {
    const response = await fetch("data/amsterdam-extension-evidence.json?v=geo-auto-1");
    return response.ok ? await response.json() : null;
  } catch { return null; }
}

function geoAutoEvaluate(evidence, times, fixture, zone, standard, criteria = geoAutoDefaults) {
  const row = evidence?.profiles?.[fixture]?.[zone];
  const index = standard - 1;
  const road = row?.road?.[index];
  const residential = row?.residential?.[index];
  const percent = row?.roadMetres > 0 && Number.isFinite(road) ? 100 * road / row.roadMetres : null;
  const metrics = {metres: road ?? null, percent, addresses: row?.addressCoverage ? residential ?? null : null,
    totalMetres: row?.roadMetres ?? null, residentialTotal: row?.addressCoverage ? row.residentialTotal ?? null : null,
    residentialSnapped: row?.addressCoverage ? row.residentialSnapped ?? null : null};
  const result = {outcome: "insufficient", criteria: {...criteria}, standard, metrics, version: evidence?.version};
  if (!Number.isInteger(index) || index < 0 || !validGeoAuto(criteria) || !evidence?.version ||
      !times?.sourceSha256 || evidence.networkSha256 !== times.sourceSha256 ||
      !Number.isFinite(percent) || percent < 0 || percent > 100 || !Number.isInteger(residential) ||
      residential < 0 || row.addressCoverage !== true || !Number.isInteger(row.residentialTotal) ||
      !Number.isInteger(row.residentialSnapped) || residential > row.residentialSnapped ||
      row.residentialSnapped > row.residentialTotal ||
      (row.residentialTotal > 0 && row.residentialSnapped / row.residentialTotal < 0.90)) return result;
  const accepted = percent >= criteria.percent && road >= criteria.metres && residential >= criteria.addresses;
  return {...result, outcome: accepted ? "automatic" : "manual"};
}

function geoAutoSerialize(callback) {
  return navigator.locks?.request("buuurt-extension-requests", callback) ?? Promise.resolve().then(callback);
}

if (typeof module !== "undefined") module.exports = {geoAutoDefaults, validGeoAuto, geoAutoEvaluate};

const geoAutoCopy = {
  fr: {
    autoTitle: "Extension acceptée", autoAdded: "Votre demande a été acceptée. Ce quartier a été ajouté à votre sélection.",
    autoAdvice: "Notre conseil", autoPartial: "Seule une partie de ce quartier se trouve à proximité de votre commerce.",
    autoQR: "Votre annonce pourra être affichée aux habitants scannant un QR code dans l’ensemble de ce quartier, y compris à ceux situés plus loin de votre commerce.",
    autoTip: "Pour une visibilité plus pertinente et une meilleure utilisation de votre budget, BUUURT recommande de privilégier les quartiers les plus proches.",
    autoKeep: "J’ai compris", autoRemove: "Retirer ce quartier de ma sélection",
    autoSettings: "Acceptation automatique · seuils expérimentaux", autoPercent: "Part des voies accessibles (%)",
    autoMetres: "Longueur minimale (m)", autoAddresses: "Adresses résidentielles minimales",
    automatic: "Acceptation automatique", manual: "Décision manuelle", insufficient: "Données insuffisantes",
    revoked: "Révoquée", revoke: "Révoquer l’autorisation", autoOrigin: "Décision automatique"
  },
  nl: {
    autoTitle: "Uitbreiding goedgekeurd", autoAdded: "Je aanvraag is goedgekeurd. Deze wijk is toegevoegd aan je selectie.",
    autoAdvice: "Ons advies", autoPartial: "Slechts een deel van deze wijk ligt dicht bij je zaak.",
    autoQR: "Je advertentie kan worden getoond aan bewoners die ergens in deze wijk een QR-code scannen, ook verder van je zaak.",
    autoTip: "Voor relevanter bereik en een beter gebruik van je budget raadt BUUURT aan de dichtstbijzijnde wijken te kiezen.",
    autoKeep: "Ik begrijp het", autoRemove: "Deze wijk uit mijn selectie verwijderen",
    autoSettings: "Automatische goedkeuring · experimentele drempels", autoPercent: "Aandeel bereikbare wegen (%)",
    autoMetres: "Minimale lengte (m)", autoAddresses: "Minimumaantal woonadressen",
    automatic: "Automatische goedkeuring", manual: "Handmatige beslissing", insufficient: "Onvoldoende gegevens",
    revoked: "Ingetrokken", revoke: "Toestemming intrekken", autoOrigin: "Automatische beslissing"
  },
  en: {
    autoTitle: "Extension approved", autoAdded: "Your request was approved. This neighbourhood has been added to your selection.",
    autoAdvice: "Our advice", autoPartial: "Only part of this neighbourhood is close to your business.",
    autoQR: "Your ad may be shown to residents who scan a QR code anywhere in this neighbourhood, including farther from your business.",
    autoTip: "For more relevant reach and better use of your budget, BUUURT recommends prioritising nearby neighbourhoods.",
    autoKeep: "I understand", autoRemove: "Remove this neighbourhood from my selection",
    autoSettings: "Automatic approval · experimental thresholds", autoPercent: "Share of reachable roads (%)",
    autoMetres: "Minimum length (m)", autoAddresses: "Minimum residential addresses",
    automatic: "Automatic approval", manual: "Manual decision", insufficient: "Insufficient data",
    revoked: "Revoked", revoke: "Revoke permission", autoOrigin: "Automatic decision"
  }
};

function geoAutoWords(lang) { return geoAutoCopy[lang] || geoAutoCopy.nl; }
function translateGeoAuto(lang) {
  const words = geoAutoWords(lang);
  for (const node of document.querySelectorAll("[data-geo]")) node.textContent = words[node.dataset.geo];
}
