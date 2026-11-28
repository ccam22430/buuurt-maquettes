"use strict";
const {test} = require("node:test");
const assert = require("node:assert/strict");
const {networkCategory, networkBands, networkInventory, orangeKey} = require("../revue/buuurt-network-zones.js");
const {commercialMixedPrice, commercialDefaults, commercialOrder} = require("../revue/buuurt-commercial.js");
const {extensionActor, extensionSubmit, extensionChange, networkGrants} = require("../revue/buuurt-extension-store.js");
const data = require("../revue/data/amsterdam-network-zones-dolores.json");
const pilot = require("../revue/data/amsterdam-network-zones-pilot.json");
const times = require("../revue/data/amsterdam-bike-times.json");
const landlust = "03630970000024";
const market = "03630970000026";
const districts = [landlust, market].map(id => ({id}));
const baseline = {local:5, standard:10};
const targeted = {kind:"targeted", zone:landlust, minutes:20};
const global = {kind:"global", minutes:15};

test("thresholds are inclusive and unknown network routes never qualify", () => {
  assert.deepEqual([0,300,300.001,600,600.001,900,900.001,NaN,null].map(s =>
    networkCategory(s, landlust, baseline, [global])),
  ["home","home","direct","direct","extended","extended","other","other","other"]);
});

test("clipped real data splits both reference districts, orange adds only eligible minute bins", () => {
  assert.equal(data.networkSha256, times.sourceSha256);
  const base = networkBands(data, districts, baseline);
  const extended = networkBands(data, districts, baseline, [global, targeted, global]);
  assert.equal(base.bands[landlust],"direct");
  assert.equal(base.bands[market],"direct");
  assert.equal(base.bands[orangeKey(landlust)],undefined);
  assert.equal(extended.bands[orangeKey(landlust)],"extended");
  assert.deepEqual(extended.layers.filter(f => f.properties.category !== "extended"),base.layers);
  assert.equal(networkBands(data,districts,baseline,[targeted]).bands[orangeKey(market)],undefined);
  assert.equal(networkCategory(840,landlust,baseline,[global]),"extended");
  assert.equal(networkCategory(1100,landlust,baseline,[global]),"other");
});

test("stable partner opportunities are classified once per advertiser and pricing surcharges only orange", () => {
  assert.deepEqual(data.networkSamples[landlust].map(p=>p.id),pilot.networkSamples[landlust].map(p=>p.id));
  const raw = [{id:landlust, territories:[landlust], daily:720}];
  const pools = networkInventory(raw,data,baseline,[global,targeted]);
  assert.equal(new Set(pools.map(p=>p.id)).size,pools.length);
  assert(pools.reduce((sum,p)=>sum+p.daily,0)<=720);
  assert(pools.some(p=>p.band==="extended") && pools.some(p=>p.band==="direct"));
  assert.equal(commercialMixedPrice(1200,400,50,commercialDefaults),3500);
  assert.equal(commercialMixedPrice(500,500,50,commercialDefaults),2250);
  assert.equal(commercialMixedPrice(2500,0,50,commercialDefaults),5000);
});

test("mixed orders reserve separate real opportunity pools and reject an infeasible split", () => {
  const state = {orders:[],config:{...commercialDefaults,enabled:true}}, now = Date.now();
  const pools = ["direct","extended"].map(band=>({id:band,band,daily:8500,history:45,reliable:true,active:10,territories:[band]}));
  const args = {id:"one",shop:"shop",names:["a","b"],zones:["direct","extended"],days:7,volume:1200,orange:400,uplift:50};
  const order = commercialOrder(state,args,pools,now);
  const extended = Object.entries(order.allocation).filter(([key])=>key.startsWith("extended:")).reduce((sum,[,n])=>sum+n,0);
  assert.equal(extended,400);
  assert.equal(order.paid,3500);
  assert.throws(()=>commercialOrder(state,{...args,id:"two"},[pools[0]],now),/segmented capacity/);
});

test("only a reviewed authorization changes one merchant's categories and targeted revocation preserves global rights", () => {
  const db = {value:null,getItem(){return this.value;},setItem(_,value){this.value=value;}};
  const merchant=extensionActor("dolores"), admin={role:"geo-admin",id:"review-admin"};
  const submit=zone=>extensionSubmit(db,merchant,{zone,note:"Customer access",band:"other"});
  const approve=(record,kind,minutes)=>extensionChange(db,admin,record.id,{
    action:"accepted",scope:"shop",revision:1,kind,minutes,standard:10,network:data.version
  });
  const a=approve(submit(landlust),"targeted",20);
  approve(submit(market),"global",15);
  assert.equal(networkCategory(1100,landlust,baseline,networkGrants(db,"dolores",null)),"extended");
  assert.equal(networkGrants(db,"pilot",null).length,0);
  extensionChange(db,admin,a.id,{action:"revoked",note:"Review",revision:2});
  assert.equal(networkCategory(840,landlust,baseline,networkGrants(db,"dolores",null)),"extended");
  assert.equal(networkCategory(1100,landlust,baseline,networkGrants(db,"dolores",null)),"other");
});
