"use strict";

const sponsorDraftKey = "buuurt-review:com-pub-spon-001:cbs-2025";

function readSponsorDraft() {
  try {
    return JSON.parse(sessionStorage.getItem(sponsorDraftKey)) || {};
  } catch {
    return {};
  }
}

function writeSponsorDraft(changes) {
  try {
    sessionStorage.setItem(sponsorDraftKey, JSON.stringify({...readSponsorDraft(), ...changes}));
    return true;
  } catch {
    return false;
  }
}
