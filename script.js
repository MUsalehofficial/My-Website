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
  { threshold: 0 },
);

document.querySelectorAll(".reveal").forEach((section) => observer.observe(section));

/** Reveal sections jumped to via #hash often show <20% in view under the fixed nav, so the
 *  observer never fires. Keep threshold at 0 and force-visible the hash target after scroll. */
const markRevealVisible = (el) => {
  let node = el;
  while (node && node !== document.body) {
    if (node.classList?.contains("reveal")) {
      node.classList.add("visible");
    }
    node = node.parentElement;
  }
};

const syncHashReveal = () => {
  const id = window.location.hash.slice(1);
  if (id) {
    markRevealVisible(document.getElementById(id));
  }
};

const navSpyAnchors = Array.from(document.querySelectorAll('.nav-list a[href^="#"]'));
const spySectionIds = navSpyAnchors
  .map((link) => link.getAttribute("href")?.slice(1) ?? "")
  .filter(Boolean);

const setActiveNavLink = (activeId) => {
  navSpyAnchors.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
  });
};

/** Matches `scroll-padding-top` — where #anchors align — not necessarily where headings read as “entered”. */
const spyAnchorLinePx = () => {
  const raw = getComputedStyle(document.documentElement).scrollPaddingTop;
  const parsed = parseFloat(raw);
  if (Number.isFinite(parsed) && parsed > 4) return Math.round(parsed);
  const header = document.querySelector(".site-header");
  const fallback =
    typeof header?.getBoundingClientRect === "function"
      ? header.getBoundingClientRect().bottom + 14
      : 96;
  return Math.round(fallback);
};

/** Lower bound in the viewport before the next section “counts”: accounts for padding gaps and prior-section tails. */
const spyActivationPx = () => {
  const anchor = spyAnchorLinePx();
  const vh = window.innerHeight;
  const band = Math.min(300, Math.max(112, Math.round(vh * 0.34)));
  return anchor + band;
};

/** Locks highlight after anchor navigation until scrolling settles. */
let manualNavId = null;
let manualCapUntil = 0;
let manualCapTimer = 0;
let scrollSettleTimer = 0;

const releaseManualNav = () => {
  manualNavId = null;
  manualCapUntil = 0;
  window.clearTimeout(manualCapTimer);
  manualCapTimer = 0;
  window.clearTimeout(scrollSettleTimer);
  scrollSettleTimer = 0;
};

const armManualNav = (id) => {
  if (!id || !spySectionIds.includes(id)) return;
  manualNavId = id;
  manualCapUntil = performance.now() + 2600;
  setActiveNavLink(id);
  window.clearTimeout(manualCapTimer);
  manualCapTimer = window.setTimeout(() => {
    manualCapTimer = 0;
    releaseManualNav();
    updateNavSpy();
  }, 2600);
};

/**
 * Latest section whose top has entered the viewport activation band (~upper third below the anchor
 * line). Anchor line alone misses real transitions because section tops sit below padded headers and
 * the previous section’s visible tail.
 */
const pickSpySectionId = () => {
  const docEl = document.documentElement;
  const scrollY = window.scrollY || docEl.scrollTop;
  const bottomSlack = Math.min(72, Math.max(24, Math.round(docEl.scrollHeight * 0.022)));
  if (
    spySectionIds.length > 0 &&
    scrollY + window.innerHeight >= docEl.scrollHeight - bottomSlack
  ) {
    return spySectionIds[spySectionIds.length - 1];
  }

  const triggerPx = spyActivationPx();
  let activeId = spySectionIds[0] ?? "home";
  const eps = 2;
  for (const id of spySectionIds) {
    const el = document.getElementById(id);
    if (!el) continue;
    const top = el.getBoundingClientRect().top;
    if (top <= triggerPx + eps) activeId = id;
  }
  return activeId;
};

const updateNavSpy = () => {
  const now = performance.now();
  if (manualNavId && now < manualCapUntil) {
    setActiveNavLink(manualNavId);
    return;
  }
  manualNavId = null;

  setActiveNavLink(pickSpySectionId());
};

