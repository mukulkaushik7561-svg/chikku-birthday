
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const gate = $("#gate");
const experience = $("#experience");
const gateForm = $("#gateForm");
const password = $("#password");
const gateError = $("#gateError");
const opening = $("#opening");
const giftBox = $("#giftBox");

gateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (password.value === "Bhuddu") {
    gate.classList.add("is-hidden");
    experience.classList.remove("is-hidden");
    experience.setAttribute("aria-hidden", "false");
    opening.scrollIntoView({ block: "start" });
    requestAnimationFrame(() => playMotionNow(opening));
  } else {
    gateError.textContent = "nope 😭 this little scrapbook knows its person";
    password.select();
  }
});

let openingRevealed = false;
opening.addEventListener("click", (event) => {
  if (openingRevealed) return;
  if (event.target.closest("button,a,input,iframe")) return;
  openingRevealed = true;
  giftBox.classList.remove("is-hidden");
  window.setTimeout(() => giftBox.focus({ preventScroll: true }), 150);
});

giftBox.addEventListener("click", (event) => {
  event.stopPropagation();
  if (giftBox.classList.contains("opened")) return;
  giftBox.classList.add("opened");
  setTimeout(() => $("#hero").scrollIntoView({ behavior: "smooth", block: "start" }), 700);
});

// Music presentation
const musicSection = $("#music");
const musicPlayer = $("#musicPlayer");
$("#musicReveal").addEventListener("click", () => {
  $("#musicFrame").classList.remove("is-hidden");
  musicSection.classList.add("music-opened");
  $("#musicReveal").textContent = "song opened ♫";
});

musicPlayer.addEventListener("load", () => {
  const message = (payload) => musicPlayer.contentWindow?.postMessage(JSON.stringify(payload), "https://www.youtube.com");
  message({ event: "listening" });
  message({ event: "command", func: "addEventListener", args: ["onStateChange"] });
});

window.addEventListener("message", (event) => {
  if (event.origin !== "https://www.youtube.com") return;
  let payload;
  try { payload = typeof event.data === "string" ? JSON.parse(event.data) : event.data; } catch { return; }
  if (payload?.event !== "onStateChange") return;
  musicSection.classList.toggle("playing", Number(payload.info) === 1);
});

// Surprise
$("#surpriseButton").addEventListener("click", () => {
  $("#surprise").classList.remove("is-hidden");
  $("#surprise").setAttribute("aria-hidden", "false");
  $("#surprise").scrollIntoView({ behavior: "smooth" });
});

$("#showSixteen").addEventListener("click", () => {
  $("#surpriseNote").classList.add("is-hidden");
  $("#sixteenReveal").classList.remove("is-hidden");
  playMotionNow($("#sixteenReveal"));
  buildConfetti();
});

// Gift twist: one clean state transition
$("#twistButton").addEventListener("click", () => {
  $("#twistButton").classList.add("is-hidden");
  $("#giftReveal").classList.remove("is-hidden");
  playMotionNow($("#giftReveal"));
});

// Memory sky final button
$("#finalButton").addEventListener("click", () => {
  $("#finale").classList.remove("is-hidden");
  $("#finale").setAttribute("aria-hidden", "false");
  $("#finale").scrollIntoView({ behavior: "smooth", block: "start" });
  requestAnimationFrame(() => playMotionNow($("#finale")));
  makeCelebrationBurst();
});

// Scratch card implementation
function setupScratchCard(canvas) {
  const frame = canvas.closest(".scratch-frame");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let drawing = false;
  let completed = false;
  let lastPoint = null;
  let ready = false;
  let coverWidth = 0;
  let coverHeight = 0;
  let lastProgressCheck = 0;
  let resizeFrame = 0;

  function sizeCanvas() {
    if (completed) return false;
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));

    if (ready && width === coverWidth && height === coverHeight) return true;

    canvas.width = width;
    canvas.height = height;
    coverWidth = width;
    coverHeight = height;
    ready = true;
    drawCover(width, height);
    return true;
  }

  function drawCover(w, h) {
    ctx.globalCompositeOperation = "source-over";
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#d9c7b9");
    g.addColorStop(0.45, "#c6d8cf");
    g.addColorStop(1, "#e7bcc8");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255,250,242,.92)";
    ctx.font = `700 ${Math.max(28, w * 0.07)}px "Caveat", cursive`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("scratch me ✦", w / 2, h / 2);

    for (let i = 0; i < 44; i++) {
      ctx.fillStyle = i % 2 ? "rgba(255,255,255,.19)" : "rgba(70,102,94,.10)";
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 8 + 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function point(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function scratch(event) {
    if (!drawing || completed || !ready) return;
    event.preventDefault();
    const p = point(event);
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(42, canvas.width * 0.13);
    ctx.beginPath();
    ctx.moveTo(lastPoint?.x ?? p.x, lastPoint?.y ?? p.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPoint = p;

    if (performance.now() - lastProgressCheck > 120) checkProgress();
  }

  function checkProgress() {
    if (!ready || completed) return;
    lastProgressCheck = performance.now();
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    const step = 4 * 56;
    let samples = 0;
    for (let i = 3; i < pixels.length; i += step) {
      samples++;
      if (pixels[i] < 35) transparent++;
    }
    if (samples && transparent / samples > 0.52) {
      completed = true;
      drawing = false;
      lastPoint = null;
      resizeObserver.disconnect();
      canvas.style.transition = "opacity .55s ease";
      canvas.style.opacity = "0";
      setTimeout(() => {
        canvas.style.pointerEvents = "none";
        frame.closest(".polaroid")?.classList.add("revealed");
      }, 550);
    }
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (!sizeCanvas() || completed) return;
    event.preventDefault();
    drawing = true;
    lastPoint = point(event);
    canvas.setPointerCapture?.(event.pointerId);
    scratch(event);
  });
  canvas.addEventListener("pointermove", scratch);
  const stopDrawing = () => { drawing = false; lastPoint = null; checkProgress(); };
  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointercancel", stopDrawing);
  canvas.addEventListener("pointerleave", (event) => {
    if (!canvas.hasPointerCapture?.(event.pointerId)) stopDrawing();
  });
  canvas.addEventListener("lostpointercapture", stopDrawing);

  const resizeObserver = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(sizeCanvas);
  });
  resizeObserver.observe(frame);
  requestAnimationFrame(sizeCanvas);
}
$$(".scratch-canvas").forEach(setupScratchCard);

