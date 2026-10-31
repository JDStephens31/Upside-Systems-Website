/* Upside Systems custom package builder on packages.html.
   Edit BUILDER and SECTORS below. */
/* ===== Settings you can edit ===== */
var BUILDER = {
  // Requests go to contactEmail through FormSubmit, the same relay as the free audit
  contactEmail: "consultation@upsidesys.com",
  emailEndpoint: "https://formsubmit.co/ajax/",
  // Optional: also send the full JSON to an n8n Webhook node's production URL
  webhookUrl: "",
  currency: "USD",
  locale: "en-US",
  minSetup: 1000,             // a custom package never costs less than this to set up
  minMonthly: 150,            // ...or this a month
  care: [
    { id: "standard", name: "Standard", monthly: 0, change: "1 hour a month", support: "Within 2 business days" },
    { id: "plus", name: "Plus", monthly: 100, change: "3 hours a month", support: "Next business day" },
    { id: "priority", name: "Priority", monthly: 300, change: "8 hours a month", support: "Same business day", extra: "Strategy session every quarter" }
  ],
  // Upside Complete, for the "a bundle is cheaper" hint
  complete: { setup: 8500, monthly: 1350 }
};

// Each item: [id, name, setup, monthly, tier level (1 Starter, 2 Growth, 3 Scale), id it needs]
// Tier prices match packages.html and AREAS in assets/audit.js; keep all three in step.
var SECTORS = [
  { id: "lead", area: "Sales", pkg: "Lead Engine",
    tiers: [["Starter", 1500, 250], ["Growth", 3500, 500], ["Scale", 7500, 1000]],
    items: [
      ["lead-capture", "Leads from up to 3 sources go into your CRM, duplicates removed", 500, 75, 1],
      ["lead-reply", "An instant reply to every new lead, and an alert to you", 300, 50, 1],
      ["lead-email", "A 5-step email follow-up, written by us", 400, 50, 1],
      ["lead-missed", "Missed callers texted back automatically", 300, 50, 1],
      ["lead-weekly", "A weekly lead summary", 200, 30, 1],
      ["lead-sources", "Unlimited lead sources", 300, 20, 2, "lead-capture"],
      ["lead-score", "AI enrichment and fit scoring, hot leads sent to the right person", 550, 45, 2],
      ["lead-sequence", "Email and text follow-ups that stop when a lead replies or books", 450, 35, 2],
      ["lead-reminders", "Booking reminders 24 hours and 1 hour before calls", 200, 20, 2],
      ["lead-pipeline", "Deals moved through your pipeline, with tasks for reps", 450, 35, 2],
      ["lead-quotes", "Follow-ups on sent quotes and proposals", 250, 20, 2],
      ["lead-report", "A monthly report on which lead sources convert", 150, 20, 2],
      ["lead-assistant", "An AI assistant that qualifies leads by chat and text, then books them", 1500, 150, 3],
      ["lead-share", "Leads shared fairly across reps, with response speed tracked", 500, 50, 3],
      ["lead-winback", "Campaigns to win back old leads and past customers", 700, 60, 3],
      ["lead-outreach", "AI-drafted personal outreach for reps to approve", 900, 80, 3],
      ["lead-dashboard", "A live pipeline and revenue dashboard", 1000, 100, 3] ] },
  { id: "office", area: "Finance and admin", pkg: "Back Office Autopilot",
    tiers: [["Starter", 1200, 200], ["Growth", 3000, 450], ["Scale", 6500, 900]],
    items: [
      ["office-invoices", "Invoices created from finished jobs or signed quotes", 450, 60, 1],
      ["office-chase", "Payment reminders at 3, 7 and 14 days, then escalated to you", 300, 50, 1],
      ["office-paid", "Payments marked paid, with a thank-you and receipt sent", 250, 40, 1],
      ["office-sign", "Contracts and forms sent for e-signature and filed", 250, 40, 1],
      ["office-overdue", "A weekly list of overdue invoices", 150, 30, 1],
      ["office-receipts", "Receipts and bills read from email and logged in QuickBooks or Xero", 650, 60, 2],
      ["office-files", "Email attachments filed into the right folders", 300, 30, 2],
      ["office-recurring", "Recurring and subscription invoicing", 450, 40, 2],
      ["office-bills", "Reminders before vendor bills are due", 250, 25, 2],
      ["office-cash", "A cash-flow summary every Monday", 350, 35, 2],
      ["office-expenses", "Expense approval workflows", 800, 80, 3],
      ["office-payroll", "Timesheet and payroll prep synced", 1000, 90, 3],
      ["office-entities", "Support for multiple locations or entities", 900, 90, 3],
      ["office-pnl", "A monthly profit and loss dashboard with budget alerts", 1000, 100, 3],
      ["office-monthend", "An automated month-end checklist for your bookkeeper", 400, 40, 3] ] },
  { id: "care", area: "Customer care", pkg: "Customer Care Hub",
    tiers: [["Starter", 1500, 250], ["Growth", 4000, 600], ["Scale", 8000, 1200]],
    items: [
      ["care-inbox", "Email, web forms and social messages in one inbox", 600, 80, 1],
      ["care-ack", "An instant reply telling customers when to expect an answer", 250, 35, 1],
      ["care-saved", "Saved replies written for your top 20 questions", 400, 40, 1],
      ["care-reviews", "Review requests after every job, with unhappy feedback sent privately to you", 300, 60, 1],
      ["care-weekly", "A weekly support summary", 150, 30, 1],
      ["care-routing", "Messages sorted by urgency and topic, sent to the right person", 600, 50, 2, "care-inbox"],
      ["care-drafts", "AI-drafted replies from your own answers, approved in one click", 800, 80, 2, "care-inbox"],
      ["care-onboarding", "Onboarding for new customers: welcome, setup and a 7-day check-in", 600, 50, 2],
      ["care-appointments", "Appointment and service reminders", 350, 40, 2],
      ["care-surveys", "Satisfaction surveys with a monthly report", 450, 40, 2],
      ["care-auto", "Routine questions answered automatically, uncertain ones passed to a person", 1500, 150, 3, "care-inbox"],
      ["care-chat", "A 24/7 chat assistant on your website with handoff to your team", 1300, 130, 3],
      ["care-kb", "A knowledge base built from past conversations and kept current", 900, 80, 3],
      ["care-risk", "Alerts for customers at risk of leaving", 600, 60, 3],
      ["care-renewals", "Renewal and upsell reminders", 400, 40, 3] ] }
];
/* ================================== */

