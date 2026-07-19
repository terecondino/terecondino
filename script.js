const finePointer = window.matchMedia('(pointer: fine)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const cursorPetal = document.querySelector('.cursor-petal');

const spawnPetal = (x, y, ambient = false) => {
  if (reducedMotion.matches) return;
  const petal = document.createElement('span');
  petal.className = `petal-trail${ambient ? ' ambient-petal' : ''}`;
  petal.style.left = `${x}px`;
  petal.style.top = `${y}px`;
  petal.style.setProperty('--drift', `${Math.round(Math.random() * 70 - 35)}px`);
  petal.style.setProperty('--spin', `${Math.round(Math.random() * 240 + 120)}deg`);
  petal.style.setProperty('--scale', `${(Math.random() * .45 + .55).toFixed(2)}`);
  document.body.appendChild(petal);
  petal.addEventListener('animationend', () => petal.remove(), { once: true });
};

const petalBurst = (element) => {
  const box = element.getBoundingClientRect();
  for (let i = 0; i < 6; i += 1) {
    window.setTimeout(() => spawnPetal(
      box.left + box.width / 2 + Math.random() * 60 - 30,
      box.top + box.height / 2 + Math.random() * 24 - 12
    ), i * 45);
  }
};

if (finePointer.matches && !reducedMotion.matches) {
  let x = 0;
  let y = 0;
  let lastPetal = 0;

  window.addEventListener('pointermove', (event) => {
    x = event.clientX;
    y = event.clientY;
    cursorPetal.style.opacity = '1';
    cursorPetal.style.transform = `translate(${x - 7}px, ${y - 9}px) rotate(-32deg)`;

    if (performance.now() - lastPetal > 70) {
      spawnPetal(x - 3, y - 2);
      lastPetal = performance.now();
    }
  });

  document.querySelectorAll('a, button, summary, .interactive-card').forEach((target) => {
    target.addEventListener('pointerenter', () => cursorPetal.classList.add('active'));
    target.addEventListener('pointerleave', () => cursorPetal.classList.remove('active'));
  });

  document.querySelectorAll('[data-magnetic]').forEach((target) => {
    target.addEventListener('pointermove', (event) => {
      const box = target.getBoundingClientRect();
      target.style.transform = `translate(${(event.clientX - box.left - box.width / 2) * .12}px, ${(event.clientY - box.top - box.height / 2) * .12}px)`;
    });
    target.addEventListener('pointerleave', () => { target.style.transform = ''; });
  });

  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const box = card.getBoundingClientRect();
      const px = (event.clientX - box.left) / box.width - .5;
      const py = (event.clientY - box.top) / box.height - .5;
      card.style.transform = `perspective(700px) rotateX(${-py * 4}deg) rotateY(${px * 4}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  window.setInterval(() => {
    if (!document.hidden) spawnPetal(Math.random() * window.innerWidth, -20, true);
  }, 1100);
}

document.querySelectorAll('.interactive-card').forEach((card) => {
  const activate = () => {
    const selected = card.classList.toggle('selected');
    card.setAttribute('aria-pressed', String(selected));
    petalBurst(card);
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
