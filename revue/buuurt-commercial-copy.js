"use strict";
const commercialCopy = {
  fr: ["Plus de visibilité, selon votre budget", "Choisissez le nombre d’affichages à l’écran que vous souhaitez pour votre annonce.",
    "Durée de diffusion indicative", "Sur combien de jours souhaitez-vous répartir la diffusion de votre annonce ?",
    "Capacité disponible", "Affichages à l’écran", "Territoires sélectionnés",
    "Le nombre d’affichages à l’écran que vous achetez est garanti. La durée de diffusion est indicative et dépend de la fréquentation de votre territoire.",
    "Données et prix expérimentaux de démonstration", "Continuer", "Validation de la campagne", "Confirmer la simulation",
    "Pour diffuser davantage votre annonce, vous pouvez prolonger sa durée de diffusion ou sélectionner d’autres quartiers.",
    "Les ventes sponsorisées sont désactivées.", "Les données disponibles ne permettent pas de vérifier la capacité.",
    "Choisir le maximum disponible", "Prix total", "Retour", "jours", "La disponibilité a changé. Vérifiez votre configuration."],
  nl: ["Meer zichtbaarheid, volgens je budget", "Kies hoe vaak je advertentie op het scherm moet verschijnen.",
    "Indicatieve looptijd", "Over hoeveel dagen wil je de weergaven van je advertentie verdelen?",
    "Beschikbare capaciteit", "Schermweergaven", "Geselecteerde gebieden",
    "Het gekochte aantal schermweergaven is gegarandeerd. De looptijd is indicatief en hangt af van het bezoek in je gebied.",
    "Experimentele demogegevens en prijzen", "Verder", "Campagne controleren", "Simulatie bevestigen",
    "Verleng de looptijd of kies extra wijken om je advertentie vaker te laten zien.",
    "Gesponsorde verkoop staat uit.", "Er zijn onvoldoende gegevens om de capaciteit te controleren.",
    "Kies het beschikbare maximum", "Totaalprijs", "Terug", "dagen", "De beschikbaarheid is gewijzigd. Controleer je instellingen."],
  en: ["More visibility, within your budget", "Choose how often you want your ad to appear on screen.",
    "Indicative delivery duration", "Over how many days would you like to spread delivery?",
    "Available capacity", "On-screen displays", "Selected territories",
    "Your purchased number of on-screen displays is guaranteed. The duration is indicative and depends on traffic in your territory.",
    "Experimental demonstration data and prices", "Continue", "Review your campaign", "Confirm simulation",
    "To reach more people, extend the delivery duration or select more neighborhoods.",
    "Sponsored sales are switched off.", "There is insufficient data to verify capacity.",
    "Use the available maximum", "Total price", "Back", "days", "Availability has changed. Check your settings."]
};
const commercialKeys = ["title", "subtitle", "duration", "durationHelp", "capacity", "volume", "zones", "guarantee",
  "demo", "next", "validation", "confirm", "alternative", "off", "missing", "reduce", "price", "back", "day", "changed"];
function commercialWords(lang) {
  return Object.fromEntries(commercialKeys.map((key, i) => [key, (commercialCopy[lang] || commercialCopy.nl)[i]]));
}
