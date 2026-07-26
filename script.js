/* =========================================================
   Utilidades generales
   ========================================================= */
function $(id){ return document.getElementById(id); }

function goTo(sceneId){
  document.querySelectorAll('.scene').forEach(s => s.dataset.active = "false");
  $(sceneId).dataset.active = "true";
}

function typewriter(el, text, speed, onDone){
  el.textContent = "";
  let i = 0;
  const timer = setInterval(() => {
    el.textContent += text.charAt(i);
    i++;
    if(i >= text.length){
      clearInterval(timer);
      if(onDone) onDone();
    }
  }, speed);
  return timer;
}

/* =========================================================
   Fondo de estrellas persistente
   ========================================================= */
const bgCanvas = $("bgStars");
const bgCtx = bgCanvas.getContext("2d");
let bgStarsArr = [];

function sizeCanvas(canvas){
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  canvas.getContext("2d").setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

function buildBgStars(){
  const count = Math.floor((window.innerWidth * window.innerHeight) / 6000);
  bgStarsArr = [];
  for(let i = 0; i < count; i++){
    bgStarsArr.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.01
    });
  }
}

function drawBgStars(t){
  bgCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  bgStarsArr.forEach(s => {
    const twinkle = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
    bgCtx.beginPath();
    bgCtx.fillStyle = `rgba(253,248,243,${0.25 + twinkle * 0.55})`;
    bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    bgCtx.fill();
  });
  requestAnimationFrame(drawBgStars);
}

sizeCanvas(bgCanvas);
buildBgStars();
requestAnimationFrame(drawBgStars);

/* =========================================================
   Escena 1 — Formación del corazón de estrellas
   ========================================================= */
const heartCanvas = $("heartCanvas");
const heartCtx = heartCanvas.getContext("2d");
let particles = [];
let formationStart = null;
let formationDone = false;
const FORM_DURATION = 2200;

function heartPoint(t, scale, cx, cy){
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x: cx + x * scale, y: cy - y * scale };
}

function buildParticles(){
  sizeCanvas(heartCanvas);
  const w = window.innerWidth, h = window.innerHeight;
  const cx = w / 2, cy = h / 2 + h * 0.02;
  const scale = Math.min(w, h) / 24;
  const N = 130;
  particles = [];
  for(let i = 0; i < N; i++){
    const t = (i / N) * Math.PI * 2;
    const target = heartPoint(t, scale, cx, cy);
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      startX: Math.random() * w,
      startY: Math.random() * h,
      tx: target.x,
      ty: target.y,
      size: Math.random() * 1.6 + 1
    });
  }
}

function easeOutCubic(x){ return 1 - Math.pow(1 - x, 3); }

function drawHeartFill(cx, cy, scale, pulseScale, alpha){
  heartCtx.save();
  heartCtx.translate(cx, cy);
  heartCtx.scale(pulseScale, pulseScale);
  heartCtx.translate(-cx, -cy);
  heartCtx.beginPath();
  for(let i = 0; i <= 100; i++){
    const t = (i / 100) * Math.PI * 2;
    const p = heartPoint(t, scale, cx, cy);
    if(i === 0) heartCtx.moveTo(p.x, p.y);
    else heartCtx.lineTo(p.x, p.y);
  }
  heartCtx.closePath();
  const grad = heartCtx.createRadialGradient(cx, cy - scale * 4, scale * 2, cx, cy, scale * 16);
  grad.addColorStop(0, `rgba(255,120,150,${alpha})`);
  grad.addColorStop(1, `rgba(179,18,58,${alpha})`);
  heartCtx.fillStyle = grad;
  heartCtx.shadowColor = "rgba(255,77,109,0.65)";
  heartCtx.shadowBlur = 40;
  heartCtx.fill();
  heartCtx.restore();
}

function animateFormation(ts){
  if(!formationStart) formationStart = ts;
  const elapsed = ts - formationStart;
  const w = window.innerWidth, h = window.innerHeight;
  heartCtx.clearRect(0, 0, w, h);

  const rawProgress = Math.min(elapsed / FORM_DURATION, 1);
  const progress = easeOutCubic(rawProgress);

  particles.forEach(p => {
    const x = p.startX + (p.tx - p.startX) * progress;
    const y = p.startY + (p.ty - p.startY) * progress;
    heartCtx.beginPath();
    heartCtx.fillStyle = `rgba(253,248,243,${0.55 + progress * 0.45})`;
    heartCtx.shadowColor = "rgba(244,201,220,0.8)";
    heartCtx.shadowBlur = 6;
    heartCtx.arc(x, y, p.size, 0, Math.PI * 2);
    heartCtx.fill();
  });

  if(rawProgress >= 1){
    if(!formationDone){
      formationDone = true;
      beatStart = ts;
    }
    const cx = w / 2, cy = h / 2 + h * 0.02;
    const scale = Math.min(w, h) / 24;
    const beatElapsed = (ts - beatStart) / 1000;
    const pulse = 1 + Math.sin(beatElapsed * Math.PI * 1.7) * 0.06;
    drawHeartFill(cx, cy, scale, pulse, 0.92);
  }

  requestAnimationFrame(animateFormation);
}

