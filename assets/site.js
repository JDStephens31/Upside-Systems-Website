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

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  document.querySelectorAll("[data-month]").forEach(function (n) { n.textContent = months[new Date().getMonth()]; });
  document.querySelectorAll("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });
})();
