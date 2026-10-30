/* Upside Systems free audit: calculator, projection and booking form.
   Edit CONFIG and AREAS below; paste your n8n webhook URL into webhookUrl. */
/* ===== Settings you can edit ===== */
var CONFIG = {
  brand: "Upside Systems",
  // Paste your n8n Webhook node's production URL here. Leave empty to run in demo mode.
  webhookUrl: "",
  currency: "USD",
  locale: "en-US",
  weeksPerYear: 52,
  hoursPerPersonYear: 2000,   // working hours per person per year
  growthFromHours: 8,         // hours a week in one area that move a client to Growth
  scaleFromHours: 20,         // ...and to Scale
  years: 5,
  redirectShare: 0.5,         // default share of freed-up hours spent on growth work
  reinvestReturn: 1.0         // default new revenue per dollar of savings reinvested
};

var AREAS = [
  { id: "sales", title: "Sales and leads", pkg: "Lead Engine",
    tiers: { Starter: [1500, 250], Growth: [3500, 500], Scale: [7500, 1000] },
    tasks: [
      { id: "lead-entry", label: "Entering leads into your CRM or spreadsheet", rate: 0.85 },
      { id: "lead-followup", label: "Following up with new leads", rate: 0.70 },
      { id: "scheduling", label: "Booking and confirming appointments", rate: 0.75 } ] },
  { id: "finance", title: "Finance and admin", pkg: "Back Office Autopilot",
    tiers: { Starter: [1200, 200], Growth: [3000, 450], Scale: [6500, 900] },
    tasks: [
      { id: "invoicing", label: "Creating and sending invoices", rate: 0.85 },
      { id: "chasing", label: "Chasing late payments", rate: 0.70 },
      { id: "receipts", label: "Logging receipts and bills", rate: 0.80 },
      { id: "reports", label: "Putting together weekly reports", rate: 0.75 } ] },
  { id: "care", title: "Customer care", pkg: "Customer Care Hub",
    tiers: { Starter: [1500, 250], Growth: [4000, 600], Scale: [8000, 1200] },
    tasks: [
      { id: "faq", label: "Answering the same customer questions", rate: 0.60 },
      { id: "routing", label: "Sorting and forwarding emails or tickets", rate: 0.80 },
      { id: "onboarding", label: "Onboarding new customers", rate: 0.65 },
      { id: "reviews", label: "Asking customers for reviews", rate: 0.90 } ] }
];
/* ================================== */

