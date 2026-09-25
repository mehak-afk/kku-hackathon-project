(() => {
  "use strict";
  const STORAGE_KEY = "offer-compass-values-v1";
  const inputs = [...document.querySelectorAll("input[data-group][data-key]")];
  const output = (name) => document.querySelector(`[data-output="${name}"]`);
  const liveStatus = document.querySelector("#live-status");

  function formatMoney(cents) {
    const sign = cents < 0 ? "-" : "";
    const absolute = Math.abs(cents);
    return `${sign}$${(absolute / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  function parseCents(value) {
    const text = value.trim();
    if (!text) return { valid: false, message: "Enter an amount." };
    if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return { valid: false, message: "Use a non-negative number with up to 2 decimal places." };
    const [whole, fraction = ""] = text.split(".");
    const cents = Number(whole) * 100 + Number((fraction + "00").slice(0, 2));
    return Number.isSafeInteger(cents) ? { valid: true, cents } : { valid: false, message: "Enter a smaller amount." };
  }
  function parseRate(value) {
    const text = value.trim();
    if (!text) return { valid: false, message: "Enter a deduction rate." };
    if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return { valid: false, message: "Use a rate from 0 to 100 with up to 2 decimal places." };
    const [whole, fraction = ""] = text.split(".");
    const hundredths = Number(whole) * 100 + Number((fraction + "00").slice(0, 2));
    return hundredths <= 10000 ? { valid: true, hundredths } : { valid: false, message: "Use a deduction rate from 0 to 100%." };
  }
  function valuesFor(group) { return Object.fromEntries(inputs.filter((input) => input.dataset.group === group).map((input) => [input.dataset.key, input.value])); }
  function calculateOffer(values) {
    const basic = parseCents(values.basic), housing = parseCents(values.housing), transport = parseCents(values.transport), rate = parseRate(values.rate);
    const checks = { basic, housing, transport, rate };
    if (Object.values(checks).some((check) => !check.valid)) return { valid: false, checks };
    const gross = basic.cents + housing.cents + transport.cents;
    const basis = basic.cents + housing.cents;
    const deduction = Math.floor((basis * rate.hundredths + 5000) / 10000);
    return { valid: true, checks, basic: basic.cents, housing: housing.cents, transport: transport.cents, rate: rate.hundredths, gross, basis, deduction, takeHome: gross - deduction };
  }
  function setText(name, value) { const node = output(name); if (node) node.textContent = value; }
  function errorId(group, key) { return group === "plan" ? (key === "bills" ? "monthly-bills-error" : "savings-goal-error") : `${group}-${key}-error`; }
  function showErrors(group, checks) {
    Object.entries(checks).forEach(([key, check]) => {
      const input = document.querySelector(`[data-group="${group}"][data-key="${key}"]`);
      const error = document.querySelector(`#${errorId(group, key)}`);
      if (!input || !error) return;
      input.setAttribute("aria-invalid", String(!check.valid));
      error.textContent = check.valid ? "" : check.message;
    });
  }
  function renderPrimary(offer) {
    if (!offer.valid) {
      ["basic-value", "housing-value", "transport-value", "gross", "basis", "rate-value", "deduction", "take-home"].forEach((key) => setText(`primary-${key}`, "—"));
      setText("primary-summary", "Fill in all four fields to calculate your take-home pay."); return;
    }
    setText("primary-basic-value", formatMoney(offer.basic)); setText("primary-housing-value", formatMoney(offer.housing)); setText("primary-transport-value", formatMoney(offer.transport));
    setText("primary-gross", formatMoney(offer.gross)); setText("primary-basis", formatMoney(offer.basis)); setText("primary-rate-value", `${(offer.rate / 100).toFixed(2)}%`);
    setText("primary-deduction", `−${formatMoney(offer.deduction)}`); setText("primary-take-home", formatMoney(offer.takeHome)); setText("primary-summary", "Your monthly pay after the estimated deduction.");
  }
  function renderPlan(offer) {
    const plan = valuesFor("plan"), bills = parseCents(plan.bills), goal = parseCents(plan.goal);
    showErrors("plan", { bills, goal });
    if (!offer.valid || !bills.valid || !goal.valid) {
      setText("savings-months", "—"); setText("savings-message", offer.valid ? "Add valid bills and a savings goal to see your plan." : "Calculate your first offer before planning savings.");
      setText("savings-take-home", offer.valid ? formatMoney(offer.takeHome) : "—"); setText("savings-bills", bills.valid ? formatMoney(bills.cents) : "—"); setText("savings-available", "—"); return;
    }
    const available = offer.takeHome - bills.cents;
    setText("savings-take-home", formatMoney(offer.takeHome)); setText("savings-bills", formatMoney(bills.cents)); setText("savings-available", formatMoney(available));
    if (goal.cents === 0) { setText("savings-months", "0 months"); setText("savings-message", "Your savings goal is already met."); }
    else if (available === 0) { setText("savings-months", "Not reachable yet"); setText("savings-message", "No money remains after bills. Adjust income, bills, or your goal."); }
    else if (available < 0) { setText("savings-months", "Not reachable yet"); setText("savings-message", `Your monthly bills are ${formatMoney(Math.abs(available))} higher than estimated take-home.`); }
    else { const months = Math.ceil(goal.cents / available); setText("savings-months", `${months} ${months === 1 ? "month" : "months"}`); setText("savings-message", `Save ${formatMoney(available)} each month to reach ${formatMoney(goal.cents)}.`); }
  }
  function renderComparison(primary, second) {
    setText("comparison-primary", primary.valid ? formatMoney(primary.takeHome) : "—"); setText("comparison-second", second.valid ? formatMoney(second.takeHome) : "—");
    if (!primary.valid || !second.valid) { setText("comparison-heading", "Ready when you are"); setText("comparison-message", "Add valid numbers for both offers to compare them."); return; }
    const difference = Math.abs(primary.takeHome - second.takeHome);
    if (difference === 0) { setText("comparison-heading", "It is a tie"); setText("comparison-message", "Both offers have the same estimated monthly take-home pay."); }
    else if (primary.takeHome > second.takeHome) { setText("comparison-heading", "Offer 1 comes out ahead"); setText("comparison-message", `Offer 1 has the higher estimated monthly take-home by ${formatMoney(difference)} per month.`); }
    else { setText("comparison-heading", "Offer 2 comes out ahead"); setText("comparison-message", `Offer 2 has the higher estimated monthly take-home by ${formatMoney(difference)} per month.`); }
  }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(inputs.map((input) => [`${input.dataset.group}:${input.dataset.key}`, input.value])))); } catch (_) {} }
  function restore() { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (!saved) return false; inputs.forEach((input) => { const value = saved[`${input.dataset.group}:${input.dataset.key}`]; if (typeof value === "string") input.value = value; }); return true; } catch (_) { return false; } }
  function loadExample() { if (!window.SAMPLE_DATA) return; inputs.forEach((input) => { input.value = window.SAMPLE_DATA[input.dataset.group][input.dataset.key]; }); save(); render(true); document.querySelector("#planner").scrollIntoView({ behavior: "smooth", block: "start" }); }
  function render(announce = false) { const primary = calculateOffer(valuesFor("primary")), second = calculateOffer(valuesFor("second")); showErrors("primary", primary.checks); showErrors("second", second.checks); renderPrimary(primary); renderPlan(primary); renderComparison(primary, second); if (announce && primary.valid) liveStatus.textContent = `Estimated monthly take-home is ${formatMoney(primary.takeHome)}.`; }
  inputs.forEach((input) => { input.addEventListener("input", () => { save(); render(); }); input.addEventListener("blur", () => render(true)); });
  document.querySelector("#load-example").addEventListener("click", loadExample);
  if (!restore()) loadExample(); else render();
})();
