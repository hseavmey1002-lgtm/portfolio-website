(function () {
  var $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  var $$ = function (sel, root) {
    return [].slice.call((root || document).querySelectorAll(sel));
  };

  var content = window.PORTFOLIO || { aboutTabs: [], greetings: [] };

  var cursor = $("#cur");
  var tx = 0;
  var ty = 0;
  var cx = 0;
  var cy = 0;
  addEventListener("mousemove", function (e) {
    tx = e.clientX;
    ty = e.clientY;
  });
  addEventListener("mouseover", function (e) {
    cursor.classList.toggle("big", !!e.target.closest("a,button"));
  });
  (function follow() {
    cx += (tx - cx) * 0.2;
    cy += (ty - cy) * 0.2;
    cursor.style.transform = "translate(" + cx + "px," + cy + "px)";
    requestAnimationFrame(follow);
  })();

  var panel = $("#panel");
  panel.textContent = content.aboutTabs[0] || "";
  $$(".tabs button").forEach(function (button) {
    button.onclick = function () {
      $$(".tabs button").forEach(function (other) {
        other.setAttribute("aria-selected", other === button);
      });
      panel.textContent = content.aboutTabs[button.dataset.i] || "";
    };
  });

  var greetingIndex = 0;
  var bubble = $("#bub");
  $("#pic").onclick = function () {
    bubble.textContent = content.greetings[greetingIndex++ % content.greetings.length];
    bubble.classList.add("on");
    clearTimeout(bubble.t);
    bubble.t = setTimeout(function () {
      bubble.classList.remove("on");
    }, 2200);
  };

  var projects = $$(".proj");
  $$(".chip").forEach(function (chip) {
    chip.onclick = function () {
      $$(".chip").forEach(function (other) {
        other.setAttribute("aria-pressed", other === chip);
      });
      projects.forEach(function (project) {
        var tags = project.dataset.t.split(" ");
        project.classList.toggle(
          "dim",
          chip.dataset.f !== "all" && tags.indexOf(chip.dataset.f) < 0
        );
      });
    };
  });

  projects.forEach(function (project) {
    project.onclick = function () {
      var open = project.classList.toggle("open");
      project.setAttribute("aria-expanded", open);
    };
    project.addEventListener("mousemove", function (e) {
      var box = project.getBoundingClientRect();
      project.style.setProperty("--ry", ((e.clientX - box.left) / box.width - 0.5) * 10 + "deg");
      project.style.setProperty("--rx", -((e.clientY - box.top) / box.height - 0.5) * 10 + "deg");
    });
    project.addEventListener("mouseleave", function () {
      project.style.setProperty("--rx", "0deg");
      project.style.setProperty("--ry", "0deg");
    });
  });

  var reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var countObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countObserver.unobserve(entry.target);
        var el = entry.target;
        var n = +el.dataset.n;
        var t0 = performance.now();
        if (reducedMotion) return;
        (function step(now) {
          var k = Math.min(1, (now - t0) / 1200);
          el.textContent = el.dataset.p + Math.round(n * (1 - Math.pow(1 - k, 3))) + el.dataset.s;
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    },
    { threshold: 0.6 }
  );
  $$(".st em").forEach(function (el) {
    countObserver.observe(el);
  });

  var copyBtn = $("#cp");
  var copyMsg = $("#cpm");
  copyBtn.onclick = function () {
    var text = copyBtn.textContent;
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(
      function () {
        copyMsg.textContent = "Copied! Say hi soon.";
      },
      function () {
        copyMsg.textContent = "Copy failed. Select the email and copy it manually.";
      }
    );
  };

  var dockLinks = $$(".dock a");
  var sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        dockLinks.forEach(function (link) {
          link.classList.toggle("on", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px" }
  );
  $$("section").forEach(function (section) {
    sectionObserver.observe(section);
  });

  $("#th").onclick = function () {
    var root = document.documentElement;
    var dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
  };
})();
