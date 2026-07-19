const finePointer = window.matchMedia('(pointer: fine)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const canvas = document.querySelector('#petal-canvas');
const context = canvas.getContext('2d');
const cursorFlower = document.querySelector('.cursor-flower');
const petals = [];
const palette = ['#d4768e', '#e39aad', '#efb7c4', '#c86682', '#f4ccd4'];
let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;
let frame = 0;
let lastPointer = { x: viewportWidth / 2, y: viewportHeight / 2 };
let lastTrail = { ...lastPointer };

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

class Petal {
  constructor(x, y, mode = 'ambient') {
    this.x = x;
    this.y = y;
    this.mode = mode;
    this.size = mode === 'trail' ? 4 + Math.random() * 4 : 6 + Math.random() * 7;
    this.vx = (Math.random() - .5) * (mode === 'trail' ? 1.8 : .7);
    this.vy = mode === 'trail' ? .8 + Math.random() * 1.2 : .45 + Math.random() * .75;
    this.gravity = mode === 'trail' ? .035 : .004;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - .5) * .055;
    this.sway = Math.random() * Math.PI * 2;
    this.swaySpeed = .018 + Math.random() * .025;
    this.opacity = mode === 'trail' ? .92 : .38 + Math.random() * .34;
    this.life = mode === 'trail' ? 115 : 2000;
    this.color = palette[Math.floor(Math.random() * palette.length)];
  }

  update() {
    this.sway += this.swaySpeed;
    this.vy += this.gravity;
    this.x += this.vx + Math.sin(this.sway) * .55;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
    this.life -= 1;
    if (this.mode === 'trail' && this.life < 42) this.opacity *= .94;
  }

  draw() {
    context.save();
    context.translate(this.x, this.y);
    context.rotate(this.rotation);
    context.globalAlpha = Math.max(this.opacity, 0);
    context.fillStyle = this.color;
    context.beginPath();
    context.moveTo(0, -this.size);
    context.bezierCurveTo(this.size * .95, -this.size * .45, this.size * .72, this.size * .65, 0, this.size);
    context.bezierCurveTo(-this.size * .7, this.size * .55, -this.size * .9, -this.size * .4, 0, -this.size);
    context.fill();
    context.strokeStyle = 'rgba(118,55,82,.22)';
    context.lineWidth = .65;
    context.beginPath();
    context.moveTo(0, -this.size * .72);
    context.quadraticCurveTo(this.size * .1, 0, 0, this.size * .72);
    context.stroke();
    context.restore();
  }

  get expired() {
    return this.life <= 0 || this.y > viewportHeight + 40 || this.x < -80 || this.x > viewportWidth + 80;
  }
}

const spawnAmbientPetal = (initial = false) => {
  petals.push(new Petal(Math.random() * viewportWidth, initial ? Math.random() * viewportHeight : -24));
};

const spawnTrailPetals = (x, y, count = 2) => {
  for (let index = 0; index < count; index += 1) {
    petals.push(new Petal(x + Math.random() * 12 - 6, y + Math.random() * 9 - 4, 'trail'));
  }
  if (petals.length > 125) petals.splice(0, petals.length - 125);
};

const animatePetals = () => {
  context.clearRect(0, 0, viewportWidth, viewportHeight);
  frame += 1;
  if (frame % 20 === 0) spawnAmbientPetal();
  for (let index = petals.length - 1; index >= 0; index -= 1) {
    const petal = petals[index];
    petal.update();
    petal.draw();
    if (petal.expired) petals.splice(index, 1);
  }
  window.requestAnimationFrame(animatePetals);
};

if (finePointer.matches && !reducedMotion.matches) {
  resizeCanvas();
  for (let index = 0; index < 22; index += 1) spawnAmbientPetal(true);
  animatePetals();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('pointermove', (event) => {
    lastPointer = { x: event.clientX, y: event.clientY };
    cursorFlower.style.opacity = '1';
    cursorFlower.style.transform = `translate(${lastPointer.x - 12}px, ${lastPointer.y - 12}px)`;
    const distance = Math.hypot(lastPointer.x - lastTrail.x, lastPointer.y - lastTrail.y);
    if (distance > 13) {
      spawnTrailPetals(lastPointer.x, lastPointer.y, Math.min(3, Math.ceil(distance / 24)));
      lastTrail = { ...lastPointer };
    }
  }, { passive: true });
  document.querySelectorAll('a, button, summary, .interactive-card').forEach((target) => {
    target.addEventListener('pointerenter', () => cursorFlower.classList.add('active'));
    target.addEventListener('pointerleave', () => cursorFlower.classList.remove('active'));
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
    if (finePointer.matches && !reducedMotion.matches) {
      const box = card.getBoundingClientRect();
      spawnTrailPetals(box.left + box.width / 2, box.top + box.height / 2, 12);
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
