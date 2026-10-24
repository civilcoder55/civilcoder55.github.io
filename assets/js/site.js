(() => {
  "use strict";

  const COPY_RESET_MS = 2000;

  // Copy buttons render hidden so they never appear without JavaScript.
  const initCopyButtons = () => {
    if (!navigator.clipboard) return;

    for (const button of document.querySelectorAll(".code__copy")) {
      // With line numbers in a table, the first <pre><code> holds the numbers.
      const code = [
        ...(button.closest(".code")?.querySelectorAll("pre code") ?? []),
      ].pop();
      if (!code) continue;

      button.hidden = false;
      let resetTimer;

      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(
            code.textContent.replace(/\n$/, ""),
          );
          button.textContent = "Copied";
        } catch {
          button.textContent = "Press Ctrl+C";
        }
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          button.textContent = "Copy";
        }, COPY_RESET_MS);
      });
    }
  };

  // Marks the table-of-contents entry for the section being read.
  const initTocHighlight = () => {
    const links = [...document.querySelectorAll(".toc a[href^='#']")];
    if (links.length === 0 || !("IntersectionObserver" in window)) return;

    const ids = [
      ...new Set(links.map((link) => decodeURIComponent(link.hash.slice(1)))),
    ];
    const headings = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const visible = new Set();

    const setActive = (id) => {
      for (const link of links) {
        const active = decodeURIComponent(link.hash.slice(1)) === id;
        link.classList.toggle("is-active", active);
        if (active) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target);
          } else {
            visible.delete(entry.target);
          }
        }
        // Topmost visible heading wins; otherwise keep the last one scrolled past.
        const current =
          headings.find((heading) => visible.has(heading)) ??
          headings
            .filter((heading) => heading.getBoundingClientRect().top < 0)
            .pop();
        if (current) setActive(current.id);
      },
      { rootMargin: "0px 0px -70% 0px" },
    );

    for (const heading of headings) {
      observer.observe(heading);
    }
  };

  const init = () => {
    initCopyButtons();
    initTocHighlight();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
