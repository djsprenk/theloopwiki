const userPref = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
const currentTheme = localStorage.getItem("theme") ?? userPref;
document.documentElement.setAttribute("saved-theme", currentTheme);

const syncBodyThemeClass = (theme: "light" | "dark") => {
  document.body?.classList.remove("theme-dark", "theme-light");
  document.body?.classList.add(`theme-${theme}`);
};

const emitThemeChangeEvent = (theme: "light" | "dark") => {
  const event: CustomEventMap["themechange"] = new CustomEvent("themechange", {
    detail: { theme },
  });
  document.dispatchEvent(event);
};

let mediaQueryBound = false;

const setupDarkmode = () => {
  // Sync body class with current theme on setup (runs after DOM is ready)
  const currentSavedTheme =
    (document.documentElement.getAttribute("saved-theme") as "light" | "dark") ?? "light";
  syncBodyThemeClass(currentSavedTheme);

  const switchTheme = () => {
    const newTheme =
      document.documentElement.getAttribute("saved-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("saved-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    syncBodyThemeClass(newTheme);
    emitThemeChangeEvent(newTheme);
  };

  const themeChange = (e: MediaQueryListEvent) => {
    const newTheme = e.matches ? "dark" : "light";
    document.documentElement.setAttribute("saved-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    syncBodyThemeClass(newTheme);
    emitThemeChangeEvent(newTheme);
  };

  // This button is part of the persistent header/toolbar shell, so it isn't
  // recreated on every "nav"/"render" event. Quartz's router only clears old
  // listeners (window.addCleanup) ahead of a real navigation, but some
  // components (e.g. encrypted-pages, after a successful decrypt) dispatch a
  // bare "render" event outside of a navigation - without this guard, a
  // second click listener stacks on top of the first and a tap ends up
  // switching the theme twice, i.e. doing nothing.
  for (const darkmodeButton of document.getElementsByClassName("darkmode")) {
    if (darkmodeButton.dataset.darkmodeBound === "true") continue;
    darkmodeButton.dataset.darkmodeBound = "true";

    darkmodeButton.addEventListener("click", switchTheme);
    window.addCleanup(() => {
      darkmodeButton.removeEventListener("click", switchTheme);
      delete darkmodeButton.dataset.darkmodeBound;
    });
  }

  // Listen for changes in prefers-color-scheme. Same rebinding hazard as
  // above, but there's no persistent DOM element to hang a dataset flag off
  // of, so gate on a module-level flag instead - this script instance only
  // needs the media query listener bound once for its whole lifetime.
  if (!mediaQueryBound) {
    mediaQueryBound = true;
    const colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    colorSchemeMediaQuery.addEventListener("change", themeChange);
    window.addCleanup(() => {
      colorSchemeMediaQuery.removeEventListener("change", themeChange);
      mediaQueryBound = false;
    });
  }
};

document.addEventListener("nav", setupDarkmode);
document.addEventListener("render", setupDarkmode);
