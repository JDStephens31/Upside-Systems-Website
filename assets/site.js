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

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  document.querySelectorAll("[data-month]").forEach(function (n) { n.textContent = months[new Date().getMonth()]; });
  document.querySelectorAll("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });
})();
