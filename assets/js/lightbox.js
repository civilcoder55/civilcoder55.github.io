(() => {
  "use strict";

  const YOUTUBE_PATTERN =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})(?:\S+)?$/;
  const IMAGE_PATTERN = /\.(?:jpe?g|png|gif|webp|avif)(?:[?#].*)?$/i;
  const OPT_OUT_CLASS = "no-lightbox";

  let lightbox;
  // The link that opened the lightbox, so focus can return to it on close.
  let trigger = null;

  const youtubeId = (url) => url.match(YOUTUBE_PATTERN)?.[1] ?? null;

  const isImageLink = (url) => IMAGE_PATTERN.test(url);

  // "/images/journey/auth-1_hu_3f9c.webp" -> "auth-1" (drops Hugo's hash suffix)
  const nameFromUrl = (url) =>
    url
      .split(/[?#]/)[0]
      .split("/")
      .pop()
      .split(".")[0]
      .replace(/_hu_[0-9a-f]+$/, "");

  const createElement = (tag, attributes = {}, children = []) => {
    const element = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
    element.append(...children);
    return element;
  };

  const controls = () => [
    createElement("button", {
      id: "close",
      type: "button",
      "aria-label": "Close",
    }),
    createElement(
      "button",
      { id: "next", type: "button", "aria-label": "Next image" },
      ["\u203A"],
    ),
    createElement(
      "button",
      { id: "prev", type: "button", "aria-label": "Previous image" },
      ["\u2039"],
    ),
  ];

  const isOpen = () => lightbox.style.display === "block";

  const videoFrame = (src) =>
    createElement("div", { class: "videoWrapperContainer" }, [
      createElement("div", { class: "videoWrapper" }, [
        createElement("iframe", {
          src,
          allow: "autoplay; fullscreen",
          allowfullscreen: "",
        }),
      ]),
    ]);

  const imageFrame = (href, title) => {
    const frame = createElement("div", { class: "img", title }, [
      createElement("img", { src: href, alt: title }),
    ]);
    // The visible image is a background so it scales with `contain`; the
    // hidden <img> gives the frame its intrinsic size.
    frame.style.background = `url("${href.replace(/["\\]/g, "\\$&")}") center center / contain no-repeat`;
    return [frame, createElement("span", {}, [title])];
  };

  const open = (link, content) => {
    trigger = link;
    lightbox.replaceChildren(...controls(), ...content);
    lightbox.style.display = "block";
    setGallery(link);
    lightbox.querySelector("#close").focus({ preventScroll: true });
  };

  const close = () => {
    if (!isOpen()) return;
    lightbox.replaceChildren();
    lightbox.style.display = "none";
    trigger?.focus({ preventScroll: true });
    trigger = null;
  };

  // Tab stays on the visible controls while the lightbox is open.
  const trapFocus = (event) => {
    const focusable = [...lightbox.querySelectorAll("button")].filter(
      // offsetParent is always null for these fixed-position buttons.
      (button) => button.getClientRects().length > 0,
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const onKeydown = (event) => {
    if (!isOpen()) return;

    const inGallery = lightbox.classList.contains("gallery");
    if (event.key === "Escape") {
      close();
    } else if (event.key === "ArrowRight" && inGallery) {
      lightbox.querySelector("#next").click();
    } else if (event.key === "ArrowLeft" && inGallery) {
      lightbox.querySelector("#prev").click();
    } else if (event.key === "Tab") {
      trapFocus(event);
    }
  };

  // Links sharing a paragraph or list form a gallery with prev/next controls.
  const setGallery = (link) => {
    for (const element of document.body.querySelectorAll(".gallery")) {
      element.classList.remove("gallery");
    }

    const group = link.closest("ul, p");
    if (!group) return;

    const members = [...group.querySelectorAll("a[class*='lightbox-']")];
    for (const member of members) {
      member.classList.toggle(
        "current",
        member.getAttribute("href") === link.getAttribute("href"),
      );
    }

    if (members.length < 2) return;

    lightbox.classList.add("gallery");
    for (const member of members) {
      member.classList.add("gallery");
    }

    const current = members.findIndex((member) =>
      member.classList.contains("current"),
    );
    if (current === -1) return;

    const step = (offset) => () =>
      members[(current + offset + members.length) % members.length].click();
    lightbox.querySelector("#next").addEventListener("click", step(1));
    lightbox.querySelector("#prev").addEventListener("click", step(-1));
  };

  const bindVimeo = async (link, url) => {
    try {
      const response = await fetch(
        `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
      );
      if (!response.ok) return;

      const { video_id: id } = await response.json();
      if (!id) return;

      link.classList.add("lightbox-vimeo");
      link.dataset.id = id;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        open(link, [
          videoFrame(
            `https://player.vimeo.com/video/${id}/?autoplay=1&byline=0&title=0&portrait=0`,
          ),
        ]);
      });
    } catch {
      // Leave the link as a plain link if Vimeo can't be reached.
    }
  };

  const bindYoutube = (link, id) => {
    link.classList.add("lightbox-youtube");
    link.dataset.id = id;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      open(link, [
        videoFrame(
          `https://www.youtube.com/embed/${id}?autoplay=1&showinfo=0&rel=0`,
        ),
      ]);
    });
  };

  const bindImage = (link, href) => {
    link.classList.add("lightbox-image");
    link.title = link.querySelector("img")?.alt || nameFromUrl(href);
    link.addEventListener("click", (event) => {
      event.preventDefault();
      open(link, imageFrame(href, link.title));
    });
  };

  const init = () => {
    lightbox = createElement("div", {
      id: "lightbox",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Image viewer",
    });
    document.body.append(lightbox);
    document.addEventListener("keydown", onKeydown);

    lightbox.addEventListener("click", (event) => {
      if (event.target.id !== "next" && event.target.id !== "prev") close();
    });

    for (const link of document.querySelectorAll("a[href]")) {
      if (link.classList.contains(OPT_OUT_CLASS)) continue;

      const href = link.getAttribute("href");
      const videoId = youtubeId(href);

      if (href.includes("vimeo")) bindVimeo(link, href);
      if (videoId) bindYoutube(link, videoId);
      if (isImageLink(href) || link.classList.contains("lightbox-image")) {
        bindImage(link, href);
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
