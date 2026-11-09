(() => {
  const siteId = nfrDetectSite();
  if (!siteId) return;

  const site = NFR_SITES[siteId];
  const html = document.documentElement;
  const STYLE_ID = "nfr-injected-css";
  const PLACEHOLDER_ID = "nfr-placeholder";
  const PLACEHOLDER_WRAP_ID = "nfr-placeholder-wrap";

  function wrapCss(css) {
    const body = css
      .trim()
      .split("}")
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => {
        const [selectors, ...rest] = block.split("{");
        const rules = rest.join("{").trim();
        const prefixed = selectors
          .split(",")
          .map((sel) => sel.trim())
          .filter(Boolean)
          .flatMap((sel) => [`html.nfr-pending ${sel}`, `html.nfr-active ${sel}`])
          .join(",\n");
        return `${prefixed} {\n        ${rules}\n      }`;
      })
      .join("\n\n");

    return `${body}

      #${PLACEHOLDER_WRAP_ID} {
        display: none;
        box-sizing: border-box;
        width: 100%;
        padding: calc(var(--ytd-masthead-height, 56px) + 48px) 16px 32px !important;
        overflow: visible !important;
      }

      #${PLACEHOLDER_ID} {
        box-sizing: border-box;
        width: 100%;
        max-width: 440px;
        margin: 0 auto !important;
        padding: 28px 24px !important;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: inherit;
        border: 1px dashed color-mix(in srgb, currentColor 28%, transparent);
        border-radius: 16px;
        background: color-mix(in srgb, currentColor 4%, transparent);
      }

      html.nfr-pending ytd-browse[page-subtype="home"],
      html.nfr-active ytd-browse[page-subtype="home"] {
        overflow: visible !important;
      }

      html.nfr-pending #${PLACEHOLDER_WRAP_ID},
      html.nfr-active #${PLACEHOLDER_WRAP_ID} {
        display: block !important;
      }

      html.nfr-pending #${PLACEHOLDER_ID},
      html.nfr-active #${PLACEHOLDER_ID} {
        display: flex !important;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      #${PLACEHOLDER_ID} .nfr-kicker {
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        opacity: 0.6;
        font-weight: 600;
      }

      #${PLACEHOLDER_ID} .nfr-title {
        font-size: 20px;
        font-weight: 700;
        line-height: 1.3;
        margin: 0;
      }

      #${PLACEHOLDER_ID} .nfr-body {
        font-size: 14px;
        line-height: 1.5;
        opacity: 0.72;
        margin: 0;
      }

      #${PLACEHOLDER_WRAP_ID}.nfr-wall {
        padding: 16px 12px 4px !important;
        position: relative !important;
      }

      .nfr-block {
        box-sizing: border-box;
        width: 100%;
        max-width: 680px;
        min-height: 320px;
        margin: 0 auto 16px !important;
        padding: 32px 28px !important;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #1c1e21;
        border: 2px dashed rgba(120, 135, 160, 0.65);
        border-radius: 16px;
        background: rgba(120, 135, 160, 0.14);
      }

      @media (prefers-color-scheme: dark) {
        .nfr-block {
          color: #f0f2f5;
          border-color: rgba(160, 178, 205, 0.7);
          background: rgba(160, 178, 205, 0.16);
        }
      }

      .nfr-block .nfr-kicker {
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        opacity: 0.75;
        font-weight: 600;
      }

      .nfr-block .nfr-title {
        font-size: 28px;
        font-weight: 700;
        line-height: 1.3;
        margin: 0;
      }

      .nfr-block .nfr-body {
        font-size: 16px;
        line-height: 1.5;
        opacity: 0.85;
        margin: 0;
      }
    `;
  }

  function injectStyles() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      (document.head || html).appendChild(style);
    }
    style.textContent = wrapCss(site.css);
  }

  function getSettings() {
    return new Promise((resolve) => {
      try {
        chrome.storage.sync.get({ settings: NFR_DEFAULTS }, (data) => {
          resolve({ ...NFR_DEFAULTS, ...(data && data.settings) });
        });
      } catch (_err) {
        resolve({ ...NFR_DEFAULTS });
      }
    });
  }

  function shouldHide(settings) {
    return Boolean(settings[siteId]) && site.isTargetPage();
  }

  function setHiding(on) {
    html.classList.toggle("nfr-active", on);
    html.classList.remove("nfr-pending");
    if (on) {
      ensurePlaceholder();
    } else {
      removePlaceholder();
    }
  }

  function ensurePlaceholder() {
    if (!site.placeholderParent) return;
    const parent = site.placeholderParent();
    if (!parent) return;

    let wrap = document.getElementById(PLACEHOLDER_WRAP_ID);
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = PLACEHOLDER_WRAP_ID;
      wrap.setAttribute("data-nfr", "placeholder-wrap");

      if (Array.isArray(site.placeholderBlocks) && site.placeholderBlocks.length) {
        // Wall mode (Facebook): a stack of big reminder blocks in front of
        // the feed instead of one small placeholder card. The feed itself
        // stays in the page, below the wall.
        wrap.classList.add("nfr-wall");
        for (const block of site.placeholderBlocks) {
          const node = document.createElement("div");
          node.className = "nfr-block";
          node.setAttribute("data-nfr", "goal-block");
          node.innerHTML = `
            <div class="nfr-kicker">${block.kicker}</div>
            <p class="nfr-title">${block.title}</p>
            <p class="nfr-body">${block.body}</p>
          `;
          wrap.appendChild(node);
        }
      } else {
        const node = document.createElement("div");
        node.id = PLACEHOLDER_ID;
        node.setAttribute("data-nfr", "placeholder");
        node.innerHTML = `
          <div class="nfr-kicker">News Feed Remover</div>
          <p class="nfr-title">${site.title}</p>
          <p class="nfr-body">${site.body}</p>
        `;
        wrap.appendChild(node);
      }
    }

    let placed = false;
    if (typeof site.placeholderSeed === "function") {
      const column = findColumnFor(site.placeholderSeed());
      if (column) {
        if (wrap.parentElement !== column || column.firstElementChild !== wrap) {
          column.prepend(wrap);
        }
        placed = true;
      }
    }

    if (!placed) {
      const anchor =
        typeof site.placeholderAnchor === "function" ? site.placeholderAnchor() : null;
      if (anchor && anchor.parentElement) {
        if (wrap.parentElement !== anchor.parentElement || wrap.nextSibling !== anchor) {
          anchor.parentElement.insertBefore(wrap, anchor);
        }
      } else if (wrap.parentElement !== parent) {
        parent.prepend(wrap);
      }
    }
  }

  // Walk up from a landmark inside a site's centre column until reaching
  // the element that IS the column: a few hundred pixels wide, with a
  // much wider parent (the page row). Returns null while the page layout
  // has not settled yet — the self-heal check retries every second.
  function findColumnFor(seed) {
    let node = seed;
    while (node && node.parentElement) {
      const width = node.getBoundingClientRect().width;
      const parentWidth = node.parentElement.getBoundingClientRect().width;
      if (width >= 380 && width <= 920 && parentWidth > width + 200) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  function removePlaceholder() {
    document.getElementById(PLACEHOLDER_WRAP_ID)?.remove();
  }

  let siteEnabled = false;

  async function refresh() {
    const settings = await getSettings();
    siteEnabled = Boolean(settings[siteId]);
    setHiding(shouldHide(settings));
  }

  // YouTube ads are never blocked, hidden, or fast-forwarded. The ad is
  // left to play its part, and the moment YouTube itself offers the Skip
  // button, it is clicked automatically.
  const SKIP_BUTTON_SELECTORS = [
    ".ytp-skip-ad-button",
    ".ytp-ad-skip-button-modern",
    ".ytp-ad-skip-button",
    "button.ytp-skip-ad-button",
    ".ytp-skip-ad button",
    "button[id^='skip-button']",
  ];

  function trySkipYouTubeAd() {
    if (siteId !== "youtube" || !siteEnabled) return;
    for (const selector of SKIP_BUTTON_SELECTORS) {
      for (const button of document.querySelectorAll(selector)) {
        if (button.getClientRects().length) {
          button.click();
          return;
        }
      }
    }
  }

  injectStyles();
  if (site.isTargetPage()) {
    html.classList.add("nfr-pending");
  }

  refresh();

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.settings) {
      refresh();
    }
  });

  let lastUrl = location.href;
  const onUrlMaybeChanged = () => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    refresh();
  };

  if (window.navigation && typeof window.navigation.addEventListener === "function") {
    window.navigation.addEventListener("navigate", () => {
      setTimeout(onUrlMaybeChanged, 0);
    });
  }

  window.addEventListener("popstate", onUrlMaybeChanged);
  window.addEventListener("yt-navigate-finish", onUrlMaybeChanged);

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  history.pushState = function pushState(...args) {
    const result = originalPushState.apply(this, args);
    onUrlMaybeChanged();
    return result;
  };
  history.replaceState = function replaceState(...args) {
    const result = originalReplaceState.apply(this, args);
    onUrlMaybeChanged();
    return result;
  };

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      onUrlMaybeChanged();
      if (html.classList.contains("nfr-active")) {
        ensurePlaceholder();
      }
    });
  });

  const startObserver = () => {
    observer.observe(html, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver, { once: true });
  } else {
    startObserver();
  }

  setInterval(onUrlMaybeChanged, 800);

  // Self-heal: single-page apps (Facebook above all) re-render constantly
  // and can wipe injected nodes. While hiding is on, re-check once a
  // second and put the placeholder/wall back if it went missing.
  setInterval(() => {
    if (html.classList.contains("nfr-active")) {
      ensurePlaceholder();
    }
  }, 1000);

  if (siteId === "youtube") {
    setInterval(trySkipYouTubeAd, 500);
  }
})();
