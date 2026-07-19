const finePointer = window.matchMedia('(pointer: fine)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const canvas = document.querySelector('#season-canvas');
const context = canvas.getContext('2d');
const cursorSeason = document.querySelector('.cursor-season');
const particles = [];
let mode = document.body.classList.contains('dark-mode') ? 'snow' : 'petal';
let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;
let frame = 0;
let lastTrail = { x: viewportWidth / 2, y: viewportHeight / 2 };

const resizeCanvas = () => {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  viewportWidth = window.innerWidth;
  viewportHeight = window.innerHeight;
  canvas.width = Math.round(viewportWidth * ratio);
  canvas.height = Math.round(viewportHeight * ratio);
  canvas.style.width = `${viewportWidth}px`;
  canvas.style.height = `${viewportHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
};

class SeasonalParticle {
  constructor(x, y, kind = mode, trail = false) {
    this.x = x;
    this.y = y;
    this.kind = kind;
    this.trail = trail;
    this.size = trail ? 3 + Math.random() * 4 : 3.5 + Math.random() * 6;
    this.vx = (Math.random() - .5) * (trail ? 1.7 : .6);
    this.vy = trail ? .85 + Math.random() * 1.5 : .38 + Math.random() * .8;
    this.gravity = trail ? .028 : .003;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - .5) * .045;
    this.sway = Math.random() * Math.PI * 2;
    this.swaySpeed = .014 + Math.random() * .027;
    this.opacity = trail ? .92 : .4 + Math.random() * .38;
    this.life = trail ? 130 : 2300;
    this.crystal = this.size > 6 || Math.random() > .78;
  }

  update() {
    this.sway += this.swaySpeed;
    this.vy += this.gravity;
    this.x += this.vx + Math.sin(this.sway) * (this.kind === 'petal' ? .5 : .38);
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
    this.life -= 1;
    if (this.trail && this.life < 44) this.opacity *= .94;
  }

  drawPetal() {
    context.globalAlpha = Math.max(this.opacity, 0);
    context.fillStyle = this.trail ? '#d4778f' : '#e7a1b2';
    context.strokeStyle = 'rgba(116,53,80,.24)';
    context.lineWidth = .55;
    context.beginPath();
    context.moveTo(0, -this.size);
    context.bezierCurveTo(this.size * .95, -this.size * .45, this.size * .72, this.size * .65, 0, this.size);
    context.bezierCurveTo(-this.size * .7, this.size * .55, -this.size * .9, -this.size * .4, 0, -this.size);
    context.fill();
    context.stroke();
  }

  drawSnow() {
    context.shadowColor = 'rgba(88,135,160,.55)';
    context.shadowBlur = this.size;
    if (!this.crystal) {
      context.globalAlpha = Math.max(this.opacity, 0);
      context.fillStyle = '#f7fcff';
      context.strokeStyle = 'rgba(99,151,179,.48)';
      context.lineWidth = .5;
      context.beginPath();
      context.arc(0, 0, this.size * .6, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      return;
    }
    context.strokeStyle = `rgba(225,246,255,${this.opacity})`;
    context.lineWidth = Math.max(.65, this.size * .12);
    for (let arm = 0; arm < 6; arm += 1) {
      context.rotate(Math.PI / 3);
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(0, -this.size);
      context.moveTo(0, -this.size * .58);
      context.lineTo(-this.size * .24, -this.size * .78);
      context.moveTo(0, -this.size * .58);
      context.lineTo(this.size * .24, -this.size * .78);
      context.stroke();
    }
  }

  draw() {
    context.save();
    context.translate(this.x, this.y);
    context.rotate(this.rotation);
    if (this.kind === 'petal') this.drawPetal(); else this.drawSnow();
    context.restore();
  }

  get expired() {
    return this.life <= 0 || this.y > viewportHeight + 45 || this.x < -75 || this.x > viewportWidth + 75;
  }
}

const spawnAmbient = (initial = false) => {
  particles.push(new SeasonalParticle(Math.random() * viewportWidth, initial ? Math.random() * viewportHeight : -20));
};

const spawnTrail = (x, y, kind, count) => {
  for (let index = 0; index < count; index += 1) {
    particles.push(new SeasonalParticle(x + Math.random() * 15 - 7, y + Math.random() * 10 - 5, kind, true));
  }
  if (particles.length > 145) particles.splice(0, particles.length - 145);
};
const spawnPetalTrail = (x, y, count = 3) => spawnTrail(x, y, 'petal', count);
const spawnSnowTrail = (x, y, count = 3) => spawnTrail(x, y, 'snow', count);

const resetSeason = (dark) => {
  mode = dark ? 'snow' : 'petal';
  particles.length = 0;
  for (let index = 0; index < 30; index += 1) spawnAmbient(true);
};

const animateSeason = () => {
  context.clearRect(0, 0, viewportWidth, viewportHeight);
  frame += 1;
  if (frame % 17 === 0) spawnAmbient();
  for (let index = particles.length - 1; index >= 0; index -= 1) {
    const particle = particles[index];
    particle.update();
    particle.draw();
    if (particle.expired) particles.splice(index, 1);
  }
  window.requestAnimationFrame(animateSeason);
};

if (!reducedMotion.matches) {
  resizeCanvas();
  resetSeason(mode === 'snow');
  animateSeason();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('portfolio-theme-change', (event) => resetSeason(event.detail.dark));
}

if (finePointer.matches && !reducedMotion.matches) {
  window.addEventListener('pointermove', (event) => {
    cursorSeason.style.opacity = '1';
    cursorSeason.style.transform = `translate(${event.clientX - 15}px, ${event.clientY - 15}px)`;
    const distance = Math.hypot(event.clientX - lastTrail.x, event.clientY - lastTrail.y);
    if (distance > 12) {
      if (mode === 'snow') spawnSnowTrail(event.clientX, event.clientY, Math.min(4, Math.ceil(distance / 20)));
      else spawnPetalTrail(event.clientX, event.clientY, Math.min(4, Math.ceil(distance / 20)));
      lastTrail = { x: event.clientX, y: event.clientY };
    }
  }, { passive: true });
  document.querySelectorAll('a, button, summary, .interactive-card').forEach((target) => {
    target.addEventListener('pointerenter', () => cursorSeason.classList.add('active'));
    target.addEventListener('pointerleave', () => cursorSeason.classList.remove('active'));
  });
}

document.querySelectorAll('[data-magnetic]').forEach((target) => {
  target.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || reducedMotion.matches) return;
    const box = target.getBoundingClientRect();
    target.style.transform = `translate(${(event.clientX - box.left - box.width / 2) * .1}px, ${(event.clientY - box.top - box.height / 2) * .1}px)`;
  });
  target.addEventListener('pointerleave', () => { target.style.transform = ''; });
});

document.querySelectorAll('[data-tilt]').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || reducedMotion.matches) return;
    const box = card.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width - .5;
    const py = (event.clientY - box.top) / box.height - .5;
    card.style.transform = `perspective(700px) rotateX(${-py * 4}deg) rotateY(${px * 4}deg) translateY(-4px)`;
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
});

document.querySelectorAll('.interactive-card').forEach((card) => {
  const activate = () => {
    const selected = card.classList.toggle('selected');
    card.setAttribute('aria-pressed', String(selected));
    if (!reducedMotion.matches) {
      const box = card.getBoundingClientRect();
      if (mode === 'snow') spawnSnowTrail(box.left + box.width / 2, box.top + box.height / 2, 15);
      else spawnPetalTrail(box.left + box.width / 2, box.top + box.height / 2, 15);
    }
  };
  card.addEventListener('click', activate);
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate();
    }
  });
});

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) {
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
