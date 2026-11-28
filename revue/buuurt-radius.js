"use strict";

const radiusVersion = "geodesic-v1";
const earthMetres = 6371008.8;
const rad = Math.PI / 180;
const radiusDefaults = {urban: {local:1000, standard:3000}, rural: {local:5000, standard:10000}};
const radiusKey = "buuurt-review:geo-radius:v1";
const radiusMaximum = 100000;
const orangeKey = id => id + ":extended";

function geoDistance([lat1, lon1], [lat2, lon2]) {
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite) || Math.abs(lat1) > 90 || Math.abs(lat2) > 90) return NaN;
  const a = Math.sin((lat2-lat1)*rad/2)**2 +
    Math.cos(lat1*rad)*Math.cos(lat2*rad)*Math.sin((lon2-lon1)*rad/2)**2;
  return 2 * earthMetres * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a))));
}

function radiusLimit(grants, id, standard) {
  return grants.reduce((limit, grant) => Number.isFinite(grant.metres) &&
    (grant.kind === "global" || grant.zone === id) ? Math.max(limit, grant.metres) : limit, standard);
}

function radiusCategory(metres, id, settings, grants = []) {
  if (!Number.isFinite(metres) || metres < 0) return "other";
  if (metres <= settings.local) return "home";
  if (metres <= settings.standard) return "direct";
  return metres <= radiusLimit(grants, id, settings.standard) ? "extended" : "other";
}

function scannedShopEligibility(origin, partner, settings, grants, selected) {
  if (!partner?.district || !Array.isArray(partner.coordinate)) return "other";
  const category = radiusCategory(geoDistance(origin, partner.coordinate), partner.district, settings, grants);
  if (category === "home") return category;
  const key = category === "extended" ? orangeKey(partner.district) : partner.district;
  return category !== "other" && selected.includes(key) ? category : "other";
}

function validRadius(value) {
  return Number.isSafeInteger(value?.local) && Number.isSafeInteger(value?.standard) &&
    value.local >= 1 && value.local < value.standard && value.standard < radiusMaximum;
}
function readRadiusConfig(storage) {
  try {
    const stored = JSON.parse(storage.getItem(radiusKey));
    if (stored && Array.isArray(stored.history)) return stored;
  } catch {}
  return {cities:{}, shops:{}, history:[]};
}
function radiusSettings(storage, city, shop, environment = "urban") {
  const config = readRadiusConfig(storage);
  return [config.shops?.[shop], config.cities?.[city], radiusDefaults[environment]].find(validRadius) || radiusDefaults.urban;
}
function saveRadiusConfig(actor, storage, kind, id, settings) {
  if (actor?.id !== "review-admin" || actor?.role !== "geo-admin" ||
      !["cities","shops"].includes(kind) || !/^[a-z-]+$/.test(id) || !validRadius(settings)) throw Error("settings");
  const data = readRadiusConfig(storage);
  const before = data[kind][id];
  data[kind][id] = {...settings};
  data.history.unshift({at:new Date().toISOString(), admin:actor.id, scope:id,
    before:before || radiusDefaults.urban, after:{...settings}});
  storage.setItem(radiusKey, JSON.stringify(data));
}
function radiusCircle([lat, lon], metres) {
  const phi = lat * rad, lambda = lon * rad, delta = metres / earthMetres;
  const count = Math.max(360, Math.ceil(Math.PI / Math.acos(1 - .2 / metres)));
  const ring = Array.from({length:count}, (_, index) => {
    const bearing = 2 * Math.PI * index / count;
    const latitude = Math.asin(Math.sin(phi)*Math.cos(delta) + Math.cos(phi)*Math.sin(delta)*Math.cos(bearing));
    const longitude = lambda + Math.atan2(Math.sin(bearing)*Math.sin(delta)*Math.cos(phi),
      Math.cos(delta)-Math.sin(phi)*Math.sin(latitude));
    return [longitude/rad, latitude/rad];
  });
  return [[...ring, ring[0]]];
}
function radiusBands(data, districts, settings, grants = []) {
  const bands = Object.fromEntries(districts.map(({id})=>[id,"other"]));
  const layers = [];
  const grey = new Set();
  const circles = new Map();
  const clip = (polygon, metres) => {
    if (!circles.has(metres)) circles.set(metres,radiusCircle(data.center,metres));
    return polygonClipping.intersection(polygon,circles.get(metres));
  };
  for (const {id,geometry} of districts) {
    const local = clip(geometry.coordinates,settings.local);
    const standard = clip(geometry.coordinates,settings.standard);
    const limit = radiusLimit(grants,id,settings.standard);
    const extended = limit > settings.standard ? clip(geometry.coordinates,limit) : [];
    const covered = limit > settings.standard ? extended : standard;
    if (!covered.length || polygonClipping.difference(geometry.coordinates,covered).length) grey.add(id);
    const portions = [
      ["home",local], ["direct",standard.length && local.length ? polygonClipping.difference(standard,local) : standard],
      ["extended",extended.length && standard.length ? polygonClipping.difference(extended,standard) : extended]
    ];
    for (const [category,coordinates] of portions) {
      if (!coordinates.length) continue;
      if (category === "direct") bands[id] = category;
      if (category === "extended") bands[orangeKey(id)] = category;
      layers.push({type:"Feature", geometry:{type:"MultiPolygon",coordinates}, properties:{id,category}});
    }
  }
  return {bands,layers,grey};
}