var money0 = new Intl.NumberFormat(CONFIG.locale, { style: "currency", currency: CONFIG.currency, maximumFractionDigits: 0 });
var money2 = new Intl.NumberFormat(CONFIG.locale, { style: "currency", currency: CONFIG.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
var compact = new Intl.NumberFormat(CONFIG.locale, { style: "currency", currency: CONFIG.currency, notation: "compact", maximumFractionDigits: 1 });
var num = new Intl.NumberFormat(CONFIG.locale, { maximumFractionDigits: 1 });
var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var STEPS = ["step-inputs", "step-hourly", "step-growth", "step-book"];
var state = { r: null, proj: null, redirect: CONFIG.redirectShare, reinvest: CONFIG.reinvestReturn, timers: [], frames: [] };

function $(id) { return document.getElementById(id); }
function el(tag, attrs, text) {
  var n = document.createElement(tag);
  if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
  if (text != null) n.textContent = text;
  return n;
}
function svgEl(tag, attrs, text) {
  var n = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
  if (text != null) n.textContent = text;
  return n;
}
function later(fn, ms) { state.timers.push(setTimeout(fn, reduceMotion ? 0 : ms)); }
function clearTimers() {
  state.timers.forEach(clearTimeout); state.timers = [];
  state.frames.forEach(cancelAnimationFrame); state.frames = [];
}
function val(id) { var v = parseFloat($(id).value); return isFinite(v) && v > 0 ? v : 0; }

document.querySelectorAll("[data-brand]").forEach(function (n) { n.textContent = CONFIG.brand; });

/* ---- Build task rows ---- */
(function buildAreas() {
  var host = $("areas");
  AREAS.forEach(function (area) {
    var sec = el("section", { "class": "section-split", "aria-labelledby": "h-" + area.id });
    var head = el("div", { "class": "card-head" });
    head.appendChild(el("h2", { id: "h-" + area.id }, area.title));
    head.appendChild(el("span", { "class": "col", "aria-hidden": "true" }, "Hours a week"));
    sec.appendChild(head);
    area.tasks.forEach(function (t) {
      var row = el("div", { "class": "row" });
      var lab = el("label", { "for": "t-" + t.id }, t.label);
      lab.appendChild(el("span", { "class": "visually-hidden" }, ", hours a week"));
      var inp = el("input", { "class": "num", id: "t-" + t.id, type: "number", inputmode: "decimal", min: "0", step: "0.5", placeholder: "0" });
      inp.addEventListener("input", function () { row.classList.toggle("has-hours", val(inp.id) > 0); });
      row.appendChild(lab); row.appendChild(inp); sec.appendChild(row);
    });
    host.appendChild(sec);
  });
})();

/* ---- Maths ---- */
function tierFor(h) { return h >= CONFIG.scaleFromHours ? "Scale" : h >= CONFIG.growthFromHours ? "Growth" : "Starter"; }

function calculate() {
  var W = CONFIG.weeksPerYear;
  var g = parseFloat($("growth").value);
  var r = { hourlyCost: val("hourly"), revenue: val("revenue"), team: val("team"),
            growth: isFinite(g) ? Math.max(-0.5, g / 100) : 0,
            tasks: {}, totalHours: 0, reclaimHours: 0, packages: [], setup: 0, monthly: 0 };
  AREAS.forEach(function (area) {
    var hrs = 0;
    area.tasks.forEach(function (t) {
      var h = val("t-" + t.id);
      r.tasks[t.id] = h; hrs += h; r.reclaimHours += h * t.rate;
    });
    r.totalHours += hrs;
    if (hrs > 0) {
      var tier = tierFor(hrs), p = area.tiers[tier];
      r.packages.push({ name: area.pkg, tier: tier, setup: p[0], monthly: p[1], hoursPerWeek: hrs });
      r.setup += p[0]; r.monthly += p[1];
    }
  });
  r.annualCost = r.totalHours * W * r.hourlyCost;
  r.annualSavings = r.reclaimHours * W * r.hourlyCost;
  r.hoursPerMonth = r.reclaimHours * W / 12;
  r.rateYear1 = r.hoursPerMonth > 0 ? (r.monthly + r.setup / 12) / r.hoursPerMonth : 0;
  r.rateLater = r.hoursPerMonth > 0 ? r.monthly / r.hoursPerMonth : 0;
  r.monthlySave1 = (r.hourlyCost - r.rateYear1) * r.hoursPerMonth;
  r.monthlySave2 = (r.hourlyCost - r.rateLater) * r.hoursPerMonth;
  return r;
}

function project(r, redirect, reinvest) {
  var revPerHour = r.revenue / (r.team * CONFIG.hoursPerPersonYear);
  var timeUplift = r.reclaimHours * CONFIG.weeksPerYear * redirect * revPerHour;
  var base = [r.revenue], boost = [r.revenue], extraTotal = 0;
  for (var t = 1; t <= CONFIG.years; t++) {
    var fees = 12 * r.monthly + (t === 1 ? r.setup : 0);
    var net = Math.max(0, r.annualSavings - fees);
    var uplift = net * reinvest + timeUplift;
    base.push(base[t - 1] * (1 + r.growth));
    boost.push(boost[t - 1] * (1 + r.growth) + uplift);
    extraTotal += boost[t] - base[t];
  }
  var Y = CONFIG.years;
  return { base: base, boost: boost, extraFinal: boost[Y] - base[Y], extraTotal: extraTotal, revPerHour: revPerHour };
}

/* ---- Navigation ---- */
function goTo(id) {
  clearTimers();
  STEPS.forEach(function (s) { $(s).hidden = s !== id; });
  var idx = STEPS.indexOf(id);
  document.querySelectorAll(".progress li").forEach(function (li, i) { li.classList.toggle("done", i <= idx); });
  $("progress-label").textContent = "Step " + (idx + 1) + " of " + STEPS.length;
  window.scrollTo(0, 0);
  var h = document.querySelector("#" + id + " [data-step-heading]");
  if (h) h.focus({ preventScroll: true });
  if (id === "step-hourly") playHourly();
  if (id === "step-growth") playGrowth(true);
  if (id === "step-book") fillBookSummary();
}
document.querySelectorAll("[data-back]").forEach(function (b) {
  b.addEventListener("click", function () { goTo(b.getAttribute("data-back")); });
});

$("to-hourly").addEventListener("click", function () {
  var r = calculate(), errs = [];
  if (!r.hourlyCost) errs.push("Enter what an hour of your team’s time costs.");
  if (!r.totalHours) errs.push("Add hours to at least one task.");
  if (!r.revenue) errs.push("Enter your yearly revenue.");
  if (!r.team) errs.push("Enter how many people are on your team.");
  var box = $("inputs-error");
  if (errs.length) { box.textContent = errs.join(" "); box.hidden = false; return; }
  box.hidden = true;
  state.r = r;
  goTo("step-hourly");
});
$("to-growth").addEventListener("click", function () { goTo("step-growth"); });
$("to-book").addEventListener("click", function () { goTo("step-book"); });

/* ---- Animation helpers ---- */
function countUp(node, to, fmt, ms) {
  if (reduceMotion) { node.textContent = fmt.format(to); return; }
  var start = null;
  function tick(ts) {
    if (start === null) start = ts;
    var p = Math.min(1, (ts - start) / ms), e = 1 - Math.pow(1 - p, 3);
    node.textContent = fmt.format(to * e);
    if (p < 1) state.frames.push(requestAnimationFrame(tick));
  }
  state.frames.push(requestAnimationFrame(tick));
}
function resetBar(bar) {
  bar.style.transition = "none"; bar.style.transform = "scaleX(0)";
  void bar.offsetWidth; bar.style.transition = "";
}

/* ---- Step 2: cost per hour ---- */
function playHourly() {
  var r = state.r;
  $("hourly-lede").textContent = "Your team spends " + num.format(r.totalHours) + " hours a week on these tasks. We can automate about " + num.format(r.reclaimHours) + " of them.";
  var theirsBar = $("theirs-bar"), oursBar = $("ours-bar");
  [$("ours-block"), $("savings-block")].forEach(function (n) { n.classList.remove("in"); });
  resetBar(theirsBar); resetBar(oursBar);
  $("theirs-val").textContent = money2.format(0);
  $("ours-val").textContent = money2.format(0);

  var maxv = Math.max(r.hourlyCost, r.rateYear1);
  $("ours-note").textContent = "Year one, including setup. From year two it drops to " + money2.format(r.rateLater) + " an hour.";

  var head = $("savings-head"), text = $("savings-text");
  head.textContent = "";
  if (r.rateYear1 < r.hourlyCost) {
    head.appendChild(document.createTextNode("You save "));
    head.appendChild(el("mark", null, money2.format(r.hourlyCost - r.rateYear1)));
    head.appendChild(document.createTextNode(" on every hour of this work."));
    text.textContent = "That’s about " + money0.format(r.monthlySave1) + " a month in year one, rising to " + money0.format(r.monthlySave2) + " a month from year two.";
  } else if (r.rateLater < r.hourlyCost) {
    head.textContent = "Year one is about breaking even. Year two is where you save.";
    text.textContent = "Setup costs push our hourly cost above yours in year one. From year two you save about " + money0.format(r.monthlySave2) + " a month.";
  } else {
    head.textContent = "At these hours, automating costs more than doing it by hand.";
    text.textContent = "That usually means the volume is too low for now. Book a call and we’ll tell you honestly whether it’s worth it yet.";
  }

  state.frames.push(requestAnimationFrame(function () {
    theirsBar.style.transform = "scaleX(" + (r.hourlyCost / maxv) + ")";
    countUp($("theirs-val"), r.hourlyCost, money2, 900);
  }));
  later(function () {
    $("ours-block").classList.add("in");
    oursBar.style.transform = "scaleX(" + Math.max(0.02, r.rateYear1 / maxv) + ")";
    countUp($("ours-val"), r.rateYear1, money2, 900);
  }, 1400);
  later(function () { $("savings-block").classList.add("in"); }, 2700);
}

/* ---- Step 3: five-year projection ---- */
function pct(x) { return Math.round(x * 100) + "%"; }

function playGrowth(animate) {
  clearTimers();
  var r = state.r, p = project(r, state.redirect, state.reinvest), Y = CONFIG.years;
  state.proj = p;
  $("growth-lede").textContent = "Growing " + pct(r.growth) + " a year, you’re on track for about " + compact.format(p.base[Y]) + " in yearly revenue by year " + Y + ".";

  var head = $("outcome-head");
  head.textContent = "";
  head.appendChild(document.createTextNode("Put the savings and freed-up time to work, and year " + Y + " looks like "));
  head.appendChild(el("mark", null, compact.format(p.boost[Y])));
  head.appendChild(document.createTextNode("."));
  $("outcome-text").textContent = "That’s " + compact.format(p.extraFinal) + " more in year " + Y + " alone, and about " + compact.format(p.extraTotal) + " in extra revenue across the five years.";

  var list = $("assumption-list");
  list.textContent = "";
  [
    "Your current path grows " + pct(r.growth) + " a year from " + money0.format(r.revenue) + ".",
    "Savings left after our fees are reinvested in growth, and each dollar brings back " + money2.format(state.reinvest) + " in new revenue.",
    pct(state.redirect) + " of your freed-up hours go to sales, customers or planning. Each of those hours earns what an average hour earns your business today: " + money0.format(p.revPerHour) + " (revenue ÷ " + num.format(r.team) + " people × " + num.format(CONFIG.hoursPerPersonYear) + " hours).",
    "Gains carry forward and grow at the same rate as your business. Savings are held at today’s level, even as you grow."
  ].forEach(function (t) { list.appendChild(el("li", null, t)); });

  $("redirect").value = Math.round(state.redirect * 100);
  $("redirect-out").textContent = pct(state.redirect);
  $("reinvest").value = state.reinvest;
  $("reinvest-out").textContent = money2.format(state.reinvest);

  $("chart").setAttribute("aria-label", "Five-year revenue projection. Current path reaches " + compact.format(p.base[Y]) + " in year " + Y + ". With savings and time put to work, it reaches " + compact.format(p.boost[Y]) + ".");
  renderChart(p, animate);
}

function renderChart(p, animate) {
  var svg = $("chart");
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  var W = Math.max(280, Math.round(svg.getBoundingClientRect().width));
  var small = W < 560, H = small ? 260 : 340;
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.setAttribute("height", H);
  var padL = 58, padR = small ? 70 : 92, padT = 16, padB = 34;
  var plotW = W - padL - padR, plotH = H - padT - padB, Y = CONFIG.years;
  var all = p.base.concat(p.boost);
  var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
  var yMin = lo * 0.9, yMax = hi * 1.05;
  if (yMax - yMin < 1) { yMax = yMin + 1; }
  function x(t) { return padL + t * plotW / Y; }
  function y(v) { return padT + plotH - (v - yMin) / (yMax - yMin) * plotH; }

  for (var i = 0; i <= 4; i++) {
    var v = yMin + (yMax - yMin) * i / 4, yy = y(v);
    svg.appendChild(svgEl("line", { "class": "grid", x1: padL, x2: W - padR + 8, y1: yy, y2: yy }));
    svg.appendChild(svgEl("text", { "class": "axis-label", x: padL - 8, y: yy + 4, "text-anchor": "end" }, compact.format(v)));
  }
  for (var t = 0; t <= Y; t++) {
    svg.appendChild(svgEl("text", { "class": "axis-label", x: x(t), y: H - 10, "text-anchor": "middle" },
      t === 0 ? "Now" : (small ? "Y" + t : "Year " + t)));
  }

  function pathD(arr) { return arr.map(function (v, t) { return (t ? "L" : "M") + x(t).toFixed(1) + " " + y(v).toFixed(1); }).join(" "); }
  var gapPts = p.boost.map(function (v, t) { return x(t).toFixed(1) + "," + y(v).toFixed(1); })
    .concat(p.base.slice().reverse().map(function (v, i) { var t = Y - i; return x(t).toFixed(1) + "," + y(v).toFixed(1); }));
  var gap = svgEl("polygon", { "class": "gap", points: gapPts.join(" ") });
  var basePath = svgEl("path", { "class": "line-base", d: pathD(p.base) });
  var boostPath = svgEl("path", { "class": "line-boost", d: pathD(p.boost) });
  svg.appendChild(gap); svg.appendChild(basePath); svg.appendChild(boostPath);

  var yb = y(p.base[Y]), yo = y(p.boost[Y]);
  var lb = yb + 5, lo2 = yo + 5;
  if (lb - lo2 < 20) { var mid = (lb + lo2) / 2; lo2 = mid - 10; lb = mid + 10; }
  var baseEnd = svgEl("g", { "class": "fade" });
  baseEnd.appendChild(svgEl("circle", { "class": "dot-base", cx: x(Y), cy: yb, r: 5 }));
  baseEnd.appendChild(svgEl("text", { "class": "end-label end-base", x: x(Y) + 10, y: lb }, compact.format(p.base[Y])));
  var boostEnd = svgEl("g", { "class": "fade" });
  boostEnd.appendChild(svgEl("circle", { "class": "dot-boost", cx: x(Y), cy: yo, r: 6 }));
  boostEnd.appendChild(svgEl("text", { "class": "end-label end-boost", x: x(Y) + 10, y: lo2 }, compact.format(p.boost[Y])));
  svg.appendChild(baseEnd); svg.appendChild(boostEnd);

  var legendBoost = $("legend-boost"), outcome = $("outcome");

  if (!animate || reduceMotion) {
    gap.classList.add("in"); baseEnd.classList.add("in"); boostEnd.classList.add("in");
    legendBoost.style.opacity = 1; outcome.classList.add("in");
    return;
  }

  outcome.classList.remove("in");
  legendBoost.style.opacity = 0;
  [basePath, boostPath].forEach(function (pth) {
    var len = pth.getTotalLength();
    pth.style.strokeDasharray = len; pth.style.strokeDashoffset = len;
  });
  void svg.getBoundingClientRect();
  state.frames.push(requestAnimationFrame(function () {
    basePath.style.transition = "stroke-dashoffset 1.4s ease-out";
    basePath.style.strokeDashoffset = 0;
  }));
  later(function () { baseEnd.classList.add("in"); }, 1400);
  later(function () {
    legendBoost.style.opacity = 1;
    boostPath.style.transition = "stroke-dashoffset 1.6s ease-out";
    boostPath.style.strokeDashoffset = 0;
  }, 2300);
  later(function () {
    gap.classList.add("in"); boostEnd.classList.add("in"); outcome.classList.add("in");
  }, 3900);
}

$("redirect").addEventListener("input", function () { state.redirect = this.value / 100; playGrowth(false); });
$("reinvest").addEventListener("input", function () { state.reinvest = parseFloat(this.value); playGrowth(false); });

var resizeT;
window.addEventListener("resize", function () {
  clearTimeout(resizeT);
  resizeT = setTimeout(function () { if (!$("step-growth").hidden && state.proj) playGrowth(false); }, 150);
});

/* ---- Step 4: booking ---- */
function fillBookSummary() {
  var r = state.r, p = state.proj || project(r, state.redirect, state.reinvest);
  $("sum-hours").textContent = num.format(r.reclaimHours);
  $("sum-saved").textContent = money0.format(r.annualSavings);
  $("sum-outlook").textContent = compact.format(p.boost[CONFIG.years]);
}

function setInvalid(name, bad) {
  var f = document.querySelector('[data-field="' + name + '"]'), input = f.querySelector("input");
  f.classList.toggle("invalid", bad);
  if (bad) { input.setAttribute("aria-invalid", "true"); input.setAttribute("aria-describedby", name + "-error"); }
  else { input.removeAttribute("aria-invalid"); input.removeAttribute("aria-describedby"); }
}
["name", "email"].forEach(function (n) {
  $(n).addEventListener("input", function () {
    var f = document.querySelector('[data-field="' + n + '"]');
    if (f.classList.contains("invalid")) setInvalid(n, n === "name" ? !this.value.trim() : !(this.value.trim() && this.checkValidity()));
  });
});

$("consult-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var form = e.target, nameIn = form.elements.name, emailIn = form.elements.email;
  var nameBad = !nameIn.value.trim(), emailBad = !emailIn.value.trim() || !emailIn.checkValidity();
  setInvalid("name", nameBad); setInvalid("email", emailBad);
  if (nameBad) { nameIn.focus(); return; }
  if (emailBad) { emailIn.focus(); return; }

  var r = state.r, p = state.proj || project(r, state.redirect, state.reinvest);
  var round = function (v) { return Math.round(v); };
  var payload = {
    contact: { name: nameIn.value.trim(), email: emailIn.value.trim(), company: form.elements.company.value.trim(),
               phone: form.elements.phone.value.trim(), message: form.elements.message.value.trim() },
    business: { revenue: r.revenue, team: r.team, expectedGrowth: r.growth },
    estimate: {
      hourlyCost: r.hourlyCost, hoursPerWeekByTask: r.tasks, totalHoursPerWeek: r.totalHours,
      reclaimableHoursPerWeek: Math.round(r.reclaimHours * 10) / 10,
      annualCost: round(r.annualCost), annualSavings: round(r.annualSavings),
      ourHourlyRateYear1: Math.round(r.rateYear1 * 100) / 100, ourHourlyRateLater: Math.round(r.rateLater * 100) / 100,
      suggestedPackages: r.packages
    },
    projection: { assumptions: { redirectShare: state.redirect, reinvestReturn: state.reinvest },
                  currentPath: p.base.map(round), withUs: p.boost.map(round),
                  extraFinalYear: round(p.extraFinal), extraTotal: round(p.extraTotal) },
    source: "free-audit-page",
    submittedAt: new Date().toISOString()
  };

  var btn = $("submit-btn"), errBox = $("form-error");
  errBox.hidden = true; btn.disabled = true; btn.textContent = "Sending…";
  var send = CONFIG.webhookUrl
    ? fetch(CONFIG.webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(function (res) { if (!res.ok) throw new Error("status " + res.status); })
    : new Promise(function (resolve) { setTimeout(resolve, 600); });

  send.then(function () {
    var area = $("form-area"); area.textContent = "";
    var box = el("div", { "class": "success", role: "status" });
    var h = el("h3", { tabindex: "-1" }, "Thanks, " + payload.contact.name.split(" ")[0] + ". Your numbers are on their way to us.");
    box.appendChild(h);
    box.appendChild(el("p", null, "We’ll email " + payload.contact.email + " within one business day with times for your call."));
    area.appendChild(box); h.focus();
  }).catch(function () {
    btn.disabled = false; btn.textContent = "Send my numbers and book a call";
    errBox.textContent = "Your request didn’t send. Check your connection and try again, or email us directly.";
    errBox.hidden = false;
  });
});
