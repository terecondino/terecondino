const finePointer = window.matchMedia('(pointer: fine)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const canvas = document.querySelector('#snow-canvas');
const context = canvas.getContext('2d');
const cursorSnowflake = document.querySelector('.cursor-snowflake');
const snowflakes = [];
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

class Snowflake {
  constructor(x, y, mode = 'ambient') {
    this.x = x;
    this.y = y;
    this.mode = mode;
    this.size = mode === 'trail' ? 2.2 + Math.random() * 3.8 : 2.2 + Math.random() * 5.8;
    this.vx = (Math.random() - .5) * (mode === 'trail' ? 1.65 : .45);
    this.vy = mode === 'trail' ? 1 + Math.random() * 1.7 : .38 + Math.random() * .72;
    this.gravity = mode === 'trail' ? .025 : .002;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - .5) * .035;
    this.sway = Math.random() * Math.PI * 2;
    this.swaySpeed = .012 + Math.random() * .024;
    this.opacity = mode === 'trail' ? .92 : .38 + Math.random() * .44;
    this.life = mode === 'trail' ? 135 : 2400;
    this.crystal = this.size > 5.2 || Math.random() > .74;
  }

  update() {
    this.sway += this.swaySpeed;
    this.vy += this.gravity;
    this.x += this.vx + Math.sin(this.sway) * .42;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
    this.life -= 1;
    if (this.mode === 'trail' && this.life < 45) this.opacity *= .94;
  }

  drawCrystal() {
    context.strokeStyle = `rgba(222,244,255,${this.opacity})`;
    context.lineWidth = Math.max(.65, this.size * .13);
    for (let arm = 0; arm < 6; arm += 1) {
      context.rotate(Math.PI / 3);
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(0, -this.size);
      context.moveTo(0, -this.size * .58);
      context.lineTo(-this.size * .25, -this.size * .78);
      context.moveTo(0, -this.size * .58);
      context.lineTo(this.size * .25, -this.size * .78);
      context.stroke();
    }
  }

  draw() {
    context.save();
    context.translate(this.x, this.y);
    context.rotate(this.rotation);
    context.shadowColor = 'rgba(89,132,157,.55)';
    context.shadowBlur = this.size * 1.15;
    if (this.crystal) {
      this.drawCrystal();
    } else {
      context.globalAlpha = Math.max(this.opacity, 0);
      context.fillStyle = '#f5fbff';
      context.strokeStyle = 'rgba(104,153,180,.5)';
      context.lineWidth = .55;
      context.beginPath();
      context.arc(0, 0, this.size * .62, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    }
    context.restore();
  }

  get expired() {
    return this.life <= 0 || this.y > viewportHeight + 40 || this.x < -70 || this.x > viewportWidth + 70;
  }
}

const spawnAmbientSnow = (initial = false) => {
  snowflakes.push(new Snowflake(Math.random() * viewportWidth, initial ? Math.random() * viewportHeight : -18));
};

const spawnSnowTrail = (x, y, count = 3) => {
  for (let index = 0; index < count; index += 1) {
    snowflakes.push(new Snowflake(x + Math.random() * 15 - 7, y + Math.random() * 10 - 5, 'trail'));
  }
  if (snowflakes.length > 145) snowflakes.splice(0, snowflakes.length - 145);
};

const animateSnow = () => {
  context.clearRect(0, 0, viewportWidth, viewportHeight);
  frame += 1;
  if (frame % 16 === 0) spawnAmbientSnow();
  for (let index = snowflakes.length - 1; index >= 0; index -= 1) {
    const flake = snowflakes[index];
    flake.update();
    flake.draw();
    if (flake.expired) snowflakes.splice(index, 1);
  }
  window.requestAnimationFrame(animateSnow);
};

if (!reducedMotion.matches) {
  resizeCanvas();
  for (let index = 0; index < 32; index += 1) spawnAmbientSnow(true);
  animateSnow();
  window.addEventListener('resize', resizeCanvas);
}

if (finePointer.matches && !reducedMotion.matches) {
  window.addEventListener('pointermove', (event) => {
    lastPointer = { x: event.clientX, y: event.clientY };
    cursorSnowflake.style.opacity = '1';
    cursorSnowflake.style.transform = `translate(${lastPointer.x - 14}px, ${lastPointer.y - 14}px)`;
    const distance = Math.hypot(lastPointer.x - lastTrail.x, lastPointer.y - lastTrail.y);
    if (distance > 12) {
      spawnSnowTrail(lastPointer.x, lastPointer.y, Math.min(4, Math.ceil(distance / 20)));
      lastTrail = { ...lastPointer };
    }
  }, { passive: true });
  document.querySelectorAll('a, button, summary, .interactive-card').forEach((target) => {
    target.addEventListener('pointerenter', () => cursorSnowflake.classList.add('active'));
    target.addEventListener('pointerleave', () => cursorSnowflake.classList.remove('active'));
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
      spawnSnowTrail(box.left + box.width / 2, box.top + box.height / 2, 15);
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
