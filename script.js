
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

// Private final-note form. It can only insert through Supabase; it never reads notes.
const notesSection = $("#notes");
const noteForm = $("#noteForm");
const noteMessage = $("#noteMessage");
const noteSubmit = $("#noteSubmit");
const noteStatus = $("#noteStatus");
const noteSuccess = $("#noteSuccess");
let noteSubmitting = false;
let noteCompleted = false;

function setNoteStatus(message, state = "") {
  noteStatus.textContent = message;
  if (state) noteStatus.dataset.state = state;
  else delete noteStatus.dataset.state;
}

function getNotesConfig() {
  const config = window.BIRTHDAY_NOTES_CONFIG || {};
  const supabaseUrl = typeof config.supabaseUrl === "string" ? config.supabaseUrl.trim().replace(/\/$/, "") : "";
  const publishableKey = typeof config.publishableKey === "string" ? config.publishableKey.trim() : "";
  if (!supabaseUrl || !publishableKey) return null;
  try {
    const parsed = new URL(supabaseUrl);
    if (parsed.protocol !== "https:") return null;
  } catch {
    return null;
  }
  return { supabaseUrl, publishableKey };
}

function resizeNoteField() {
  noteMessage.style.height = "auto";
  const maximumHeight = 480;
  const nextHeight = Math.min(noteMessage.scrollHeight, maximumHeight);
  noteMessage.style.height = `${nextHeight}px`;
  noteMessage.style.overflowY = noteMessage.scrollHeight > maximumHeight ? "auto" : "hidden";
}

const notesConfig = getNotesConfig();
if (!notesConfig) {
  console.warn("[birthday notes] Supabase is not configured. Add the Project URL and browser-safe publishable key in supabase-notes-config.js.");
  noteSubmit.disabled = true;
  setNoteStatus("This note page is not ready to send just yet.", "error");
}

noteMessage.addEventListener("input", resizeNoteField);
requestAnimationFrame(resizeNoteField);

noteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (noteSubmitting || noteCompleted) return;

  const message = noteMessage.value.trim();
  if (!message) {
    setNoteStatus("Please write a little note before sending it ♡", "error");
    noteMessage.focus();
    return;
  }

  if (!notesConfig) {
    setNoteStatus("This note page is not ready to send just yet.", "error");
    return;
  }

  noteSubmitting = true;
  noteForm.setAttribute("aria-busy", "true");
  noteSubmit.disabled = true;
  noteSubmit.textContent = "Sending...";
  setNoteStatus("Sending your note...", "sending");

  try {
    const response = await fetch(`${notesConfig.supabaseUrl}/rest/v1/birthday_notes`, {
      method: "POST",
      headers: {
        apikey: notesConfig.publishableKey,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) throw new Error(`Supabase insert failed with status ${response.status}`);

    noteCompleted = true;
    noteForm.classList.add("is-hidden");
    noteSuccess.classList.remove("is-hidden");
    setNoteStatus("", "success");
    playMotionNow(noteSuccess);
  } catch (error) {
    console.error("[birthday notes] Insert failed.", error);
    noteSubmitting = false;
    noteForm.removeAttribute("aria-busy");
    noteSubmit.disabled = false;
    noteSubmit.textContent = "Try again ♡";
    setNoteStatus("Couldn't send it just yet. Your note is still here — please try again ♡", "error");
  }
});

// Memory sky final button
$("#finalButton").addEventListener("click", () => {
  $("#finale").classList.remove("is-hidden");
  $("#finale").setAttribute("aria-hidden", "false");
  notesSection.classList.remove("is-hidden");
  notesSection.setAttribute("aria-hidden", "false");
  $("#finale").scrollIntoView({ behavior: "smooth", block: "start" });
  requestAnimationFrame(() => {
    playMotionNow($("#finale"));
    playMotionNow(notesSection);
  });
  makeCelebrationBurst();
});

// Required friendship checkpoint before Memory Sky. State intentionally resets on reload.
const loveCheckpoint = $("#loveCheckpoint");
const loveArena = $("#loveArena");
const loveYes = $("#loveYes");
const loveNo = $("#loveNo");
const loveReaction = $("#loveReaction");
const loveSuccess = $("#loveSuccess");
const loveConfetti = $("#loveConfetti");
const memorySky = $("#memorySky");
let loveCheckpointComplete = false;
let noCoordinateReady = false;
let lastNoPosition = null;
let lastNoPointerTime = 0;
let noAttempts = 0;

function relativeRect(element, parentRect) {
  const rect = element.getBoundingClientRect();
  return { left: rect.left - parentRect.left, top: rect.top - parentRect.top, width: rect.width, height: rect.height };
}

