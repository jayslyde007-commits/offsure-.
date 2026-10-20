/* Offsure – tracking logic and page behaviour.
 *
 * Shipments below are demo data. To connect a real backend, replace the body
 * of fetchShipment() with a fetch() call to your API (see README.md).
 */
(function () {
  "use strict";

  // ---------- Demo shipment data ----------
  var SHIPMENTS = {
    OFS123456789: {
      status: "In transit",
      origin: "Shanghai, China",
      destination: "Lagos, Nigeria",
      service: "Sea freight (FCL)",
      weight: "1,240 kg",
      eta: "2026-11-02",
      stage: 2,
      history: [
        { when: "2026-10-17 09:40", where: "Port of Tema, Ghana", text: "Vessel in transit, arrived at transshipment port" },
        { when: "2026-10-09 14:05", where: "Singapore", text: "Departed Singapore terminal" },
        { when: "2026-10-04 08:30", where: "Shanghai, China", text: "Loaded on vessel" },
        { when: "2026-10-02 16:15", where: "Shanghai, China", text: "Shipment picked up from sender" },
        { when: "2026-10-01 11:00", where: "Shanghai, China", text: "Shipment booked" }
      ]
    },
    OFS555000111: {
      status: "Delivered",
      origin: "London, United Kingdom",
      destination: "Abuja, Nigeria",
      service: "Air freight (Express)",
      weight: "18.5 kg",
      eta: "2026-10-12",
      stage: 4,
      history: [
        { when: "2026-10-12 13:22", where: "Abuja, Nigeria", text: "Delivered. Signed for by recipient" },
        { when: "2026-10-12 08:10", where: "Abuja, Nigeria", text: "Out for delivery" },
        { when: "2026-10-11 19:45", where: "Lagos, Nigeria", text: "Customs cleared, arrived at destination hub" },
        { when: "2026-10-10 22:30", where: "London Heathrow, UK", text: "Departed origin airport" },
        { when: "2026-10-10 10:00", where: "London, United Kingdom", text: "Shipment picked up from sender" }
      ]
    },
    OFS987654321: {
      status: "Customs hold",
      origin: "Dubai, UAE",
      destination: "Port Harcourt, Nigeria",
      service: "Air freight (Standard)",
      weight: "76 kg",
      eta: "2026-10-24",
      stage: 3,
      exception: true,
      history: [
        { when: "2026-10-18 15:50", where: "Lagos, Nigeria", text: "Held at customs. Additional documents required" },
        { when: "2026-10-18 06:20", where: "Lagos, Nigeria", text: "Arrived at destination country" },
        { when: "2026-10-16 23:05", where: "Dubai, UAE", text: "Departed origin airport" },
        { when: "2026-10-16 09:30", where: "Dubai, UAE", text: "Shipment picked up from sender" }
      ]
    }
  };

  var STAGES = ["Booked", "Picked up", "In transit", "Customs", "Delivered"];

  // ---------- Helpers ----------
  function $(id) { return document.getElementById(id); }

  function normalise(value) {
    return String(value || "").replace(/[\s-]+/g, "").toUpperCase();
  }

  // Replace this function to call a real API.
  // Must return a Promise resolving to a shipment object, or null if not found.
  function fetchShipment(number) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(Object.prototype.hasOwnProperty.call(SHIPMENTS, number) ? SHIPMENTS[number] : null);
      }, 450);
    });
  }

  function formatDate(iso) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) { return iso; }
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function el(tag, text, className) {
    var node = document.createElement(tag);
    if (text !== undefined) { node.textContent = text; }
    if (className) { node.className = className; }
    return node;
  }

  // ---------- Tracking ----------
  var errorBox = $("trackError");
  var resultBox = $("trackResult");

  function showError(message) {
    resultBox.hidden = true;
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function renderResult(number, s) {
    errorBox.hidden = true;

    $("rNumber").textContent = number;
    var badge = $("rStatus");
    badge.textContent = s.status;
    badge.className = "badge" + (s.stage === 4 ? " delivered" : "") + (s.exception ? " exception" : "");

    $("rOrigin").textContent = s.origin;
    $("rDest").textContent = s.destination;
    $("rService").textContent = s.service;
    $("rWeight").textContent = s.weight;
    $("rEta").textContent = s.stage === 4 ? "Delivered" : formatDate(s.eta);
    $("rLast").textContent = s.history[0].where;

    // Progress bar
    var steps = $("rSteps");
    steps.innerHTML = "";
    STAGES.forEach(function (name, i) {
      steps.appendChild(el("span", name, i <= s.stage ? "done" : ""));
    });
    var fill = $("rProgress");
    fill.style.width = "0";
    resultBox.hidden = false;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        fill.style.width = (s.stage / (STAGES.length - 1)) * 100 + "%";
      });
    });

    // Timeline
    var list = $("rTimeline");
    list.innerHTML = "";
    s.history.forEach(function (h) {
      var li = document.createElement("li");
      li.appendChild(el("strong", h.text));
      li.appendChild(el("span", h.where + " · " + h.when, "meta"));
      list.appendChild(li);
    });

    resultBox.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function track(raw) {
    var number = normalise(raw);
    if (!number) {
      showError("Please enter a tracking number.");
      return;
    }
    if (!/^OFS\d{9}$/.test(number)) {
      showError("That doesn't look like an Offsure tracking number. It should look like OFS123456789.");
      return;
    }
    errorBox.hidden = true;
    resultBox.hidden = true;

    fetchShipment(number).then(function (shipment) {
      if (!shipment) {
        showError("No shipment found for " + number + ". Check the number and try again.");
        return;
      }
      renderResult(number, shipment);
    }).catch(function () {
      showError("We couldn't reach the tracking service. Please try again in a moment.");
    });
  }

  function goToTrack(value) {
    $("trackInput").value = value;
    $("track").scrollIntoView({ behavior: "smooth" });
    track(value);
  }

  $("heroTrackForm").addEventListener("submit", function (e) {
    e.preventDefault();
    goToTrack($("heroTrackInput").value);
  });
  $("trackForm").addEventListener("submit", function (e) {
    e.preventDefault();
    track($("trackInput").value);
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-demo]"), function (btn) {
    btn.addEventListener("click", function () {
      $("heroTrackInput").value = btn.getAttribute("data-demo");
      goToTrack(btn.getAttribute("data-demo"));
    });
  });

  // ---------- Mobile nav ----------
  var toggle = $("navToggle");
  var nav = $("nav");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  // ---------- Count-up stats ----------
  function countUp(node) {
    var target = parseInt(node.getAttribute("data-count"), 10);
    var start = null;
    var duration = 1400;
    function tick(ts) {
      if (start === null) { start = ts; }
      var p = Math.min((ts - start) / duration, 1);
      node.textContent = Math.round(target * p).toLocaleString("en-US");
      if (p < 1) { requestAnimationFrame(tick); }
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countUp(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    Array.prototype.forEach.call(counters, function (c) { io.observe(c); });
  } else {
    Array.prototype.forEach.call(counters, function (c) {
      c.textContent = Number(c.getAttribute("data-count")).toLocaleString("en-US");
    });
  }

  // ---------- Contact form (front-end only) ----------
  $("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var note = $("formNote");
    var name = $("cName").value.trim();
    var email = $("cEmail").value.trim();
    var msg = $("cMsg").value.trim();
    note.hidden = false;
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !msg) {
      note.className = "form-note error";
      note.textContent = "Please fill in your name, a valid email and a message.";
      return;
    }
    note.className = "form-note";
    note.textContent = "Thanks, " + name + ". Your message has been received (demo: connect a backend to send it).";
    e.target.reset();
  });

  // ---------- Footer year ----------
  $("year").textContent = new Date().getFullYear();
})();
