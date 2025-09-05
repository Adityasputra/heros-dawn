// Starfield generator
(function createStars() {
  const wrap = document.getElementById("starfield");
  if (!wrap) return;

  const count = Math.min(160, Math.floor(window.innerWidth / 8));
  const frag = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "star";

    const size = 1 + Math.random() * 2; // 1px - 3px
    s.style.width = size + "px";
    s.style.height = size + "px";

    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";

    s.style.animationDelay = (Math.random() * 3).toFixed(2) + "s";
    s.style.animationDuration = (2 + Math.random() * 3).toFixed(2) + "s";

    s.style.opacity = (0.2 + Math.random() * 0.8).toFixed(2);

    frag.appendChild(s);
  }

  wrap.appendChild(frag);
})();
