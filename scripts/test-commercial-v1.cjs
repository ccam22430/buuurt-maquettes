"use strict";
const {test} = require("node:test");
const assert = require("node:assert/strict");
const {commercialDefaults,commercialCapacity,commercialPrice,commercialOrder,commercialCampaignStatus,
  commercialDelivery,commercialProrata,commercialRecommendation} = require("../revue/buuurt-commercial");
const now = Date.parse("2026-11-28T12:00:00Z");
const config = {...commercialDefaults, enabled:true};
const pools = [
  {id:"a",territories:["a"],daily:2000,reliable:true,active:38,history:45,qr:35,scans:8400},
  {id:"b",territories:["b"],daily:2000,reliable:true,active:38,history:45,qr:35,scans:8400},
  {id:"common",territories:["a","b"],daily:1000,reliable:true,active:38,history:45,qr:35,scans:8400},
];
const query = {zones:["a","b"],days:7,shop:"one",config,pools,orders:[],now};
test("de-duplicates overlapping zones and floors the 10% quota", () => {
  const c= commercialCapacity(query);
  assert.equal(c.estimate,35000);
  assert.equal(c.commercializable,24500);
  assert.equal(c.quota,2450);
  assert.equal(c.max,2400);
  assert.equal(commercialCapacity({...query,zones:[]}).max,0);
  assert.equal(commercialCapacity({...query,days:1}).max,0);
  assert.equal(commercialCapacity({...query,config:{...config,enabled:false}}).max,0);
});
test("reservations and cumulative quota protect overlapping campaigns, expiring holds and valid prices", () => {
  const state={config,orders:[]};
  const base={...query,id:"first",volume:1500,names:["A","B"],validUntil:now+30*86400000};
  const order=commercialOrder(state,base,pools,now);
  assert.equal(commercialCapacity({...query,orders:state.orders}).max,900);
  assert.throws(()=>commercialOrder(state,{...base,id:"second",volume:1000},pools,now),/capacity/);
  assert.equal(commercialOrder(state,base,pools,now),order);
  assert.equal(commercialCapacity({...query,orders:state.orders,now:now+11*60000}).max,2400);
  order.state="purchased";
  assert.equal(commercialCapacity({...query,orders:state.orders,now:now+11*60000}).max,900);
  assert.equal(commercialPrice(1200,config),3000);
  assert.equal(commercialPrice(2501,config),null);
});
test("suspends unverifiable inventory and retains strategy as advisory", () => {
  const insufficient={...pools[0],history:29};
  assert.equal(commercialCapacity({...query,pools:[insufficient]}).max,0);
  assert.equal(commercialRecommendation(insufficient,config),null);
  assert.equal(commercialRecommendation(pools[0],config).mature,true);
  assert.equal(commercialDefaults.enabled,false);
});
test("delivery guarantee stops at target or expiry and computes the proportional refund", () => {
  const sample={state:"purchased",volume:2500,paid:5000,delivered:1800,days:3,created:now,validUntil:now+10*86400000,zones:["a"]};
  assert.equal(commercialProrata(sample),1400);
  assert.equal(commercialCampaignStatus(sample,now+4*86400000),"extended");
  assert.equal(commercialCampaignStatus(sample,now+11*86400000),"under");
  assert.throws(()=>commercialDelivery(sample,200,now+11*86400000));
  commercialDelivery(sample,1000,now+4*86400000);
  assert.equal(sample.delivered,2500);
  assert.equal(commercialCampaignStatus(sample,now+4*86400000),"complete");
  assert.deepEqual(sample.zones,["a"]);
});

test("territorial coverage keeps the pioneer, handles outages and separates sponsorship", () => {
  const {geoCoverage, geoAttachments, geoEligibility} = require("../revue/buuurt-commercial-geo");
  assert.equal(geoCoverage({direct:true,reliable:false}),"covered");
  const base={direct:false,nearbyLimit:10,reasonableLimit:25,reliable:true};
  assert.equal(geoCoverage({...base,reliable:false}),"manual");
  assert.equal(geoCoverage({...base,routed:[{minutes:7,active:1}]}),"near");
  assert.equal(geoCoverage({...base,routed:[{minutes:19,active:1}]}),"far");
  assert.equal(geoCoverage({...base,routed:[{minutes:31,active:1}]}),"none");
  const attachments=geoAttachments({home:"pioneer",mode:"car",excentered:true,limits:{car:15},
    routes:[{id:"neighbor",mode:"car",reliable:true,minutes:7}],desired:["outside","neighbor","neighbor"]});
  assert.deepEqual(attachments,{attached:["pioneer","neighbor"],requests:["outside"]});
  const growth={base:"other",geographic:true,active:1,opportunities:1,reliable:true};
  assert.deepEqual(geoEligibility(growth,false),{band:"direct",purchasable:false});
  assert.deepEqual(geoEligibility({...growth,active:0},true),{band:"other",purchasable:false});
});
test("QR, views and shadow inventory are distinct and the feed cap is one-third", () => {
  const {sponsoredSlots, forecastEvent, recordInterest, interestList} = require("../revue/buuurt-commercial-geo");
  const candidates=[{id:"a",shop:"one",eligible:true},{id:"b",shop:"one",eligible:true},{id:"c",shop:"two",eligible:true}];
  assert.deepEqual(sponsoredSlots(6,candidates),{allowance:2,chosen:["a","c"]});
  assert.deepEqual(sponsoredSlots(6,candidates,5),{allowance:1,chosen:["a"]});
  const metrics=forecastEvent(forecastEvent(forecastEvent({}, "scan"), "visit"), "shadow", 2);
  assert.deepEqual(metrics,{scans:1,visits:1,opportunities:2});
  let value;
  const storage={getItem:()=>value,setItem:(_,next)=>{value=next}};
  recordInterest(storage,"zone",true);
  recordInterest(storage,"zone",true);
  assert.deepEqual(interestList(storage),["zone"]);
  recordInterest(storage,"zone",false);
  assert.deepEqual(interestList(storage),[]);
});
