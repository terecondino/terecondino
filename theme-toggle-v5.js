const themeToggle = document.querySelector('.portrait-toggle');
const themeLabel = themeToggle.querySelector('[data-theme-label]');
const storageKey = 'teresa-portfolio-theme';

const applyTheme = (dark, save = true) => {
  document.body.classList.toggle('dark-mode', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  themeLabel.textContent = dark ? 'Light mode' : 'Dark mode';

  if (save) {
    try { window.localStorage.setItem(storageKey, dark ? 'dark' : 'light'); } catch (_) { /* Storage may be unavailable in private browsing. */ }
  }

  window.dispatchEvent(new CustomEvent('portfolio-theme-change', { detail: { dark } }));
};

let savedTheme = 'light';
try { savedTheme = window.localStorage.getItem(storageKey) || 'light'; } catch (_) { /* Keep the light default. */ }
applyTheme(savedTheme === 'dark', false);

themeToggle.addEventListener('click', () => {
  applyTheme(!document.body.classList.contains('dark-mode'));
});
