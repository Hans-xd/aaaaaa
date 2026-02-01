const arena   = document.getElementById("arena");
const yesBtn  = document.getElementById("yesBtn");
const noBtn   = document.getElementById("noBtn");
const hint    = document.getElementById("hint");
const counter = document.getElementById("counter");
const silly   = document.getElementById("silly");

const overlay   = document.getElementById("overlay");
const overlayNo = document.getElementById("overlayNo");
const closeBtn  = document.getElementById("closeBtn");
const backBtn   = document.getElementById("backBtn");
const realNoBtn = document.getElementById("realNo");

// ✅ declara esto arriba (antes de usarlo)
const respectP = document.getElementById("respectP");

const confettiCanvas = document.getElementById("confetti");
const ctx = confettiCanvas.getContext("2d");

let noTries = 0;
let yesScale = 1;
let noScale  = 1;

// ✅ para animar SOLO la primera vez que aparece
let respectShown = false;

const noPhrases = [
  "¿Oye por qué le pones al NO? 😭",
  "El botón NO se puso nervioso…",
  "NO.exe dejó de responder",
  "Eso fue un accidente… ¿cierto? 👀",
  "El NO se achica como mi valentía",
  "¿De verdad querías apretar NO? sospechoso",
  "Plot twist: el NO es un girasol tímido 🌻",
  "Se te resbaló el dedo (obvio)",
  "NO está en modo avión ✈️",
  "El NO dijo: ‘me da cosita’"
];

const hintPhrases = [
  "Pista: el ‘NO’ se arranca.",
  "Pista: el ‘SÍ’ es el camino de ti junto a mí.",
  "Pista: si apretas NO, se pone chiquitito.",
  "Pista: te juro que esto será hermoso 🌻"
];

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function resizeCanvas(){
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function arenaRect(){
  return arena.getBoundingClientRect();
}

function moveNoButton(){
  const r = arenaRect();
  const pad = 14;

  const bw = noBtn.offsetWidth;
  const bh = noBtn.offsetHeight;

  const maxX = r.width  - bw - pad;
  const maxY = r.height - bh - pad;

  const x = Math.random() * clamp(maxX, 0, maxX) + pad/2;
  const y = Math.random() * clamp(maxY, 0, maxY) + pad/2;

  noBtn.style.position = "absolute";
  noBtn.style.left = `${x}px`;
  noBtn.style.top  = `${y}px`;
}

function updateUI(){
  counter.textContent = `Intentos de NO: ${noTries}`;
  silly.textContent = `Estado: ${noPhrases[noTries % noPhrases.length]}`;
  hint.textContent  = hintPhrases[noTries % hintPhrases.length];

  yesBtn.style.transform = `scale(${yesScale})`;
  noBtn.style.transform  = `scale(${noScale})`;

  // ✅ Mostrar después de 10 NO (y sirve para hover/touch/click)
  const shouldShow = noTries >= 10;
  respectP.hidden = !shouldShow;

  if (shouldShow && !respectShown) {
    respectShown = true;
    respectP.classList.add("pop");
    // quita la clase después para que se pueda re-animar si quieres
    setTimeout(() => respectP.classList.remove("pop"), 350);
  }
}

function trollNo(){
  noTries++;

  yesScale = clamp(1 + noTries * 0.08, 1, 2.1);
  noScale  = clamp(1 - noTries * 0.07, 0.35, 1);

  if (noTries === 3) noBtn.textContent = "NO (pero… 😳)";
  if (noTries === 5) noBtn.textContent = "NO (ya me cansé)";
  if (noTries === 7) noBtn.textContent = "NO (soy mini)";
  if (noTries >= 9)  noBtn.textContent = "NO (imposible)";

  moveNoButton();
  updateUI();

  if (navigator.vibrate) navigator.vibrate(40);
}

// ✅ hover PC
noBtn.addEventListener("mouseenter", trollNo);

// ✅ touch móvil (se arranca igual)
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  trollNo();
}, { passive:false });

// ✅ click (por si igual logran pillarlo)
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  trollNo();
});

yesBtn.addEventListener("click", () => {
  overlay.hidden = false;
  startConfetti();
});

closeBtn.addEventListener("click", () => {
  overlay.hidden = true;
  stopConfetti();
});

realNoBtn.addEventListener("click", () => {
  overlayNo.hidden = false;
});

backBtn.addEventListener("click", () => {
  overlayNo.hidden = true;
});

// inicial
overlay.hidden = true;
overlayNo.hidden = true;
updateUI();

/* =========================
   Confetti simple (canvas)
========================= */
let pieces = [];
let animId = null;

function rand(min, max){ return Math.random() * (max - min) + min; }

function makePieces(){
  const colors = ["#ff4f9a", "#ff86b6", "#ffd6ea", "#ffcf4a", "#7a4a2a", "#ffffff"];
  const count = 140;

  pieces = Array.from({length: count}, () => ({
    x: rand(0, confettiCanvas.width),
    y: rand(-confettiCanvas.height, 0),
    w: rand(6, 12),
    h: rand(8, 16),
    vx: rand(-1.2, 1.2),
    vy: rand(2.2, 4.6),
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.08, 0.08),
    c: colors[Math.floor(Math.random() * colors.length)],
    o: rand(0.6, 1)
  }));
}

function draw(){
  ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);

  for (const p of pieces){
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;

    if (p.y > confettiCanvas.height + 30){
      p.y = rand(-200, -20);
      p.x = rand(0, confettiCanvas.width);
    }
    if (p.x < -30) p.x = confettiCanvas.width + 30;
    if (p.x > confettiCanvas.width + 30) p.x = -30;

    ctx.save();
    ctx.globalAlpha = p.o;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.c;
    ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
    ctx.restore();
  }

  animId = requestAnimationFrame(draw);
}

function startConfetti(){
  resizeCanvas();
  makePieces();
  if (animId) cancelAnimationFrame(animId);
  draw();
}

function stopConfetti(){
  if (animId) cancelAnimationFrame(animId);
  animId = null;
  ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
}
