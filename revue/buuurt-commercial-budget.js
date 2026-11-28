"use strict";

function initCommercialBudget(features, names) {
  const $c = id => document.getElementById("commercial-" + id);
  $("legacy-package").hidden = true;
  $c("budget").hidden = false;
  $c("back").hidden = false;
  const pools = commercialDemoPools(features);
  const fixture = extensionActor(bikeFixture);
  const ad = extensionAd(url) || "demo-ad";
  const settingsScope = extensionDraftScope(profile, bikeFixture, extensionAd(url));
  let prefs = readSponsorDraft(settingsScope).commercial;
  prefs = {days: commercialDurations.includes(prefs?.days) ? prefs.days : 7, volume: prefs?.volume};
  const validation = url.searchParams.get("step") === "validation";
  let hasError = false;
  const getInput = () => {
    const zones = bikeBudgetSelection();
    return {zones, days: prefs.days, shop: fixture?.shop || bikeFixture, shopName: fixture?.name || bikeFixture,
      validUntil: (Math.floor(Date.now() / commercialDay) + 45) * commercialDay,
      volume: prefs.volume, id: bikeId, names: zones.map(id => names.get(id)), ad};
  };
  const persist = () => writeSponsorDraft({commercial: prefs}, settingsScope);
  function render() {
    const words = commercialWords(language.value);
    const state = commercialRead(localStorage);
    const input = getInput();
    const capacity = commercialCapacity({...input, pools, config: state.config, orders: state.orders});
    const minimum = state.config.minimum, step = state.config.step;
    if (prefs.volume === undefined) prefs.volume = minimum;
    const valid = capacity.max > 0 && prefs.volume >= minimum && prefs.volume <= capacity.max &&
      (prefs.volume - minimum) % step === 0;
    const number = new Intl.NumberFormat(language.value);
    const cents = commercialPrice(prefs.volume, state.config);
    const price = cents === null ? "—" : new Intl.NumberFormat(language.value, {style: "currency", currency: "EUR"}).format(cents / 100);
    const back = new URL(location.href);
    if (validation) back.searchParams.delete("step");
    else {
      back.pathname = back.pathname.replace(/[^/]*$/, "com-pub-spon-003.html");
      for (const key of ["demo", "draft", "campaign"]) back.searchParams.delete(key);
    }
    back.searchParams.set("lang", language.value);
    $c("back").href = back;
    $c("back").textContent = "← " + words.back;
    $c("title").textContent = validation ? words.validation : words.title;
    $c("subtitle").textContent = validation ? "" : words.subtitle;
    for (const [id, value] of Object.entries({demo: words.demo, "duration-title": words.duration,
      "duration-help": words.durationHelp, "capacity-title": words.capacity, "territories-title": words.zones,
      guarantee: words.guarantee, reduce: words.reduce, next: validation ? words.confirm : words.next})) $c(id).textContent = value;
    $c("duration").replaceChildren(...commercialDurations.map(d => new Option(d + " " + words.day, d)));
    $c("duration").value = prefs.days;
    $c("duration").disabled = validation;
    $c("capacity").textContent = capacity.max ? number.format(minimum) + " – " + number.format(capacity.max) + " " + words.volume.toLowerCase() :
      state.config.enabled ? capacity.missing ? words.missing : words.alternative : words.off;
    $c("volume-title").textContent = words.volume + " · " + number.format(prefs.volume);
    $c("volume").min = minimum;
    $c("volume").max = capacity.max || minimum;
    $c("volume").step = step;
    $c("volume").value = prefs.volume;
    $c("volume").disabled = !capacity.max || validation;
    $c("reduce").hidden = !capacity.max || valid || validation;
    $c("price").textContent = words.price + " · " + price;
    $c("territories").textContent = input.names.join(" · ");
    $c("error").textContent = hasError ? words.changed : capacity.max && !valid ? words.alternative : "";
    $c("next").disabled = !valid || !input.zones.length || !fixture;
  }
  $c("duration").onchange = () => {prefs.days = +$c("duration").value;persist();render();};
  $c("volume").oninput = () => {prefs.volume = +$c("volume").value;persist();render();};
  $c("reduce").onclick = () => {prefs.volume = +$c("volume").max;persist();render();};
  $c("next").onclick = async () => {
    if (!validation) {
      const state = commercialRead(localStorage);
      const input = getInput();
      const capacity = commercialCapacity({...input, pools, config: state.config, orders: state.orders});
      if (!fixture || !input.zones.length || input.volume < state.config.minimum ||
          (input.volume - state.config.minimum) % state.config.step || input.volume > capacity.max) {
        hasError = true;
        render();
        return;
      }
      if (!persist()) return;
      const next = new URL(location.href);
      next.searchParams.set("step", "validation");
      next.searchParams.set("quote", commercialPrice(prefs.volume, commercialRead(localStorage).config));
      location.assign(next);
      return;
    }
    $c("next").disabled = true;
    try {
      await commercialLocked(() => {
        const config = commercialRead(localStorage);
        const input = getInput();
        const existing = config.orders.find(o => o.id === bikeId && o.shop === input.shop && o.state === "purchased");
        if (existing) return;
        if (!input.zones.length || input.zones.join() !== displayedBikeSelection.join() ||
            commercialPrice(input.volume, config.config) !== Number(url.searchParams.get("quote"))) throw Error("changed");
        const order = commercialOrder(config, input, pools);
        // No payment step in the demo. Recheck, reserve and convert inside one lock and one write.
        order.state = "purchased";
        commercialSave(localStorage, config);
      });
      const tracking = new URL("com-pub-spon-commercial.html", url);
      tracking.searchParams.set("lang", language.value);
      tracking.searchParams.set("fixture", bikeFixture);
      tracking.searchParams.set("order", bikeId);
      tracking.searchParams.set("return", location.href);
      location.assign(tracking);
    } catch {
      hasError = true;
      render();
    }
  };
  window.addEventListener("focus", render);
  window.addEventListener("storage", event => {if (event.key === commercialKey) render();});
  language.addEventListener("change", render);
  render();
}