// Stars
function buildStars() {
  const starField = $("#stars");
  for (let i = 0; i < 95; i++) {
    const s = document.createElement("i");
    s.className = "star";
    s.style.left = `${Math.random() * 100}%`;
    s.style.top = `${Math.random() * 100}%`;
    s.style.setProperty("--s", `${Math.random() * 3.5 + 1.5}px`);
    s.style.setProperty("--d", `${Math.random() * 2.7 + 1.4}s`);
    s.style.animationDelay = `${Math.random() * 3}s`;
    starField.appendChild(s);
  }
}
buildStars();

function buildConfetti() {
  const field = $(".confetti-field");
  if (field.children.length) return;
  const colors = ["#f8e089", "#8fbba9", "#fff5e6", "#d66f8e", "#ef9c77", "#b9aed3"];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement("i");
    p.className = "confetti-piece";
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = colors[i % colors.length];
    p.style.setProperty("--dur", `${1.3 + Math.random() * .85}s`);
    p.style.setProperty("--rot", `${Math.random() * 180}deg`);
    p.style.setProperty("--drift", `${-80 + Math.random() * 160}px`);
    p.style.animationDelay = `${Math.random() * .18}s`;
    field.appendChild(p);
  }
  window.setTimeout(() => { field.textContent = ""; }, 2600);
}

function makeCelebrationBurst() {
  const finale = $("#finale");
  for (let i = 0; i < 24; i++) {
    const piece = document.createElement("span");
    piece.textContent = i % 3 === 0 ? "✦" : i % 3 === 1 ? "♡" : "·";
    piece.className = "celebration-fleck";
    piece.style.left = `${10 + Math.random() * 80}%`;
    piece.style.top = `${5 + Math.random() * 80}%`;
    piece.style.fontSize = `${18 + Math.random() * 24}px`;
    piece.style.opacity = ".45";
    piece.style.transform = `rotate(${Math.random() * 60 - 30}deg)`;
    piece.setAttribute("aria-hidden", "true");
    finale.appendChild(piece);
  }
  window.setTimeout(() => $$(".celebration-fleck", finale).forEach((piece) => piece.remove()), 2100);
}

// Scroll-triggered scrapbook assembly. Existing content remains visible until every
// target is registered, so unsupported browsers retain the complete experience.
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function registerReveals(rootSelector, entries) {
  const root = $(rootSelector);
  if (!root) return;
  entries.forEach(([selector, type = "reveal-paper", delay = 0]) => {
    $$(selector, root).forEach((element, index) => {
      element.classList.add("reveal", type);
      element.style.setProperty("--reveal-final", getComputedStyle(element).transform);
      element.style.setProperty("--reveal-delay", `${delay + index * .1}s`);
    });
  });
}

