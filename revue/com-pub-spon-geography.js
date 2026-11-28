"use strict";

const defaultReviewProfile = "dolores";
const reviewProfiles = {
  dolores: {
    region: "amsterdam", dataset: "amsterdam-commercial-v1", water: true, merchantId: "review-dolores", name: "Dolores Del Dia Vintage & Modern",
    bagId: "0363200000412904", address: "Jan Pieter Heijestraat 91, 1053 GM Amsterdam",
    center: [52.36395892, 4.86340111]
  },
  amsterdam: {region: "amsterdam", dataset: "amsterdam-commercial-v1", water: true, merchantId: "geo-06-amsterdam", bagId: "0363200000145991",
    address: "Jan Evertsenstraat 55-H, Amsterdam", center: [52.3707909, 4.8556261]},
  "amsterdam-levels": {region: "amsterdam", dataset: "amsterdam-levels-wijken", mapPage: "com-pub-spon-002.html"},
  graft: {region: "graft", merchantId: "geo-06-graft", bagId: "0365200000002169",
    address: "Raadhuisstraat 24, Graft", center: [52.56244524, 4.83183462]}
};

function sponsorDataset(profile) {
  return profile.dataset || profile.region + "-cbs-2025";
}

function sponsorDraftScope(name) {
  const dataset = Object.hasOwn(reviewProfiles, name) && reviewProfiles[name].dataset;
  return dataset ? name + ":" + dataset : name;
}

function ringPosition([x, y], ring) {
  let inside = false;
  for (let i = 1; i < ring.length; i++) {
    const [ax, ay] = ring[i - 1];
    const [bx, by] = ring[i];
    if (x >= Math.min(ax, bx) && x <= Math.max(ax, bx) &&
        y >= Math.min(ay, by) && y <= Math.max(ay, by) &&
        Math.abs((bx - ax) * (y - ay) - (by - ay) * (x - ax)) <= 1e-14) return "boundary";
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
  }
  return inside ? "inside" : "outside";
}

function geometryPosition(point, geometry) {
  if (!geometry || !["Polygon", "MultiPolygon"].includes(geometry.type)) throw new Error("geometry");
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  for (const [outer, ...holes] of polygons) {
    const edge = ringPosition(point, outer);
    if (edge === "boundary") return edge;
    if (edge !== "inside") continue;
    const interiors = holes.map(hole => ringPosition(point, hole));
    if (interiors.includes("boundary")) return "boundary";
    if (!interiors.includes("inside")) return "inside";
  }
  return "outside";
}

function classifySponsorTerritory(center, features, neighbors) {
  if (!Array.isArray(center) || center.length !== 2 || !center.every(Number.isFinite) ||
      Math.abs(center[0]) > 90 || Math.abs(center[1]) > 180) throw new Error("coordinates");
  const point = [center[1], center[0]];
  const home = [];
  for (const feature of features) {
    const position = geometryPosition(point, feature.geometry);
    if (position === "boundary") throw new Error("boundary");
    if (position === "inside") home.push(feature.id);
  }
  if (home.length !== 1) throw new Error("territory");
  const [homeCode] = home;
  const direct = new Set(neighbors[homeCode]);
  if (!direct.size) throw new Error("neighbors");
  const second = new Set([...direct].flatMap(code => neighbors[code] || []));
  const bands = Object.fromEntries(features.map(({id}) => [id, id === homeCode ? "home" :
    direct.has(id) ? "direct" : second.has(id) ? "second" : "other"]));
  return {home: homeCode, direct: [...direct], bands};
}

if (typeof module !== "undefined") module.exports = {classifySponsorTerritory, reviewProfiles};