let beatStart = null;

function startFormationScene(){
  formationStart = null;
  formationDone = false;
  buildParticles();
  requestAnimationFrame(animateFormation);

  $("typeline1").textContent = "";
  $("typeline2").textContent = "";

  setTimeout(() => {
    typewriter($("typeline1"), "Hay personas que llegan a tu vida y la cambian sin darse cuenta...", 42, () => {
      setTimeout(() => {
        typewriter($("typeline2"), "Tú eres una de ellas, Jesuhanys.", 48, () => {
          setTimeout(startLetterScene, 1900);
        });
      }, 700);
    });
  }, 900);
}

/* =========================================================
   Escena 2 — La carta
   ========================================================= */
const LETTER_TEXT =
`Si estás leyendo esto, significa que todo salió bien y que logré sorprenderte un poquito.

Quería hacerte un regalo diferente. No algo que pudiera comprar, sino algo que pudiera crear con mi tiempo, mi esfuerzo y muchísimo cariño.

Sé que últimamente no hemos podido vernos tanto como quisiéramos. Entre mi universidad y tus alergias, a veces la distancia pesa un poco más de lo que nos gustaría. Pero hay algo que no cambia, y es lo mucho que significas para mí.

Cada estrella, cada animación y cada línea de esta página fueron hechas pensando en ti. Tal vez para alguien más solo sea una página web, pero para mí es una forma de decirte que, incluso cuando no estoy a tu lado, siempre estás presente en mis pensamientos.

Gracias por hacer mis días más bonitos, por acompañarme, por hacerme sonreír y por ser tú.

Espero que muy pronto podamos abrazarnos, reír juntos y crear muchos más recuerdos.

Te amo, Jesuhanys.
Y lo seguiré haciendo, sin importar cuántos kilómetros o días nos separen. ❤️`;

let letterTimer = null;
let letterTypingDone = false;

function startLetterScene(){
  goTo("scene-letter");
  const body = $("letterBody");
  const caret = $("letterCaret");
  const skipBtn = $("skipBtn");
  letterTypingDone = false;
  skipBtn.textContent = "saltar ✦";
  caret.classList.remove("hidden");

  letterTimer = typewriter(body, LETTER_TEXT, 16, () => {
    letterTypingDone = true;
    caret.classList.add("hidden");
    skipBtn.textContent = "continuar ✦";
  });
}

$("skipBtn").addEventListener("click", () => {
  if(!letterTypingDone){
    clearInterval(letterTimer);
    $("letterBody").textContent = LETTER_TEXT;
    letterTypingDone = true;
    $("letterCaret").classList.add("hidden");
    $("skipBtn").textContent = "continuar ✦";
  } else {
    startFinalScene();
  }
});

/* =========================================================
   Escena 3 — Cierre
   ========================================================= */
function buildHeartRain(){
  const container = $("heartRain");
  container.innerHTML = "";
  const symbols = ["❤️", "💕", "✨"];
  const count = 26;
  for(let i = 0; i < count; i++){
    const span = document.createElement("span");
    span.className = "falling-heart";
    span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    span.style.left = Math.random() * 100 + "%";
    const duration = 6 + Math.random() * 5;
    span.style.animationDuration = duration + "s";
    span.style.animationDelay = (-Math.random() * duration) + "s";
    span.style.fontSize = (0.9 + Math.random() * 1.1) + "rem";
    container.appendChild(span);
  }
}

function startFinalScene(){
  goTo("scene-final");
  buildHeartRain();
}

$("pressBtn").addEventListener("click", () => {
  $("surpriseMsg").classList.add("show");
  $("finalHeart").classList.add("fast");
});

/* =========================================================
   Arranque
   ========================================================= */
$("openBtn").addEventListener("click", () => {
  goTo("scene-formation");
  startFormationScene();
});

window.addEventListener("resize", () => {
  sizeCanvas(bgCanvas);
  buildBgStars();
  if(document.querySelector('.scene[data-active="true"]').id === "scene-formation"){
    buildParticles();
  }
});

window.addEventListener("orientationchange", () => {
  setTimeout(() => {
    sizeCanvas(bgCanvas);
    buildBgStars();
  }, 300);
});