(function () {
  var host = document.getElementById("builder");
  if (!host) return;
  var money = new Intl.NumberFormat(BUILDER.locale, { style: "currency", currency: BUILDER.currency, maximumFractionDigits: 0 });
  var TIER_NAMES = ["Starter", "Growth", "Scale"];
  var ITEMS = {}, boxes = {}, careId = BUILDER.care[0].id;
  SECTORS.forEach(function (s) {
    s.items = s.items.map(function (a) {
      var it = { id: a[0], name: a[1], setup: a[2], monthly: a[3], level: a[4], needs: a[5] || null, sector: s };
      ITEMS[it.id] = it;
      return it;
    });
  });

  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text != null) n.textContent = text;
    return n;
  }
  function picked(s) { return s.items.filter(function (it) { return boxes[it.id].checked; }); }
  function careLevel() { return BUILDER.care.filter(function (c) { return c.id === careId; })[0]; }

  /* ---- Picks: one fieldset per sector ---- */
  var picks = el("div", { "class": "b-picks" });
  SECTORS.forEach(function (s) {
    var fs = el("fieldset", { "class": "b-sector", id: "b-" + s.id });
    var lg = el("legend");
    lg.appendChild(el("span", { "class": "area" }, s.area));
    lg.appendChild(el("span", { "class": "name" }, s.pkg));
    fs.appendChild(lg);
    var head = el("div", { "class": "b-head" });
    var count = el("p", { "class": "b-count", "aria-live": "polite" });
    s.countEl = count;
    head.appendChild(count);
    var fill = el("div", { "class": "b-fill", role: "group", "aria-label": "Start " + s.pkg + " from a tier" });
    fill.appendChild(el("span", { "aria-hidden": "true" }, "Start from"));
    TIER_NAMES.forEach(function (t, k) {
      var b = el("button", { type: "button", "aria-label": "Pick everything in " + s.pkg + " " + t }, t);
      b.addEventListener("click", function () {
        s.items.forEach(function (it) { boxes[it.id].checked = it.level <= k + 1; });
        update();
      });
      fill.appendChild(b);
    });
    var clear = el("button", { type: "button", "aria-label": "Clear " + s.pkg }, "Clear");
    clear.addEventListener("click", function () { s.items.forEach(function (it) { boxes[it.id].checked = false; }); update(); });
    fill.appendChild(clear);
    head.appendChild(fill);
    fs.appendChild(head);

    var ul = el("ul", { "class": "b-items" });
    s.items.forEach(function (it) {
      var li = el("li");
      var lab = el("label", { "class": "b-item" });
      var box = el("input", { type: "checkbox", value: it.id });
      boxes[it.id] = box;
      box.addEventListener("change", function () {
        // Keep dependencies whole: adding an item adds what it needs, removing a need removes what uses it
        if (box.checked && it.needs) boxes[it.needs].checked = true;
        if (!box.checked) s.items.forEach(function (o) { if (o.needs === it.id) boxes[o.id].checked = false; });
        update();
      });
      lab.appendChild(box);
      var text = el("span", { "class": "b-text" });
      text.appendChild(el("span", { "class": "b-name" }, it.name));
      var meta = el("span", { "class": "b-meta" });
      meta.appendChild(el("span", { "class": "b-tier t" + it.level }, TIER_NAMES[it.level - 1]));
      meta.appendChild(document.createTextNode(money.format(it.setup) + " setup · " + money.format(it.monthly) + " a month"));
      if (it.needs) meta.appendChild(el("span", { "class": "b-needs" }, "Comes with: " + ITEMS[it.needs].name));
      text.appendChild(meta);
      lab.appendChild(text);
      li.appendChild(lab);
      ul.appendChild(li);
    });
    fs.appendChild(ul);
    picks.appendChild(fs);
  });

  /* ---- Summary: care level, totals, hints and the request button ---- */
  var sum = el("aside", { "class": "b-summary", id: "b-summary", "aria-labelledby": "b-sum-h" });
  sum.appendChild(el("h3", { id: "b-sum-h" }, "Your package"));
  var lines = el("ul", { "class": "b-lines" });
  sum.appendChild(lines);
  var careFs = el("fieldset", { "class": "b-care" });
  careFs.appendChild(el("legend", null, "Support level"));
  BUILDER.care.forEach(function (c, k) {
    var lab = el("label", { "class": "b-care-opt" });
    var r = el("input", { type: "radio", name: "b-care", value: c.id });
    if (k === 0) r.checked = true;
    r.addEventListener("change", function () { careId = c.id; update(); });
    lab.appendChild(r);
    var t = el("span");
    t.appendChild(el("strong", null, c.name + (c.monthly ? " +" + money.format(c.monthly) + " a month" : ", included")));
    t.appendChild(el("span", null, c.change + " of change time, support replies " + c.support.charAt(0).toLowerCase() + c.support.slice(1) + (c.extra ? ", " + c.extra.charAt(0).toLowerCase() + c.extra.slice(1) : "")));
    lab.appendChild(t);
    careFs.appendChild(lab);
  });
  sum.appendChild(careFs);
  var total = el("p", { "class": "b-total", "aria-live": "polite" });
  sum.appendChild(total);
  var minNote = el("p", { "class": "b-min" }, "Custom packages start at " + money.format(BUILDER.minSetup) + " setup and " + money.format(BUILDER.minMonthly) + " a month.");
  sum.appendChild(minNote);
  var hints = el("ul", { "class": "b-hints", "aria-live": "polite" });
  sum.appendChild(hints);
  var go = el("button", { "class": "btn btn-primary", type: "button" }, "Request this package");
  sum.appendChild(go);
  var empty = el("p", { "class": "b-empty" }, "Tick anything from the three lists to start building.");
  sum.appendChild(empty);

  var grid = el("div", { "class": "b-grid" });
  grid.appendChild(picks);
  grid.appendChild(sum);
  host.appendChild(grid);

  // On phones the summary sits below the lists, so a bar keeps the running total in view
  var bar = el("div", { "class": "b-bar", hidden: "" });
  var barText = el("span");
  var barBtn = el("button", { type: "button", "class": "btn btn-primary btn-sm" }, "Review");
  barBtn.addEventListener("click", function () { sum.scrollIntoView({ behavior: "smooth", block: "start" }); sum.querySelector("h3").focus(); });
  sum.querySelector("h3").setAttribute("tabindex", "-1");
  bar.appendChild(barText); bar.appendChild(barBtn);
  document.body.appendChild(bar);
  var sumVisible = false, builderVisible = false;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { sumVisible = es[0].isIntersecting; showBar(); }).observe(sum);
    new IntersectionObserver(function (es) { builderVisible = es[0].isIntersecting; showBar(); }).observe(picks);
  }
  var lastCount = 0;
  function showBar() { bar.hidden = !(lastCount && builderVisible && !sumVisible); }

  function calc() {
    var setup = 0, monthly = 0, chosen = [];
    SECTORS.forEach(function (s) {
      picked(s).forEach(function (it) { setup += it.setup; monthly += it.monthly; chosen.push(it); });
    });
    var care = careLevel();
    var itemsMonthly = monthly;
    monthly += care.monthly;
    var raised = chosen.length && (setup < BUILDER.minSetup || monthly < BUILDER.minMonthly);
    return { chosen: chosen, care: care, itemsSetup: setup, itemsMonthly: itemsMonthly,
             setup: chosen.length ? Math.max(setup, BUILDER.minSetup) : 0,
             monthly: chosen.length ? Math.max(monthly, BUILDER.minMonthly) : 0, raised: raised };
  }

  // Where a ready-made tier or Upside Complete covers the picks for less, say so
  function suggestions(c) {
    var out = [], growthOrLess = 0, year = function (a, b) { return a + 12 * b; };
    SECTORS.forEach(function (s) {
      var p = picked(s);
      if (!p.length) return;
      var lvl = Math.max.apply(null, p.map(function (it) { return it.level; }));
      if (lvl <= 2) growthOrLess++;
      var t = s.tiers[lvl - 1], setup = 0, monthly = 0;
      p.forEach(function (it) { setup += it.setup; monthly += it.monthly; });
      // Tiers come with their own support level, worth the matching care fee
      monthly += BUILDER.care[lvl - 1].monthly;
      if (year(t[1], t[2]) <= year(setup, monthly)) {
        var extra = s.items.filter(function (it) { return it.level <= lvl; }).length - p.length;
        out.push(s.pkg + " " + t[0] + " includes all of your " + s.pkg + " picks" +
          (extra ? " and " + extra + " more" : "") + " for " + money.format(t[1]) + " setup and " + money.format(t[2]) + " a month.");
      }
    });
    if (growthOrLess === SECTORS.length && year(BUILDER.complete.setup, BUILDER.complete.monthly) <= year(c.setup, c.monthly)) {
      out = ["Upside Complete covers everything you’ve picked, and every Growth feature in all three areas, for " +
        money.format(BUILDER.complete.setup) + " setup and " + money.format(BUILDER.complete.monthly) + " a month."];
    }
    return out;
  }

  function update() {
    var c = calc();
    lastCount = c.chosen.length;
    SECTORS.forEach(function (s) {
      var n = picked(s).length;
      s.countEl.textContent = n ? n + " of " + s.items.length + " picked" : "Nothing picked yet";
      s.countEl.classList.toggle("on", n > 0);
    });
    lines.textContent = "";
    SECTORS.forEach(function (s) {
      var n = picked(s).length;
      if (!n) return;
      var li = el("li");
      li.appendChild(el("span", null, s.pkg));
      li.appendChild(el("strong", null, n + (n === 1 ? " feature" : " features")));
      lines.appendChild(li);
    });

    total.textContent = "";
    if (c.chosen.length) {
      total.appendChild(el("strong", null, money.format(c.setup)));
      total.appendChild(el("span", null, " setup, then"));
      total.appendChild(el("br"));
      total.appendChild(el("strong", { "class": "mo" }, money.format(c.monthly)));
      total.appendChild(el("span", null, " a month"));
    }
    minNote.hidden = !c.raised;
    hints.textContent = "";
    suggestions(c).forEach(function (h) { hints.appendChild(el("li", null, h)); });
    go.hidden = careFs.hidden = total.hidden = !c.chosen.length;
    empty.hidden = !!c.chosen.length;
    barText.textContent = c.chosen.length ? c.chosen.length + " picked · " + money.format(c.setup) + " + " + money.format(c.monthly) + "/mo" : "";
    showBar();
    try { localStorage.setItem("upside-build", JSON.stringify({ items: c.chosen.map(function (it) { return it.id; }), care: careId })); } catch (e) {}
  }

  /* ---- Request form ---- */
  var formArea = document.getElementById("b-form-area"), form = document.getElementById("b-form");
  go.addEventListener("click", function () {
    formArea.hidden = false;
    var c = calc();
    var recap = document.getElementById("b-recap");
    recap.textContent = c.chosen.length + (c.chosen.length === 1 ? " feature" : " features") + ", " + c.care.name + " support: " +
      money.format(c.setup) + " setup, then " + money.format(c.monthly) + " a month.";
    formArea.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("b-form-h").focus({ preventScroll: true });
  });

  function setInvalid(name, bad) {
    var f = form.querySelector('[data-field="' + name + '"]'), input = f.querySelector("input");
    f.classList.toggle("invalid", bad);
    if (bad) { input.setAttribute("aria-invalid", "true"); input.setAttribute("aria-describedby", "b-" + name + "-error"); }
    else { input.removeAttribute("aria-invalid"); input.removeAttribute("aria-describedby"); }
  }
  ["name", "email"].forEach(function (n) {
    form.elements[n].addEventListener("input", function () {
      if (this.closest(".field").classList.contains("invalid")) setInvalid(n, n === "name" ? !this.value.trim() : !(this.value.trim() && this.checkValidity()));
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nameIn = form.elements.name, emailIn = form.elements.email;
    var nameBad = !nameIn.value.trim(), emailBad = !emailIn.value.trim() || !emailIn.checkValidity();
    setInvalid("name", nameBad); setInvalid("email", emailBad);
    if (nameBad) { nameIn.focus(); return; }
    if (emailBad) { emailIn.focus(); return; }
    var c = calc();
    var errBox = document.getElementById("b-form-error"), btn = document.getElementById("b-submit");
    if (!c.chosen.length) {
      errBox.textContent = "Pick at least one feature above before sending.";
      errBox.hidden = false; return;
    }
    var contact = { name: nameIn.value.trim(), email: emailIn.value.trim(), company: form.elements.company.value.trim(),
                    phone: form.elements.phone.value.trim(), message: form.elements.message.value.trim() };
    var payload = {
      contact: contact,
      package: {
        items: c.chosen.map(function (it) { return { id: it.id, sector: it.sector.pkg, name: it.name, setup: it.setup, monthly: it.monthly }; }),
        supportLevel: c.care.name, setup: c.setup, monthly: c.monthly, minimumApplied: !!c.raised, suggestions: suggestions(c)
      },
      source: "custom-package-builder",
      submittedAt: new Date().toISOString()
    };
    var fields = {
      _subject: "New custom package: " + (contact.company || contact.name),
      _template: "table",
      _replyto: contact.email,
      _captcha: "false",
      "Name": contact.name,
      "Email": contact.email,
      "Business": contact.company || "Not given",
      "Phone": contact.phone || "Not given",
      "Notes": contact.message || "Not given",
      "Setup estimate": money.format(c.setup) + (c.raised ? " (custom package minimum applied)" : ""),
      "Monthly estimate": money.format(c.monthly),
      "Support level": c.care.name + " (" + c.care.change + " of change time, " + c.care.support.toLowerCase() + ")"
    };
    SECTORS.forEach(function (s) {
      var p = picked(s);
      fields[s.pkg] = p.length ? p.map(function (it) { return it.name; }).join("; ") : "Nothing picked";
    });
    if (payload.package.suggestions.length) fields["Cheaper ready-made option"] = payload.package.suggestions.join(" ");

    errBox.hidden = true; btn.disabled = true; btn.textContent = "Sending…";
    function post(url, data) {
      return fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
        .then(function (res) { if (!res.ok) throw new Error("status " + res.status); return res.json().catch(function () { return {}; }); });
    }
    // Bots fill the hidden field; humans never see it
    var isBot = form.elements._honey && form.elements._honey.value;
    var send = isBot ? Promise.resolve() : post(BUILDER.emailEndpoint + BUILDER.contactEmail, fields)
      .then(function (json) { if (json.success === false || json.success === "false") throw new Error(json.message || "not sent"); });
    if (BUILDER.webhookUrl && !isBot) post(BUILDER.webhookUrl, payload).catch(function () {});

    send.then(function () {
      formArea.textContent = "";
      var box = el("div", { "class": "success", role: "status" });
      var h = el("h3", { tabindex: "-1" }, "Thanks, " + contact.name.split(" ")[0] + ". Your package is on its way to us.");
      box.appendChild(h);
      box.appendChild(el("p", null, "We’ll email " + contact.email + " within one business day to confirm the details and set up your workflow map call."));
      formArea.appendChild(box); h.focus();
      try { localStorage.removeItem("upside-build"); } catch (err) {}
    }).catch(function () {
      btn.disabled = false; btn.textContent = "Send my package";
      errBox.textContent = "";
      errBox.appendChild(document.createTextNode("Your request didn’t send. Check your connection and try again, or email us at "));
      errBox.appendChild(el("a", { href: "mailto:" + BUILDER.contactEmail + "?subject=" + encodeURIComponent("Custom package: " + (contact.company || contact.name)) }, BUILDER.contactEmail));
      errBox.appendChild(document.createTextNode("."));
      errBox.hidden = false;
    });
  });

  // Bring back picks from an earlier visit
  try {
    var saved = JSON.parse(localStorage.getItem("upside-build") || "null");
    if (saved) {
      (saved.items || []).forEach(function (id) { if (boxes[id]) boxes[id].checked = true; });
      if (BUILDER.care.some(function (c) { return c.id === saved.care; })) {
        careId = saved.care;
        careFs.querySelector('input[value="' + careId + '"]').checked = true;
      }
    }
  } catch (e) {}
  update();
})();
