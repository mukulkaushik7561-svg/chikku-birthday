
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
$("#musicReveal").addEventListener("click", () => {
  $("#musicFrame").classList.remove("is-hidden");
  $("#music").classList.add("playing");
  $("#musicReveal").textContent = "song opened ♫";
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
  buildConfetti();
});

// Gift twist: one clean state transition
$("#twistButton").addEventListener("click", () => {
  $("#twistButton").classList.add("is-hidden");
  $("#giftReveal").classList.remove("is-hidden");
});

// Memory sky final button
$("#finalButton").addEventListener("click", () => {
  $("#finale").classList.remove("is-hidden");
  $("#finale").setAttribute("aria-hidden", "false");
  $("#finale").scrollIntoView({ behavior: "smooth", block: "start" });
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
    p.style.setProperty("--dur", `${3 + Math.random() * 4}s`);
    p.style.setProperty("--rot", `${Math.random() * 180}deg`);
    p.style.setProperty("--drift", `${-80 + Math.random() * 160}px`);
    p.style.animationDelay = `${-Math.random() * 4}s`;
    field.appendChild(p);
  }
}

function makeCelebrationBurst() {
  const finale = $("#finale");
  for (let i = 0; i < 24; i++) {
    const piece = document.createElement("span");
    piece.textContent = i % 3 === 0 ? "✦" : i % 3 === 1 ? "♡" : "·";
    piece.style.position = "absolute";
    piece.style.left = `${10 + Math.random() * 80}%`;
    piece.style.top = `${5 + Math.random() * 80}%`;
    piece.style.fontSize = `${18 + Math.random() * 24}px`;
    piece.style.opacity = ".45";
    piece.style.transform = `rotate(${Math.random() * 60 - 30}deg)`;
    piece.setAttribute("aria-hidden", "true");
    finale.appendChild(piece);
  }
}
