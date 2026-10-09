(function () {
  var reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var title = document.getElementById("ttl");
  var word = title.textContent.toUpperCase();
  title.textContent = "";

  var letters = [].map.call(word, function (ch) {
    var span = document.createElement("span");
    span.className = "l";
    span.setAttribute("aria-hidden", "true");
    span.innerHTML = "<i>" + ch + "</i><u>" + ch + "</u><b>" + ch + "</b>";
    title.appendChild(span);
    return {
      outline: span.querySelector("u"),
      fill: span.querySelector("b")
    };
  });

  var wheel = document.getElementById("wheel");
  var cards = [].slice.call(wheel.querySelectorAll(".card"));
  var label = document.getElementById("lab");
  var ring = document.getElementById("ring");
  var phase = 0;
  var speed = 1.7;
  var hoverTitle = false;
  var count = cards.length;
  var pos = 3;
  var target = 3;
  var dir = 1;
  var step = 17;
  var radius = 600;
  var paused = false;
  var shown = -1;

  function size() {
    radius = wheel.offsetWidth / 2;
    step = (cards[0].offsetWidth / radius) * 180 / Math.PI * 0.88;
  }

  function draw() {
    for (var i = 0; i < count; i++) {
      var delta = i - pos;
      cards[i].style.transform = "rotate(" + delta * step + "deg) translateY(" + -radius + "px)";
      cards[i].style.zIndex = 100 - Math.round(Math.abs(delta) * 10);
    }
    ring.style.transform = "rotate(" + -pos * step * 0.6 + "deg)";
    var active = Math.round(pos);
    if (active !== shown) {
      shown = active;
      label.textContent = cards[active].dataset.l;
    }
    if (!reducedMotion) {
      for (var j = 0; j < letters.length; j++) {
        var p = phase - j * 0.5;
        var k = Math.sin(p);
        var c = Math.cos(p);
        letters[j].fill.style.transform =
          "translateY(" + k * 0.09 + "em) scaleY(" + c + ") skewX(" + -k * 12 + "deg)";
        letters[j].outline.style.transform =
          "translateY(" + -k * 0.09 + "em) scaleY(" + -c + ") skewX(" + k * 12 + "deg)";
      }
    }
  }

  var last = performance.now();

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    phase += dt * speed;
    speed += ((hoverTitle ? 5 : 1.7) - speed) * 0.08;
    pos += (target - pos) * (1 - Math.pow(0.0005, dt));
    draw();
    requestAnimationFrame(frame);
  }

  function go(n) {
    target = Math.max(0, Math.min(count - 1, n));
  }

  function auto() {
    if (paused || reducedMotion) return;
    if (target + dir > count - 1 || target + dir < 0) dir *= -1;
    go(target + dir);
  }

  title.addEventListener("mouseenter", function () {
    hoverTitle = true;
  });
  title.addEventListener("mouseleave", function () {
    hoverTitle = false;
  });

  setInterval(auto, 2600);
  wheel.addEventListener("mouseenter", function () {
    paused = true;
  });
  wheel.addEventListener("mouseleave", function () {
    paused = false;
  });
  wheel.addEventListener("focusin", function (e) {
    paused = true;
    var i = cards.indexOf(e.target);
    if (i > -1) go(i);
  });
  wheel.addEventListener("focusout", function () {
    paused = false;
  });

  document.querySelector(".arr.p").onclick = function () {
    dir = -1;
    go(Math.round(target) - 1);
  };
  document.querySelector(".arr.n").onclick = function () {
    dir = 1;
    go(Math.round(target) + 1);
  };

  cards.forEach(function (card, i) {
    card.addEventListener("click", function (e) {
      if (Math.round(target) !== i) {
        e.preventDefault();
        go(i);
      }
    });
  });

  addEventListener("resize", size);
  size();
  pos = target;
  draw();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
  requestAnimationFrame(frame);
})();