let navSpyRaf = 0;
const scheduleNavSpy = () => {
  if (navSpyRaf) return;
  navSpyRaf = window.requestAnimationFrame(() => {
    navSpyRaf = 0;
    updateNavSpy();
  });
};

const SCROLL_SETTLE_MS = 480;

const bumpScrollSettleRelease = () => {
  if (!manualNavId) return;
  window.clearTimeout(scrollSettleTimer);
  scrollSettleTimer = window.setTimeout(() => {
    scrollSettleTimer = 0;
    releaseManualNav();
    updateNavSpy();
  }, SCROLL_SETTLE_MS);
};

const settleAfterProgrammaticScroll = () => {
  if (!manualNavId) return;
  releaseManualNav();
  updateNavSpy();
};

/** Align with CSS scroll snapping: anchor top + scroll-margin lands at html scroll-padding. */
const scrollSectionIntoViewAligned = (el, smooth = true) => {
  if (!el) return;
  el.scrollIntoView({
    behavior: smooth ? "smooth" : "auto",
    block: "start",
    inline: "nearest",
  });
};

window.addEventListener(
  "scroll",
  () => {
    scheduleNavSpy();
    bumpScrollSettleRelease();
  },
  { passive: true },
);

window.addEventListener("resize", updateNavSpy);

if ("onscrollend" in window) {
  window.addEventListener("scrollend", settleAfterProgrammaticScroll, { passive: true });
}

window.addEventListener("hashchange", () => {
  syncHashReveal();
  const id = window.location.hash.slice(1);
  const el = id ? document.getElementById(id) : null;
  if (el) {
    scrollSectionIntoViewAligned(el, true);
    if (spySectionIds.includes(id)) armManualNav(id);
  }
  scheduleNavSpy();
});

window.addEventListener("load", () => {
  const id = window.location.hash.slice(1);
  const el = id ? document.getElementById(id) : null;
  if (el) scrollSectionIntoViewAligned(el, false);
  syncHashReveal();
  if (id && spySectionIds.includes(id)) armManualNav(id);
  scheduleNavSpy();
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (!href || href === "#" || href.length < 2) return;
    const sid = href.slice(1);
    const target = document.getElementById(sid);
    if (!target) return;

    e.preventDefault();
    window.history.replaceState(null, "", `#${sid}`);

    if (spySectionIds.includes(sid)) {
      armManualNav(sid);
      bumpScrollSettleRelease();
    }

    scrollSectionIntoViewAligned(target, true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => markRevealVisible(target));
    });
  });
});

updateNavSpy();

const credlyContainer = document.getElementById("credlyBadges");

const renderCredlyBadges = (data) => {
  if (!credlyContainer) return;

  const badges = data?.badges ?? [];
  if (badges.length === 0) {
    credlyContainer.innerHTML =
      '<p class="credly-status" role="status">No public badges found.</p>';
    return;
  }

  credlyContainer.replaceChildren(
    ...badges.map((badge) => {
      const link = document.createElement("a");
      link.className = "credly-badge";
      link.href = badge.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("role", "listitem");
      link.title = `View ${badge.name} on Credly`;

      const img = document.createElement("img");
      img.src = badge.imageUrl;
      img.alt = `${badge.name} badge`;
      img.width = 96;
      img.height = 96;
      img.loading = "lazy";
      img.decoding = "async";

      const name = document.createElement("span");
      name.className = "credly-badge-name";
      name.textContent = badge.name;

      const issuer = document.createElement("span");
      issuer.className = "credly-badge-issuer";
      issuer.textContent = badge.issuer;

      link.append(img, name, issuer);
      return link;
    }),
  );
};

const loadCredlyBadges = async () => {
  if (!credlyContainer) return;

  try {
    const res = await fetch("./assets/data/credly-badges.json", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    renderCredlyBadges(await res.json());
  } catch {
    credlyContainer.innerHTML =
      '<p class="credly-status" role="status">Could not load badges. <a class="credly-profile-link" href="https://www.credly.com/users/musalehofficial" target="_blank" rel="noopener noreferrer">View on Credly</a></p>';
  }
};

loadCredlyBadges();
