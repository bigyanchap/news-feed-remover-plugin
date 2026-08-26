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

    if (wrap.parentElement !== parent) {
      parent.prepend(wrap);
    }
  }

  function removePlaceholder() {
    document.getElementById(PLACEHOLDER_WRAP_ID)?.remove();
  }

  async function refresh() {
    const settings = await getSettings();
    setHiding(shouldHide(settings));
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
})();
