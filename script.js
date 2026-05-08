const root = document.body;
const themeToggle = document.getElementById("themeToggle");
const currentYear = document.getElementById("year");

const setTheme = (theme) => {
  if (theme === "light") {
    root.classList.add("light");
    themeToggle.textContent = "☀️";
  } else {
    root.classList.remove("light");
    themeToggle.textContent = "🌙";
  }
  localStorage.setItem("theme", theme);
};

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  setTheme(savedTheme);
}

themeToggle.addEventListener("click", () => {
  const isLight = root.classList.contains("light");
  setTheme(isLight ? "dark" : "light");
});

currentYear.textContent = new Date().getFullYear();

const observer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 },
);

document.querySelectorAll(".reveal").forEach((section) => observer.observe(section));
