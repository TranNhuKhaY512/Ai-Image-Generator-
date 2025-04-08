// Lấy theme từ localStorage hoặc hệ thống
export function getInitialTheme() {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return savedTheme === "dark" || (!savedTheme && systemPrefersDark) ? "dark" : "light";
}

// Áp dụng theme
export function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
  localStorage.setItem("theme", theme);
}

// Toggle theme
export function toggleTheme(currentTheme) {
  const newTheme = currentTheme === "light" ? "dark" : "light";
  applyTheme(newTheme);
  return newTheme;
} 