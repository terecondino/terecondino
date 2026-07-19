const finePointer = window.matchMedia('(pointer: fine)');
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');

if (finePointer.matches) {
  let x = 0, y = 0, rx = 0, ry = 0;
  window.addEventListener('pointermove', (event) => {
    x = event.clientX; y = event.clientY;
    dot.style.opacity = ring.style.opacity = '1';
    dot.style.transform = `translate(${x - 3}px, ${y - 3}px)`;
  });
  const follow = () => {
    rx += (x - rx) * .16; ry += (y - ry) * .16;
    ring.style.transform = `translate(${rx - 17}px, ${ry - 17}px)`;
    requestAnimationFrame(follow);
  };
  follow();
  document.querySelectorAll('a, button, summary, [data-tilt]').forEach((target) => {
    target.addEventListener('pointerenter', () => ring.classList.add('active'));
    target.addEventListener('pointerleave', () => ring.classList.remove('active'));
  });
  document.querySelectorAll('[data-magnetic]').forEach((target) => {
    target.addEventListener('pointermove', (event) => {
      const box = target.getBoundingClientRect();
      target.style.transform = `translate(${(event.clientX-box.left-box.width/2)*.12}px, ${(event.clientY-box.top-box.height/2)*.12}px)`;
    });
    target.addEventListener('pointerleave', () => target.style.transform = '');
  });
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const box = card.getBoundingClientRect();
      const px = (event.clientX-box.left)/box.width-.5, py = (event.clientY-box.top)/box.height-.5;
      card.style.transform = `perspective(700px) rotateX(${-py*4}deg) rotateY(${px*4}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });
}

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