function prepareNoCoordinates() {
  if (noCoordinateReady) return;
  const arenaRect = loveArena.getBoundingClientRect();
  const position = relativeRect(loveNo, arenaRect);
  loveNo.style.transition = "none";
  loveNo.style.left = "0px";
  loveNo.style.top = "0px";
  loveNo.style.bottom = "auto";
  loveNo.style.transform = `translate3d(${position.left}px,${position.top}px,0)`;
  loveNo.getBoundingClientRect();
  loveNo.style.transition = "";
  lastNoPosition = position;
  noCoordinateReady = true;
}

function overlaps(rect, target, padding = 14) {
  return rect.left < target.left + target.width + padding && rect.left + rect.width + padding > target.left && rect.top < target.top + target.height + padding && rect.top + rect.height + padding > target.top;
}

function dodgeNoButton() {
  if (loveCheckpointComplete) return;
  prepareNoCoordinates();
  const arenaRect = loveArena.getBoundingClientRect();
  const yesRect = relativeRect(loveYes, arenaRect);
  const buttonRect = relativeRect(loveNo, arenaRect);
  const padding = Math.max(8, Math.min(18, arenaRect.width * .05));
  const maxX = Math.max(padding, arenaRect.width - buttonRect.width - padding);
  const maxY = Math.max(padding, arenaRect.height - buttonRect.height - padding);
  let next = null;

  for (let attempt = 0; attempt < 36; attempt++) {
    const candidate = {
      left: padding + Math.random() * (maxX - padding),
      top: padding + Math.random() * (maxY - padding),
      width: buttonRect.width,
      height: buttonRect.height
    };
    const farEnough = !lastNoPosition || Math.hypot(candidate.left - lastNoPosition.left, candidate.top - lastNoPosition.top) > Math.min(58, arenaRect.width * .23);
    if (!overlaps(candidate, yesRect) && farEnough) { next = candidate; break; }
  }
  next ||= { left: padding, top: padding, width: buttonRect.width, height: buttonRect.height };
  const rotation = Math.round(-8 + Math.random() * 16);
  loveNo.style.transform = `translate3d(${next.left}px,${next.top}px,0) rotate(${rotation}deg)`;
  loveNo.classList.remove("is-dodging");
  requestAnimationFrame(() => loveNo.classList.add("is-dodging"));
  lastNoPosition = next;
  noAttempts++;
  const reactions = ["nice try 😭", "nope 🎀", "still trying? 😭", "there is literally another button..."];
  loveReaction.textContent = reactions[Math.min(noAttempts - 1, reactions.length - 1)];
}

function unlockMemorySky() {
  memorySky.classList.remove("is-locked");
  memorySky.setAttribute("aria-hidden", "false");
  memorySky.removeAttribute("inert");
}

function routeToLoveCheckpoint(event) {
  if (loveCheckpointComplete) return;
  event?.preventDefault();
  if (location.hash !== "#loveCheckpoint") history.replaceState(null, "", "#loveCheckpoint");
  if (!experience.classList.contains("is-hidden")) loveCheckpoint.scrollIntoView({ behavior: "smooth", block: "start" });
  loveCheckpoint.classList.remove("needs-attention");
  requestAnimationFrame(() => loveCheckpoint.classList.add("needs-attention"));
}

function guardCheckpointHash() {
  if (!loveCheckpointComplete && /#(?:memorySky|finale)$/i.test(location.hash)) routeToLoveCheckpoint();
}

loveNo.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse") dodgeNoButton();
});
loveNo.addEventListener("pointerdown", (event) => {
  if (loveCheckpointComplete) return;
  event.preventDefault();
  lastNoPointerTime = performance.now();
  dodgeNoButton();
});
loveNo.addEventListener("click", (event) => {
  if (loveCheckpointComplete) return;
  event.preventDefault();
  if (performance.now() - lastNoPointerTime > 450) dodgeNoButton();
});
loveNo.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  dodgeNoButton();
});

loveYes.addEventListener("click", () => {
  if (loveCheckpointComplete) return;
  loveCheckpointComplete = true;
  loveNo.disabled = true;
  loveCheckpoint.classList.add("is-complete");
  unlockMemorySky();
  loveSuccess.classList.remove("is-hidden");
  playMotionNow(loveSuccess);
  buildLoveConfetti();
  window.setTimeout(() => $("#loveContinue")?.focus({ preventScroll: true }), 420);
});

$("#loveContinue").addEventListener("click", () => {
  if (loveCheckpointComplete) memorySky.scrollIntoView({ behavior: "smooth", block: "start" });
});