registerReveals("#gate", [
  [".gate-paper", "reveal-paper", .04], [".gate-tulip", "reveal-slide-left", .16],
  [".gate-kitten", "reveal-scale-settle", .26], [".scribble", "reveal-text-line", .36],
  [".gate h1,.gate-copy", "reveal-text-line", .48], [".gate-form", "reveal-paper", .64]
]);
registerReveals("#opening", [
  [".opening-note", "reveal-paper", .05], [".tape-b", "reveal-tape", .2],
  [".opening-note p", "reveal-text-line", .32], [".opening-bow,.opening-sparkle", "reveal-scale-settle", .48]
]);
registerReveals("#hero", [
  [".favourite-label", "reveal-paper", .08], [".hero-tulip-left", "reveal-slide-left", .28],
  [".hero-tulip-right", "reveal-slide-right", .38], [".hero-kitten", "reveal-scale-settle", .52],
  [".hero-bow", "reveal-scale-settle", .64], [".hero-red-tape", "reveal-tape", .76],
  [".hero-title", "reveal-text-line", .92], [".hero-date,.hero-ticket", "reveal-stamp", 1.08],
  [".hero-ink-star", "reveal-doodle", 1.25]
]);
registerReveals("#music", [
  [".record-wrap", "reveal-scale-settle", .04], [".music-card", "reveal-paper", .16],
  [".tape-c", "reveal-tape", .42], [".music-card .hand-label", "reveal-typewriter", .52],
  [".music-radio,.music-cassette", "reveal-slide-right", .24]
]);
registerReveals("#jokes", [
  [".eyebrow,.jokes-section h2", "reveal-paper", .03], [".sticky-one", "reveal-slide-left", .22],
  [".sticky-two", "reveal-slide-right", .37], [".joke-kitten", "reveal-scale-settle", .56],
  [".joke-heart,.jokes-star", "reveal-doodle", .68], [".jokes-label", "reveal-typewriter", .12]
]);
registerReveals("#memories", [
  [".memory-heading", "reveal-paper", .18], [".letter", "reveal-paper", .05],
  [".tape-e,.memory-red-tape", "reveal-tape", .34], [".letter-stamp,.memory-ticket", "reveal-stamp", .46],
  [".letter p", "reveal-text-line", .58], [".letter-signoff", "reveal-text-line", .78],
  [".memory-label", "reveal-typewriter", .78], [".memory-tulip,.memory-flowers", "reveal-scale-settle", .52]
]);
registerReveals("#photos", [
  [".photos-heading", "reveal-paper", .05], [".photos-film", "reveal-film", .18],
  [".polaroid", "reveal-polaroid", .32], [".photo-tape", "reveal-tape", .58],
  [".scratch-note", "reveal-text-line", .72]
]);
registerReveals("#giftTease", [
  [".tease-card", "reveal-paper", .08], [".tease-bow", "reveal-scale-settle", .26],
  [".gift-ticket,.gift-news", "reveal-stamp", .34], [".gift-red-tape", "reveal-tape", .46]
]);
registerReveals("#surprise", [
  [".surprise-note", "reveal-paper", .06], [".sixteen-news", "reveal-paper", .04],
  [".sixteen-date", "reveal-stamp", .18], [".sixteen-cake", "reveal-scale-settle", .32],
  [".sixteen-bow,.sixteen-star", "reveal-doodle", .46], [".sixteen-reveal h2", "reveal-scale-settle", .58]
]);
registerReveals("#goodThings", [
  [".good-things>.hand-label,.good-things>h2", "reveal-paper", .04], [".good-list article", "reveal-paper", .24],
  [".missing-numbers", "reveal-text-line", .88], [".you-card", "reveal-scale-settle", 1.02],
  [".you-heart", "reveal-doodle", 1.18]
]);
registerReveals("#twist", [
  [".twist-card", "reveal-paper", .08], [".ribbon-button", "reveal-tape", .32],
  [".twist-seal", "reveal-stamp", .4], [".gift-reveal", "reveal-paper", .02]
]);
registerReveals("#memorySky", [
  [".sky-film", "reveal-film", .08], [".sky-note", "reveal-text-line", .22],
  [".sky-content", "reveal-scale-settle", .18]
]);
registerReveals("#finale", [
  [".final-paper", "reveal-paper", .08], [".final-left", "reveal-slide-left", .25],
  [".final-right", "reveal-slide-right", .34], [".final-bow,.final-cake", "reveal-scale-settle", .45],
  [".final-paper h2", "reveal-text-line", .62], [".final-heart", "reveal-doodle", .92]
]);

function typeVintageLabel(element) {
  if (element.dataset.typed || prefersReducedMotion.matches) return;
  const text = element.textContent.trim();
  if (!text) return;
  element.dataset.typed = "true";
  element.textContent = "";
  let index = 0;
  const timer = window.setInterval(() => {
    element.textContent += text[index++] || "";
    if (index >= text.length) {
      window.clearInterval(timer);
      element.classList.add("typed-complete");
    }
  }, 26);
}

function playMotionNow(root) {
  if (!root) return;
  root.classList.add("is-inview");
  $$(".reveal-typewriter", root).forEach((element) => {
    const delay = Math.round(parseFloat(element.style.getPropertyValue("--reveal-delay")) * 1000) || 0;
    window.setTimeout(() => typeVintageLabel(element), delay + 170);
  });
}

document.documentElement.classList.add("motion-ready");
playMotionNow(gate);
if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      playMotionNow(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: .16, rootMargin: "0px 0px -8%" });
  $$("#hero,#music,#jokes,#memories,#photos,#giftTease,#surprise,#goodThings,#twist,#memorySky,#finale").forEach((section) => sectionObserver.observe(section));
} else {
  $$(".reveal").forEach((element) => element.classList.add("is-inview"));
}
