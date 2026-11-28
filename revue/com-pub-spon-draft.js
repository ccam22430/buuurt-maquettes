"use strict";

const sponsorDraftKey = "buuurt-review:com-pub-spon-001:cbs-2025";

const sponsorStorageKey = profile => profile === "amsterdam" ? sponsorDraftKey : sponsorDraftKey + ":" + profile;

function readSponsorDraft(profile = "amsterdam") {
  try {
    return JSON.parse(sessionStorage.getItem(sponsorStorageKey(profile))) || {};
  } catch {
    return {};
  }
}

function writeSponsorDraft(changes, profile = "amsterdam") {
  try {
    sessionStorage.setItem(sponsorStorageKey(profile), JSON.stringify({...readSponsorDraft(profile), ...changes}));
    return true;
  } catch {
    return false;
  }
}
