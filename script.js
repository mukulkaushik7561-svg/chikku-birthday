const $ = (selector) => document.querySelector(selector);
const gate = $('#gate'), opening = $('#opening'), site = $('#site'), passwordForm = $('#password-form');
const storyStates = {
  song: { required: true, completed: false, message: 'pssst... you missed something 🎵👀', target: '#music-toggle' },
  surprise: { required: true, completed: false, message: "waittt... you haven't seen the surprise yet 👀", target: '#reveal-surprise' },
  twist: { required: true, completed: false, message: 'heyyy... you missed something 🎀👀', target: '#twist-reveal' },
  'memory-sky': { required: true, completed: false, message: 'one last thing... 👀', target: '#final-button' }
};

function completeStoryStep(sectionId) {
  const state = storyStates[sectionId];
  if (!state) return;
  state.completed = true;
  document.querySelector(state.target)?.classList.remove('needs-attention');
}

function showStoryReminder(section, state) {
  let reminder = section.querySelector('.story-reminder');
  if (!reminder) {
    reminder = document.createElement('p');
    reminder.className = 'story-reminder';
    reminder.setAttribute('aria-live', 'polite');
    section.append(reminder);
  }
  reminder.textContent = state.message;
  reminder.classList.remove('is-visible');
  void reminder.offsetWidth;
  reminder.classList.add('is-visible');

  const target = section.querySelector(state.target);
  target?.classList.remove('needs-attention');
  void target?.offsetWidth;
  target?.classList.add('needs-attention');
}

passwordForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const error = $('#gate-error');
  if ($('#password').value === 'Bhuddu') {
    gate.classList.add('leave');
    setTimeout(() => { gate.hidden = true; opening.classList.remove('hidden'); opening.focus(); }, 480);
  } else {
    error.textContent = 'hehe, that is not the little secret word ✦';
    $('#password').select();
  }
});

let giftShown = false;
function showGift(event) {
  if (event.target.closest('#gift')) return;
  if (!giftShown) { giftShown = true; $('#gift').hidden = false; opening.classList.add('gift-is-here'); $('.tap-note').textContent = 'tap the gift!'; }
}
opening.addEventListener('click', showGift);
opening.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showGift(event); }
});
$('#gift').addEventListener('click', () => {
  const gift = $('#gift');
  gift.classList.add('opening-gift');
  burst(16);
  setTimeout(() => { opening.hidden = true; site.classList.remove('hidden'); $('#hero').scrollIntoView({behavior: 'smooth'}); }, 850);
});

$('#music-toggle').addEventListener('click', () => {
  const player = $('#spotify-player'), button = $('#music-toggle');
  const isHidden = player.hidden;
  player.hidden = !isHidden;
  button.setAttribute('aria-expanded', String(isHidden));
  button.innerHTML = isHidden ? '♫ <span>player is ready</span>' : '▶ <span>hide player</span>';
  completeStoryStep('song');
  if (isHidden) player.scrollIntoView({behavior:'smooth', block:'nearest'});
});

$('#reveal-surprise').addEventListener('click', () => {
  $('#surprise-popup').classList.add('pop-away');
  $('#reveal-surprise').hidden = true;
  completeStoryStep('surprise');
  setTimeout(() => { $('#turning').classList.remove('hidden'); burst(34); }, 360);
});
$('#twist-reveal').addEventListener('click', () => { $('#twist-answer').classList.remove('hidden'); $('#twist-reveal').hidden = true; completeStoryStep('twist'); burst(18); });
$('#final-button').addEventListener('click', () => { completeStoryStep('memory-sky'); site.hidden = true; const final = $('#final'); final.classList.remove('hidden'); final.focus(); burst(38); });

// Guided story navigation: only a true section-background tap advances the story.
// Controls and their contents are deliberately excluded so their normal behavior stays intact.
const storySections = Array.from(site.querySelectorAll('.section'));
const navigationCooldown = 850;
let navigationLocked = false;

storySections.slice(0, -1).forEach((section) => {
  const hint = document.createElement('span');
  hint.className = 'navigation-hint';
  hint.textContent = 'tap to continue ↓';
  hint.setAttribute('aria-hidden', 'true');
  section.append(hint);
});

function currentStorySection() {
  const viewportMiddle = window.scrollY + window.innerHeight / 2;
  return storySections.reduce((closest, section) => {
    const sectionMiddle = section.offsetTop + section.offsetHeight / 2;
    const closestMiddle = closest.offsetTop + closest.offsetHeight / 2;
    return Math.abs(sectionMiddle - viewportMiddle) < Math.abs(closestMiddle - viewportMiddle) ? section : closest;
  });
}

site.addEventListener('click', (event) => {
  const clickedSection = event.target.closest('.section');
  if (!clickedSection || navigationLocked) return;

  const interactiveTarget = event.target.closest('button, a, input, form, label, select, textarea, iframe, [role="button"], [contenteditable="true"]');
  if (interactiveTarget || event.target !== clickedSection || clickedSection !== currentStorySection()) return;

  const state = storyStates[clickedSection.id];
  if (state?.required && !state.completed) {
    showStoryReminder(clickedSection, state);
    return;
  }

  const nextSection = storySections[storySections.indexOf(clickedSection) + 1];
  if (!nextSection) return;

  navigationLocked = true;
  nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.setTimeout(() => { navigationLocked = false; }, navigationCooldown);
});

// A tiny desktop-only parallax layer gives selected decorations depth without a render loop.
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function setParallax(section, event, xName, yName, distance) {
  const bounds = section.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width - .5) * distance;
  const y = ((event.clientY - bounds.top) / bounds.height - .5) * distance;
  section.style.setProperty(xName, `${x.toFixed(2)}px`);
  section.style.setProperty(yName, `${y.toFixed(2)}px`);
}
if (finePointer.matches && !reducedMotion.matches) {
  const hero = $('#hero'), sky = $('#memory-sky'), final = $('#final');
  hero.addEventListener('pointermove', (event) => setParallax(hero, event, '--hero-x', '--hero-y', 14));
  sky.addEventListener('pointermove', (event) => setParallax(sky, event, '--sky-x', '--sky-y', 9));
  final.addEventListener('pointermove', (event) => setParallax(final, event, '--final-x', '--final-y', 12));
  [hero, sky, final].forEach((section) => section.addEventListener('pointerleave', () => {
    section.style.removeProperty(section === hero ? '--hero-x' : section === sky ? '--sky-x' : '--final-x');
    section.style.removeProperty(section === hero ? '--hero-y' : section === sky ? '--sky-y' : '--final-y');
  }));
}

function burst(amount) {
  const layer = $('.confetti-layer');
  for (let i = 0; i < amount; i++) { const bit = document.createElement('i'); bit.style.left = `${Math.random()*100}%`; bit.style.setProperty('--delay', `${Math.random()*.6}s`); bit.style.setProperty('--color', ['#ff769e','#ffd55c','#a98aed','#75d9d1','#ff9f65'][i % 5]); layer.append(bit); setTimeout(() => bit.remove(), 2400); }
}

const stars = $('.stars');
for (let i = 0; i < 38; i++) { const star = document.createElement('i'); star.style.left = `${Math.random()*100}%`; star.style.top = `${Math.random()*94}%`; star.style.animationDelay = `${Math.random()*3}s`; stars.append(star); }
