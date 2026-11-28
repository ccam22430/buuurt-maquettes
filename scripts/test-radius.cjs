"use strict";
const assert = require("node:assert/strict");
const test = require("node:test");
global.polygonClipping = require("../revue/vendor/polygon-clipping-0.15.7.js");
const {geoDistance,radiusCircle,radiusCategory,radiusSettings,saveRadiusConfig,radiusBands,radiusInventory,
  scannedShopEligibility} = require("../revue/buuurt-radius.js");
const {extensionActor,extensionSubmit,extensionChange,networkGrants} = require("../revue/buuurt-extension-store.js");
const radius = {local:1000,standard:3000};
const center = [52.36395892,4.86340111];
const storage = () => { const entries = new Map(); return {getItem:key=>entries.get(key),setItem:(key,value)=>entries.set(key,value)}; };
const admin = {id:"review-admin",role:"geo-admin"};

test("map circles and QR eligibility share a consistent great-circle metric", () => {
  assert(Math.abs(geoDistance([0,179],[0,-179])-222390.16)<.01);
  for (const metres of [1000,3000,5000,10000]) {
    const [ring] = radiusCircle(center,metres);
    assert.deepEqual(ring[0],ring.at(-1));
    for (const [lon,lat] of ring) assert(Math.abs(geoDistance(center,[lat,lon])-metres)<.00001);
  }
  assert.deepEqual([1000,1000.01,3000,3000.01,5000,5000.01].map(d=>
    radiusCategory(d,"a",radius,[{kind:"global",metres:5000}])),["home","direct","direct","extended","extended","other"]);
  assert.equal(radiusCategory(4500,"b",radius,[{kind:"targeted",zone:"a",metres:5000}]),"other");
  const [ring] = radiusCircle(center,3500);
  const [lon,lat] = ring[0];
  const partner = {district:"a",coordinate:[lat,lon]};
  const grants = [{kind:"global",metres:5000}];
  assert.equal(scannedShopEligibility(center,partner,radius,grants,["a"]),"other");
  assert.equal(scannedShopEligibility(center,partner,radius,grants,["a:extended"]),"extended");
});

test("urban and rural defaults and business overrides are independent", () => {
  const store = storage();
  assert.deepEqual(radiusSettings(store,"amsterdam","dolores"),radius);
  assert.deepEqual(radiusSettings(store,"rural-demo","dolores","rural"),{local:5000,standard:10000});
  assert.throws(()=>saveRadiusConfig(null,store,"cities","amsterdam",radius));
  saveRadiusConfig(admin,store,"cities","amsterdam",{local:900,standard:3200});
  saveRadiusConfig(admin,store,"shops","dolores",{local:1200,standard:4000});
  assert.equal(radiusSettings(store,"amsterdam","dolores").standard,4000);
  assert.equal(radiusSettings(store,"amsterdam","pilot").standard,3200);
});

test("clipped portions preserve official geometry and retain separate inventory", () => {
  const data = require("../revue/data/amsterdam-radius-fixtures.json").profiles.dolores;
  const path = require("node:path").join(__dirname,"../revue/data/amsterdam-levels-wijken.geojson");
  const features = JSON.parse(require("node:fs").readFileSync(path)).features;
  const id = "03630970000008";
  const district = features.find(f=>f.id===id);
  const original = JSON.stringify(district);
  const grants = [{kind:"targeted",zone:id,metres:5000}];
  const result = radiusBands(data,[district],radius,grants);
  assert.equal(JSON.stringify(district),original);
  assert.equal(result.bands[id],"direct");
  assert.equal(result.bands[id+":extended"],"extended");
  const [standard,orange] = result.layers;
  assert.deepEqual(polygonClipping.intersection(standard.geometry.coordinates,orange.geometry.coordinates),[]);
  const pools = radiusInventory([{id,territories:[id],daily:1000}],data,radius,grants);
  assert.equal(new Set(pools.map(p=>p.id)).size,pools.length);
  assert(pools.reduce((total,p)=>total+p.daily,0)<=1000);
});

test("legacy approvals retain their history and require an explicit radius decision", () => {
  const db = storage(), merchant = extensionActor("dolores");
  const request = extensionSubmit(db,merchant,{zone:"zone",band:"other",note:"Example"});
  extensionChange(db,admin,request.id,{action:"accepted",scope:"shop",revision:1,kind:"targeted",
    minutes:15,standard:10,network:"old"});
  assert.equal(networkGrants(db,"dolores",null)[0].minutes,15);
  const approved = extensionChange(db,admin,request.id,{action:"accepted",scope:"shop",revision:2,kind:"targeted",
    metres:5000,standard:3000,network:"geodesic-v1"});
  assert.equal(approved.events.at(-1).previous.minutes,15);
  assert.equal(networkGrants(db,"dolores",null)[0].metres,5000);
});