function radiusInventory(pools, profile, settings, grants) {
  return pools.flatMap(pool => {
    const district = pool.territories.length === 1 && pool.territories[0];
    if (!district) return [];
    const samples = [...new Map((profile.partners[district] || []).map(sample => [sample.id, sample])).values()];
    return samples.flatMap((sample, index) => {
      const band = radiusCategory(geoDistance(profile.center,[sample.coordinate[1],sample.coordinate[0]]),district,settings,grants);
      if (!["direct","extended"].includes(band)) return [];
      const daily = Math.floor(pool.daily/samples.length) + (index < pool.daily%samples.length ? 1 : 0);
      return [{...pool,id:district+":qr:"+sample.id,previousPool:pool.id,daily,
        territories:[band === "extended" ? orangeKey(district) : district],band}];
    });
  });
}

async function loadRadiusFixtures() {
  const response = await fetch("data/amsterdam-radius-fixtures.json");
  if (!response.ok) throw Error("Reference shops unavailable");
  return response.json();
}
function geoReviewLock(callback) {
  return navigator.locks?.request("buuurt-extension-requests", callback) ?? Promise.resolve().then(callback);
}

if (typeof module !== "undefined") module.exports = {geoDistance,radiusCategory,scannedShopEligibility,radiusCircle,
  radiusDefaults,radiusSettings,saveRadiusConfig,radiusInventory,radiusBands};
const networkCopy = {
  fr: {extended:"Extension autorisée · tarif majoré", standard:"Partie jaune", extra:"Partie orange",
    requestGrey:"Demander une extension pour la partie grise", targeted:"Quartier demandé", global:"Tout le périmètre du commerce",
    minutes:"Rayon maximal (km)", uplift:"Majoration expérimentale (%)",
    advice:"La zone orange est plus éloignée. Les habitants peuvent être moins enclins à se déplacer jusqu’à votre commerce. BUUURT recommande de privilégier les quartiers proches.",
    orangeVolume:"Affichages à l’écran en zone orange", addedSurface:"Surface supplémentaire estimée"},
  nl: {extended:"Toegestane uitbreiding · verhoogd tarief", standard:"Geel gebied", extra:"Oranje gebied",
    requestGrey:"Uitbreiding aanvragen voor het grijze gebied", targeted:"Aangevraagde wijk", global:"Volledig bereik van de zaak",
    minutes:"Maximale straal (km)", uplift:"Experimentele toeslag (%)",
    advice:"Het oranje gebied ligt verder weg. Bewoners komen mogelijk minder snel naar je zaak. BUUURT raadt nabijgelegen wijken aan.",
    orangeVolume:"Schermweergaven in het oranje gebied", addedSurface:"Geschatte bijkomende oppervlakte"},
  en: {extended:"Authorized extension · surcharge", standard:"Yellow portion", extra:"Orange portion",
    requestGrey:"Request an extension for the grey portion", targeted:"Requested neighbourhood", global:"Entire business area",
    minutes:"Maximum radius (km)", uplift:"Experimental surcharge (%)",
    advice:"The orange area is farther away. Residents may be less likely to visit your business. BUUURT recommends prioritising nearby neighbourhoods.",
    orangeVolume:"Screen displays in the orange area", addedSurface:"Estimated additional area"}
};
function networkWords(lang) { return networkCopy[lang] || networkCopy.nl; }

function radiusLabelPoint({coordinates}) {
  // Intersect each candidate scanline with the rings and choose the widest interior span.
  let best = 0;
  let point;
  for (const polygon of coordinates) {
    const heights = polygon[0].map(p => p[1]);
    const min = Math.min(...heights), max = Math.max(...heights);
    for (let i = 1; i <= 9; i++) {
      const y = min + (max-min)*i/10;
      const xs = [];
      for (const ring of polygon) for (let j = 1; j < ring.length; j++) {
        const [a,b] = [ring[j-1],ring[j]];
        if ((a[1]>y) !== (b[1]>y)) xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));
      }
      xs.sort((a,b)=>a-b);
      for (let j = 1; j < xs.length; j+=2) {
        const width = xs[j]-xs[j-1];
        if (width > best) {
          best = width;
          point = [y,(xs[j]+xs[j-1])/2];
        }
      }
    }
  }
  return point;
}

function radiusRequestWords(lang) {
  return ({
    fr:{revoked:"Révoquée",revoke:"Révoquer l’autorisation",reissue:"Définir un rayon pour cette autorisation",
      legacy:"Autorisation historique conservée · rayon à confirmer",autoOrigin:"Décision automatique historique"},
    nl:{revoked:"Ingetrokken",revoke:"Toestemming intrekken",reissue:"Straal instellen voor deze toestemming",
      legacy:"Historische toestemming bewaard · straal te bevestigen",autoOrigin:"Historische automatische beslissing"},
    en:{revoked:"Revoked",revoke:"Revoke permission",reissue:"Set a radius for this permission",
      legacy:"Historical permission retained · radius needs review",autoOrigin:"Historical automatic decision"}
  })[lang] || {};
}
