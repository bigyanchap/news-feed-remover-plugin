const NFR_DEFAULTS = {
  youtube: true,
  twitter: true,
  facebook: true,
  instagram: true,
  linkedin: true,
};

const NFR_SITES = {
  youtube: {
    hostIncludes: ["youtube.com"],
    css: `
      ytd-browse[page-subtype="home"] ytd-rich-grid-renderer,
      ytd-browse[page-subtype="home"] #contents.ytd-rich-grid-renderer,
      ytd-browse[page-subtype="home"] ytd-rich-grid-row,
      ytd-browse[page-subtype="home"] ytd-rich-item-renderer,
      ytd-browse[page-subtype="home"] ytd-rich-section-renderer,
      ytd-browse[page-subtype="home"] yt-chip-cloud-renderer,
      ytd-browse[page-subtype="home"] ytd-feed-filter-chip-bar-renderer,
      ytd-browse[page-subtype="trending"] ytd-two-column-browse-results-renderer,
      ytd-browse[page-subtype="trending"] #contents {
        display: none !important;
      }

      #related,
      #secondary ytd-watch-next-secondary-results-renderer,
      ytd-watch-flexy #secondary #related,
      #below ytd-watch-next-secondary-results-renderer,
      ytd-watch-next-secondary-results-renderer {
        display: none !important;
      }

      .html5-endscreen,
      .ytp-endscreen-content,
      .ytp-ce-element,
      .ytp-cards-teaser,
      .ytp-pause-overlay,
      .ytp-scroll-min,
      ytd-player .ytp-ce-covering-overlay,
      .ytp-fullscreen-grid {
        display: none !important;
      }

      ytd-reel-shelf-renderer,
      ytd-rich-shelf-renderer[is-shorts],
      ytd-browse[page-subtype="home"] ytd-rich-shelf-renderer {
        display: none !important;
      }
    `,
    isTargetPage() {
      return true;
    },
    placeholderParent() {
      const path = location.pathname;
      if (path === "/" || path === "") {
        return (
          document.querySelector("ytd-browse[page-subtype='home'] #primary") ||
          document.querySelector("ytd-browse[page-subtype='home'] ytd-two-column-browse-results-renderer") ||
          document.querySelector("ytd-browse[page-subtype='home']") ||
          document.querySelector("ytd-app #content") ||
          document.querySelector("ytd-page-manager")
        );
      }
      if (path.startsWith("/watch")) {
        return (
          document.querySelector("#secondary") ||
          document.querySelector("#below")
        );
      }
      return null;
    },
    title: "Recommendations hidden",
    body: "Search, open Subscriptions, or visit a channel to find videos.",
  },

  twitter: {
    hostIncludes: ["twitter.com", "x.com"],
    css: `
      [data-testid="primaryColumn"] section[role="region"],
      [data-testid="primaryColumn"] div[aria-label][role="region"],
      [data-testid="primaryColumn"] [data-testid="cellInnerDiv"] {
        display: none !important;
      }

      [data-testid="sidebarColumn"] div[data-testid="trend"],
      [data-testid="sidebarColumn"] section[role="region"]:has([data-testid="trend"]),
      [data-testid="sidebarColumn"] div:has(> div > [data-testid="trend"]) {
        display: none !important;
      }
    `,
    isTargetPage() {
      const path = location.pathname.replace(/\/$/, "") || "/";
      return path === "/" || path === "/home";
    },
    placeholderParent() {
      return document.querySelector('[data-testid="primaryColumn"]');
    },
    title: "Home timeline hidden",
    body: "You can still post, search, open profiles, and use Messages.",
  },

  facebook: {
    hostIncludes: ["facebook.com"],
    css: `
      div[role="feed"],
      div[role="main"] div[data-pagelet="Feed"],
      div[data-pagelet="MainFeed"],
      div[data-pagelet^="FeedUnit"] {
        display: none !important;
      }
    `,
    isTargetPage() {
      const path = location.pathname.replace(/\/$/, "") || "/";
      if (path === "/" || path === "/home.php" || path === "/home") return true;
      if (location.search.includes("sk=h_nor") || location.search.includes("sk=h_chr")) {
        return true;
      }
      return false;
    },
    placeholderParent() {
      return (
        document.querySelector("div[role='main']") ||
        document.querySelector("[role='main']") ||
        document.querySelector("div[role='banner']")?.parentElement
      );
    },
    title: "News feed hidden",
    body: "You can still use Messenger, Groups, Marketplace, and profiles.",
  },

  instagram: {
    hostIncludes: ["instagram.com"],
    css: `
      main article,
      main [role="feed"],
      section main article {
        display: none !important;
      }
    `,
    isTargetPage() {
      const path = location.pathname.replace(/\/$/, "") || "/";
      return path === "/";
    },
    placeholderParent() {
      return document.querySelector("main") || document.querySelector("section");
    },
    title: "Home feed hidden",
    body: "Stories, messages, and profiles still work as usual.",
  },

  linkedin: {
    hostIncludes: ["linkedin.com"],
    css: `
      main .scaffold-finite-scroll,
      .scaffold-finite-scroll__content,
      div.feed-shared-update-v2,
      div.occludable-update,
      .core-rail .feed-shared-update-v2,
      .feed-shared-update-v2,
      aside .news-module,
      aside.news-module,
      section.news-module,
      .news-module,
      .feed-follows-module,
      div[data-id^="urn:li:activity"] {
        display: none !important;
      }
    `,
    isTargetPage() {
      const path = location.pathname.replace(/\/$/, "") || "/";
      if (path.includes("/feed/update")) return false;
      return path === "/" || path === "/feed";
    },
    placeholderParent() {
      return (
        document.querySelector("main.scaffold-layout__main") ||
        document.querySelector(".core-rail") ||
        document.querySelector("main")
      );
    },
    title: "Feed hidden",
    body: "You can still post, message, apply to jobs, and visit profiles.",
  },
};

function nfrDetectSite() {
  const host = location.hostname.replace(/^www\./, "");
  for (const [id, site] of Object.entries(NFR_SITES)) {
    if (site.hostIncludes.some((part) => host === part || host.endsWith(`.${part}`))) {
      return id;
    }
  }
  return null;
}