$$('a[href="#memorySky"],a[href="#finale"]').forEach((link) => link.addEventListener("click", routeToLoveCheckpoint));
window.addEventListener("hashchange", guardCheckpointHash);
requestAnimationFrame(guardCheckpointHash);

function buildLoveConfetti() {
  if (loveConfetti.children.length) return;
  const colors = ["#f8e089", "#8fbba9", "#fff5e6", "#d66f8e", "#ef9c77", "#b9aed3"];
  for (let i = 0; i < 38; i++) {
    const piece = document.createElement("i");
    piece.style.left = `${18 + Math.random() * 64}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty("--love-duration", `${1.35 + Math.random() * .85}s`);
    piece.style.setProperty("--love-delay", `${Math.random() * .18}s`);
    piece.style.setProperty("--love-drift", `${-130 + Math.random() * 260}px`);
    piece.style.setProperty("--love-rise", `${80 + Math.random() * 155}px`);
    piece.style.setProperty("--love-rotate", `${-200 + Math.random() * 400}deg`);
    loveConfetti.appendChild(piece);
  }
  window.setTimeout(() => { loveConfetti.textContent = ""; }, 2500);
}

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
  [".gate-paper", "reveal-paper", .04], [".scribble", "reveal-text-line", .36],
  [".gate h1,.gate-copy", "reveal-text-line", .48], [".gate-form", "reveal-paper", .64]
]);
registerReveals("#opening", [
  [".opening-note", "reveal-paper", .05], [".tape-b", "reveal-tape", .2],
  [".opening-note p", "reveal-text-line", .32]
]);
registerReveals("#hero", [
  [".favourite-label", "reveal-paper", .08], [".hero-title", "reveal-text-line", .92],
  [".hero-date", "reveal-stamp", 1.08]
]);
registerReveals("#music", [
  [".music-card", "reveal-paper", .16],
  [".tape-c", "reveal-tape", .42], [".music-card .hand-label", "reveal-text-line", .52]
]);
registerReveals("#jokes", [
  [".eyebrow,.jokes-section h2", "reveal-paper", .03], [".sticky-one", "reveal-slide-left", .22],
  [".sticky-two", "reveal-slide-right", .37]
]);
registerReveals("#memories", [
  [".memory-heading", "reveal-paper", .18], [".letter", "reveal-paper", .05],
  [".tape-e", "reveal-tape", .34], [".letter-stamp", "reveal-stamp", .46],
  [".letter p", "reveal-text-line", .58], [".letter-signoff", "reveal-text-line", .78]
]);
registerReveals("#photos", [
  [".photos-heading", "reveal-paper", .05],
  [".polaroid", "reveal-polaroid", .32], [".photo-tape", "reveal-tape", .58],
  [".scratch-note", "reveal-text-line", .72]
]);
registerReveals("#giftTease", [
  [".tease-card", "reveal-paper", .08]
]);
registerReveals("#surprise", [
  [".surprise-note", "reveal-paper", .06], [".sixteen-reveal h2", "reveal-scale-settle", .58]
]);
registerReveals("#goodThings", [
  [".good-things>.hand-label,.good-things>h2", "reveal-paper", .04], [".good-list article", "reveal-paper", .24],
  [".missing-numbers", "reveal-text-line", .88], [".you-card", "reveal-scale-settle", 1.02]
]);
registerReveals("#twist", [
  [".twist-card", "reveal-paper", .08], [".ribbon-button", "reveal-tape", .32],
  [".gift-reveal", "reveal-paper", .02]
]);
registerReveals("#loveCheckpoint", [
  [".love-card", "reveal-paper", .06], [".love-card h2", "reveal-scale-settle", .48], [".love-yes", "reveal-paper", .62],
  [".love-no", "reveal-paper", .74], [".love-success", "reveal-paper", .04],
  ["#loveContinue", "reveal-text-line", .48]
]);
registerReveals("#memorySky", [[".sky-content", "reveal-scale-settle", .18]]);
registerReveals("#finale", [
  [".final-paper", "reveal-paper", .08],
  [".final-paper h2,.final-sign", "reveal-text-line", .62]
]);
registerReveals("#notes", [
  [".notes-paper", "reveal-paper", .08], [".notes-paper h2,.notes-intro", "reveal-text-line", .28]
]);

function playMotionNow(root) {
  if (!root) return;
  root.classList.add("is-inview");
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
  $$("#hero,#music,#jokes,#memories,#photos,#giftTease,#surprise,#goodThings,#twist,#loveCheckpoint,#memorySky,#finale,#notes").forEach((section) => sectionObserver.observe(section));
} else {
  $$(".reveal").forEach((element) => element.classList.add("is-inview"));
}
