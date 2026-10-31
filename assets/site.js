/* Mobile menu, booking month and footer year */
(function () {
  var btn = document.querySelector(".menu-btn"), nav = document.getElementById("site-nav");
  var header = document.querySelector(".site-header"), label = btn && btn.querySelector(".menu-label");
  var mobile = window.matchMedia("(max-width:860px)"), scrim = null;

  function setOpen(open, returnFocus) {
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (label) label.textContent = open ? "Close" : "Menu";
    document.body.classList.toggle("nav-open", open);
    if (open) {
      // Fit the panel between the header and the bottom of the screen
      nav.style.maxHeight = Math.max(240, window.innerHeight - header.getBoundingClientRect().bottom) + "px";
      scrim = document.createElement("div");
      scrim.className = "nav-scrim";
      scrim.addEventListener("click", function () { setOpen(false); });
      document.body.appendChild(scrim);
    } else {
      nav.style.maxHeight = "";
      if (scrim) { scrim.remove(); scrim = null; }
      if (returnFocus) btn.focus();
    }
  }

  if (btn && nav && header) {
    btn.addEventListener("click", function () { setOpen(!nav.classList.contains("open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) setOpen(false, true);
    });
    var onChange = function () { if (!mobile.matches && nav.classList.contains("open")) setOpen(false); };
    if (mobile.addEventListener) mobile.addEventListener("change", onChange); else mobile.addListener(onChange);
  }

  // Scroll reveals: the head script adds html.motion when motion is welcome
  if (document.documentElement.classList.contains("motion")) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    var reveal = ".section .h2, .head-row, .scenarios li, .jobs > div, .industries > div, .timeline li, .price-row, .tier, " +
      ".principles > div, .faq details, .included li, .pkg-intro, .complete > div, .promise, .story > *, " +
      ".quote-in > *, .statement p, .cta-in > *, .table-box, .page-hero > *, .prose > *, mark";
    document.querySelectorAll(reveal).forEach(function (n) {
      if (n.closest(".hero, .audit")) return;
      var sibs = Array.prototype.filter.call(n.parentNode.children, function (c) { return c.matches(reveal); });
      n.style.setProperty("--d", Math.min(sibs.indexOf(n) * 0.08, 0.4) + "s");
      n.classList.add("anim");
      io.observe(n);
    });
    document.querySelectorAll(".flow, .demo, .report").forEach(function (n) { io.observe(n); });
  }

  // Automation flow: one connector line through every node. Straight along a row;
  // where the row wraps it curves out, back along the gap and into the next row.
  function drawFlow(flow) {
    var R = 10, PAD = 16, NS = "http://www.w3.org/2000/svg";
    var old = flow.querySelector(".flow-line"); if (old) old.remove();
    flow.classList.add("drawn");
    var spans = Array.prototype.slice.call(flow.querySelectorAll(".flow-node span"));
    var top = function (n) { return n.getBoundingClientRect().top; };
    flow.classList.remove("wrapped");
    flow.classList.toggle("wrapped", spans.some(function (n) { return Math.abs(top(n) - top(spans[0])) > 4; }));
    var box = flow.getBoundingClientRect();
    var rects = spans.map(function (n) {
      var r = n.getBoundingClientRect();
      return { l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top, cx: (r.left + r.right) / 2 - box.left, cy: (r.top + r.bottom) / 2 - box.top };
    });
    var d = "M" + rects[0].cx + " " + rects[0].cy;
    for (var i = 1; i < rects.length; i++) {
      var a = rects[i - 1], b = rects[i];
      if (Math.abs(a.cy - b.cy) < 4) { d += " L" + b.cx + " " + b.cy; continue; }
      var right = a.r + PAD, left = b.l - PAD, mid = (a.b + b.t) / 2;
      d += " L" + (right - R) + " " + a.cy + " Q" + right + " " + a.cy + " " + right + " " + (a.cy + R) +
           " L" + right + " " + (mid - R) + " Q" + right + " " + mid + " " + (right - R) + " " + mid +
           " L" + (left + R) + " " + mid + " Q" + left + " " + mid + " " + left + " " + (mid + R) +
           " L" + left + " " + (b.cy - R) + " Q" + left + " " + b.cy + " " + (left + R) + " " + b.cy +
           " L" + b.cx + " " + b.cy;
    }
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "flow-line"); svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", box.width); svg.setAttribute("height", box.height);
    var path = document.createElementNS(NS, "path");
    path.setAttribute("d", d);
    svg.appendChild(path);
    flow.insertBefore(svg, flow.firstChild);
    path.style.setProperty("--len", Math.ceil(path.getTotalLength()));
  }
  var flows = document.querySelectorAll(".flow");
  if (flows.length) {
    var redraw = function () { flows.forEach(drawFlow); };
    redraw();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);
    var flowT;
    window.addEventListener("resize", function () { clearTimeout(flowT); flowT = setTimeout(redraw, 120); });
  }

  // Analytics consent. Each page's head keeps analytics off and defines upsideAnalytics() to load it;
  // this records the visitor's choice.
  // Global Privacy Control counts as a standing "no", so those visitors never see the banner.
  var gpc = navigator.globalPrivacyControl === true, banner = null;
  function getChoice() { try { return localStorage.getItem("upside-consent"); } catch (e) { return null; } }
  function choose(granted) {
    try { localStorage.setItem("upside-consent", granted ? "granted" : "denied"); } catch (e) {}
    if (granted) { window["ga-disable-G-LYQRHSPG2B"] = false; if (window.upsideAnalytics) upsideAnalytics(); }
    if (!granted) {
      // Google's opt-out flag stops an already-loaded tag from sending anything more
      window["ga-disable-G-LYQRHSPG2B"] = true;
      if (window.gtag) gtag("consent", "update", { analytics_storage: "denied" });
    }
    if (!granted) {
      // Remove analytics cookies already set on this domain
      document.cookie.split(";").forEach(function (c) {
        var name = c.split("=")[0].trim();
        if (/^_ga/.test(name)) [location.hostname, "." + location.hostname.replace(/^www\./, "")].forEach(function (d) {
          document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + d;
        });
      });
    }
    closeBanner(true);
  }
  function closeBanner(returnFocus) {
    if (!banner) return;
    banner.remove(); banner = null;
    document.body.classList.remove("cookie-open");
    document.documentElement.style.removeProperty("--overlay-h");
    if (returnFocus && closeBanner.from) closeBanner.from.focus();
  }
  function openBanner(from) {
    if (banner) { banner.querySelector("button").focus(); return; }
    closeBanner.from = from || null;
    banner = document.createElement("section");
    banner.className = "cookie-banner";
    banner.setAttribute("aria-labelledby", "cookie-h");
    var choice = getChoice();
    banner.innerHTML = '<div class="wrap cookie-in"><div><p class="cookie-title" id="cookie-h">Your privacy choice</p>' +
      (gpc ? '<p>Your browser sends a Global Privacy Control signal, so analytics cookies stay off and we don’t share your data. Nothing else to do.</p>'
           : '<p>We’d like to use Google Analytics cookies to see which pages are useful. They stay off unless you accept. We don’t use advertising cookies or sell your data.' +
             (choice ? ' You currently have analytics <strong>' + (choice === "granted" ? "on" : "off") + '</strong>.' : '') +
             ' <a href="/privacy.html#cookies">Privacy policy</a></p>') +
      '</div><div class="cookie-actions">' +
      (gpc ? '<button class="btn btn-primary btn-sm" type="button" data-c="close">OK</button>'
           : '<button class="btn btn-outline btn-sm" type="button" data-c="yes">Accept analytics</button>' +
             '<button class="btn btn-outline btn-sm" type="button" data-c="no">Decline</button>') +
      '</div></div>';
    banner.addEventListener("click", function (e) {
      var b = e.target.closest("[data-c]"); if (!b) return;
      var c = b.getAttribute("data-c");
      if (c === "close") closeBanner(true); else choose(c === "yes");
    });
    // Early in the page so screen reader users meet it first; it still shows at the bottom of the screen
    var skip = document.querySelector(".skip");
    document.body.insertBefore(banner, skip ? skip.nextSibling : document.body.firstChild);
    document.body.classList.add("cookie-open");
    // Keep focused elements clear of the banner (WCAG 2.4.11)
    document.documentElement.style.setProperty("--overlay-h", banner.offsetHeight + "px");
    if (from) banner.querySelector("button").focus();
  }
  document.querySelectorAll("[data-cookie-settings]").forEach(function (b) {
    b.addEventListener("click", function () { openBanner(b); });
  });
  if (!getChoice() && !gpc) openBanner();

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  document.querySelectorAll("[data-month]").forEach(function (n) { n.textContent = months[new Date().getMonth()]; });
  document.querySelectorAll("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });
})();
