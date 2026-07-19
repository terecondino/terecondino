const themeToggle = document.querySelector('.portrait-toggle');
const themeLabel = themeToggle.querySelector('[data-theme-label]');
const brandLogo = document.querySelector('#brand-logo');
const siteIcon = document.querySelector('#site-icon');
const appleIcon = document.querySelector('#apple-icon');
const storageKey = 'teresa-portfolio-theme';

const applyTheme = (dark, save = true) => {
  document.body.classList.toggle('dark-mode', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', dark ? 'Switch to light petal mode' : 'Switch to dark snow mode');
  themeLabel.textContent = dark ? 'Light · Petals' : 'Dark · Snow';
  brandLogo.src = dark ? 'snow-mark.svg' : 'brand-mark.svg';
  siteIcon.href = dark ? 'snow-mark.svg' : 'brand-mark.svg';
  appleIcon.href = dark ? 'snow-touch-icon.png' : 'apple-touch-icon.png';

  if (save) {
    try { window.localStorage.setItem(storageKey, dark ? 'dark' : 'light'); } catch (_) { /* Storage can be unavailable. */ }
  }
  window.dispatchEvent(new CustomEvent('portfolio-theme-change', { detail: { dark } }));
};

let savedTheme = 'light';
try { savedTheme = window.localStorage.getItem(storageKey) || 'light'; } catch (_) { /* Keep the light default. */ }
applyTheme(savedTheme === 'dark', false);

themeToggle.addEventListener('click', () => {
  applyTheme(!document.body.classList.contains('dark-mode'));
});
