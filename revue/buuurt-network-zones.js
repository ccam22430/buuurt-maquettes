"use strict";

const zoneMax = 20;
const orangeKey = id => id + ":extended";

async function loadNetworkZones(fixture, times) {
  if (!Object.hasOwn(times.profiles, fixture)) throw Error("Unknown fixture");
  const response = await fetch("data/amsterdam-network-zones-" + fixture + ".json");
  if (!response.ok) throw Error("Accessibility unavailable");
  const data = await response.json();
  if (data.networkSha256 !== times.sourceSha256 || !Array.isArray(data.layers)) throw Error("Accessibility version");
  return data;
}

function networkLimit(grants, id, standard) {
  return grants.reduce((maximum, grant) => grant.kind === "global" || grant.zone === id ?
    Math.max(maximum, grant.minutes) : maximum, standard);
}

// The feed integration supplies the routed time and the scanned partner's official district.
function networkCategory(seconds, id, thresholds, grants = []) {
  if (!Number.isFinite(seconds) || seconds < 0) return "other";
  if (seconds <= thresholds.local * 60) return "home";
  if (seconds <= thresholds.standard * 60) return "direct";
  return seconds <= networkLimit(grants, id, thresholds.standard) * 60 ? "extended" : "other";
}

function networkBands(data, districts, thresholds, grants = []) {
  const bands = Object.fromEntries(districts.map(({id}) => [id, "other"]));
  const layers = [];
  for (const [id, minute, surface, geometry] of data.layers) {
    if (!Object.hasOwn(bands, id)) continue;
    const category = networkCategory(minute * 60, id, thresholds, grants);
    if (category === "other") continue;
    if (category === "direct") bands[id] = "direct";
    if (category === "extended") bands[orangeKey(id)] = "extended";
    layers.push({type:"Feature", geometry, properties:{id, category, surface}});
  }
  return {bands, layers};
}

function networkInventory(pools, data, settings, grants) {
  return pools.flatMap(pool => {
    const district = pool.territories.length === 1 && pool.territories[0];
    if (!district) return [];
    const samples = [...new Map((data.networkSamples[district] || []).map(partner => [partner.id, partner])).values()];
    return samples.flatMap((partner, index) => {
      const band = networkCategory(partner.seconds, district, settings, grants);
      if (!["direct", "extended"].includes(band)) return [];
      const daily = Math.floor(pool.daily / samples.length) + (index < pool.daily % samples.length ? 1 : 0);
      return [{...pool, id: district + ":qr:" + partner.id, previousPool: pool.id, daily,
        territories:[band === "extended" ? orangeKey(district) : district], band}];
    });
  });
}
const networkCopy = {
  fr: {extended:"Extension autorisée · tarif majoré", standard:"Partie jaune", extra:"Partie orange",
    requestGrey:"Demander une extension pour la partie grise", targeted:"Quartier demandé", global:"Tout le périmètre du commerce",
    minutes:"Temps maximum à vélo (min)", uplift:"Majoration expérimentale (%)",
    advice:"La zone orange est plus éloignée. Les habitants peuvent être moins enclins à se déplacer jusqu’à votre commerce. BUUURT recommande de privilégier les quartiers proches.",
    orangeVolume:"Affichages à l’écran en zone orange", addedSurface:"Surface supplémentaire estimée"},
  nl: {extended:"Toegestane uitbreiding · verhoogd tarief", standard:"Geel gebied", extra:"Oranje gebied",
    requestGrey:"Uitbreiding aanvragen voor het grijze gebied", targeted:"Aangevraagde wijk", global:"Volledig bereik van de zaak",
    minutes:"Maximale fietstijd (min)", uplift:"Experimentele toeslag (%)",
    advice:"Het oranje gebied ligt verder weg. Bewoners komen mogelijk minder snel naar je zaak. BUUURT raadt nabijgelegen wijken aan.",
    orangeVolume:"Schermweergaven in het oranje gebied", addedSurface:"Geschatte bijkomende oppervlakte"},
  en: {extended:"Authorized extension · surcharge", standard:"Yellow portion", extra:"Orange portion",
    requestGrey:"Request an extension for the grey portion", targeted:"Requested neighbourhood", global:"Entire business area",
    minutes:"Maximum cycling time (min)", uplift:"Experimental surcharge (%)",
    advice:"The orange area is farther away. Residents may be less likely to visit your business. BUUURT recommends prioritising nearby neighbourhoods.",
    orangeVolume:"Screen displays in the orange area", addedSurface:"Estimated additional area"}
};
function networkWords(lang) { return networkCopy[lang] || networkCopy.nl; }

if (typeof module !== "undefined") module.exports = {networkCategory, networkLimit, networkBands, orangeKey, networkInventory};
