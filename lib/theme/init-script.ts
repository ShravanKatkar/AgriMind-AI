/** Blocking theme script for root layout (Server Component safe — not inside client tree). */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var storageKey = 'theme';
    var defaultTheme = 'system';
    var theme = localStorage.getItem(storageKey) || defaultTheme;
    var resolved =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark'
        : 'light';
    var root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.style.colorScheme = resolved;
  } catch (e) {}
})();
`.trim()
