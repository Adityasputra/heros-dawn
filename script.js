// Starfield generator
(function createStars() {
  const wrap = document.getElementById("starfield");
  const count = Math.min(160, Math.floor(window.innerWidth / 8));
  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "star";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 60 + "%";
    s.style.animationDelay = Math.random() * 2 + "s";
    s.style.opacity = (0.2 + Math.random() * 0.8).toFixed(2);
    wrap.appendChild(s);
  }
})();
