"use strict";

const extensionCopy = {
  fr: {
    duplicate: "Une demande pour ce quartier est déjà en cours de traitement.",
    explain: "BUUURT privilégie le commerce de proximité afin de proposer aux habitants des annonces pertinentes. Si votre clientèle s'étend au-delà de votre territoire local, vous pouvez demander à élargir votre zone de diffusion.",
    why: "Pourquoi souhaitez-vous diffuser votre annonce dans ce quartier ?",
    example: "Par exemple : une partie de ma clientèle habite dans ce quartier.",
    free: "Votre demande est gratuite et sera examinée par l’équipe BUUURT.",
    sent: "Votre demande a bien été envoyée. Vous recevrez une notification dès qu’elle aura été examinée par l’équipe BUUURT.",
    requests: "Demandes d’extension", mine: "Mes demandes d’extension", demo: "Démonstration locale dans ce navigateur",
    pending: "En attente", clarify: "Précisions demandées", accepted: "Acceptée", refused: "Refusée",
    submitted: "Demande reçue", reply: "Réponse du commerçant", actionCount: "Demandes à traiter",
    all: "Tous les statuts", empty: "Aucune demande", history: "Historique des échanges",
    response: "Votre message", answer: "Envoyer ma réponse", decide: "Enregistrer la décision",
    shop: "Permanente pour le commerce", ad: "Pour cette annonce uniquement", until: "Jusqu’à une date de fin",
    scope: "Portée de l’autorisation", experimental: "Portées expérimentales, soumises à validation", expired: "Autorisation expirée",
    invalid: "Action indisponible. Vérifiez le message, la portée ou la date de fin.",
    authorized: "Ce quartier est désormais sélectionnable pour ce commerce."
  },
  nl: {
    duplicate: "Er wordt al een aanvraag voor deze wijk behandeld.",
    explain: "BUUURT geeft voorrang aan lokale winkels om inwoners relevante advertenties te tonen. Als je klantenkring verder reikt dan je lokale gebied, kun je een uitbreiding van je verspreidingsgebied aanvragen.",
    why: "Waarom wil je je advertentie in deze wijk tonen?", example: "Bijvoorbeeld: een deel van mijn klanten woont in deze wijk.",
    free: "Je aanvraag is gratis en wordt beoordeeld door het BUUURT-team.",
    sent: "Je aanvraag is verstuurd. Je ontvangt een melding zodra het BUUURT-team deze heeft beoordeeld.",
    requests: "Uitbreidingsaanvragen", mine: "Mijn uitbreidingsaanvragen", demo: "Lokale demo in deze browser",
    pending: "In afwachting", clarify: "Toelichting gevraagd", accepted: "Goedgekeurd", refused: "Afgewezen",
    submitted: "Aanvraag ontvangen", reply: "Antwoord van de winkelier", actionCount: "Te beoordelen aanvragen",
    all: "Alle statussen", empty: "Geen aanvragen", history: "Gespreksgeschiedenis", response: "Je bericht",
    answer: "Mijn antwoord versturen", decide: "Beslissing opslaan", shop: "Permanent voor de winkel",
    ad: "Alleen voor deze advertentie", until: "Tot een einddatum", scope: "Bereik van toestemming", experimental: "Experimentele opties, ter validatie",
    expired: "Toestemming verlopen", invalid: "Controleer het bericht, het bereik of de einddatum.",
    authorized: "Deze wijk kan nu worden geselecteerd voor deze winkel."
  },
  en: {
    duplicate: "A request for this neighborhood is already being reviewed.",
    explain: "BUUURT prioritizes local shops so residents see relevant ads. If your customers live beyond your local area, you can request an extension to your distribution area.",
    why: "Why would you like to show your ad in this neighborhood?", example: "For example: some of my customers live in this neighborhood.",
    free: "Your request is free and will be reviewed by the BUUURT team.",
    sent: "Your request was sent. You’ll receive a notification once the BUUURT team has reviewed it.",
    requests: "Extension requests", mine: "My extension requests", demo: "Local demonstration in this browser",
    pending: "Pending", clarify: "Clarification requested", accepted: "Accepted", refused: "Declined",
    submitted: "Request received", reply: "Merchant reply", actionCount: "Requests needing action",
    all: "All statuses", empty: "No requests", history: "Conversation history", response: "Your message",
    answer: "Send my reply", decide: "Save decision", shop: "Permanent for this shop", ad: "This ad only",
    until: "Until an end date", scope: "Authorization scope", experimental: "Experimental options, pending approval", expired: "Authorization expired",
    invalid: "Check the message, scope or end date.", authorized: "This neighborhood is now selectable for this shop."
  }
};

function extensionWords(lang) { return extensionCopy[lang] || extensionCopy.nl; }

function extensionLink(fixture, lang, {admin = false, id, ad} = {}) {
  const url = new URL("com-pub-spon-requests.html", location.href);
  url.searchParams.set("lang", lang);
  if (admin) url.searchParams.set("role", "admin");
  else url.searchParams.set("fixture", fixture);
  if (id) url.searchParams.set("request", id);
  if (ad) url.searchParams.set("ad", ad);
  return url;
}

function installExtensionBell(actor, getLanguage, ad) {
  const admin = actor?.role === "geo-admin";
  if (!actor) {
    window.buuurtReviewNotifications = () => [];
    window.dispatchEvent(new Event("buuurt-notifications-change"));
    return;
  }
  const key = extensionKey + ":read:" + (admin ? actor.id : actor.merchant);
  const read = () => {
    try {
      const ids = JSON.parse(localStorage.getItem(key));
      return Array.isArray(ids) ? ids : [];
    } catch { return []; }
  };
  window.buuurtReviewNotifications = () => extensionRecords(localStorage)
    .filter(record => admin || extensionOwns(actor, record))
    .flatMap(record => record.events.flatMap((event, index) => {
      if (!(admin ? ["submitted", "reply"] : ["accepted", "refused", "clarify"]).includes(event.type)) return [];
      const id = record.id + ":" + index;
      const lang = getLanguage();
      return [{label: record.zoneName + " · " + extensionWords(lang)[event.type],
        href: extensionLink(actor.fixture, lang, {admin, id: record.id, ad: record.ad || ad}).href,
        unread: !read().includes(id),
        markRead: () => localStorage.setItem(key, JSON.stringify([...new Set([...read(), id])]))}];
    }));
  window.dispatchEvent(new Event("buuurt-notifications-change"));
}
