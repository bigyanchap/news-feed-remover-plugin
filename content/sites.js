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
    // Only the home/trending recommendation feed is hidden. The watch-page
    // sidebar ("Up next" / related videos) is deliberately NOT removed: once
    // a video has been opened on purpose, its sidebar stays as YouTube made
    // it. Ads are not blocked or hidden either — content.js lets the ad play
    // and clicks YouTube's own Skip button the moment it appears.
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
      // No placeholder on watch pages: the sidebar there is left untouched.
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
    // The news feed is NOT removed on Facebook anymore. Instead, content.js
    // puts the seven goal-reminder blocks below in front of the feed (each
    // at least 300px tall, styled in content.js), so the feed only appears
    // after scrolling consciously past every one of them.
    css: ``,
    placeholderBlocks: [
      {
        kicker: "Reminder 1 of 7 — Stop",
        title: "Remember your life's goal",
        body: "You are a seeker of ultimate truth. Nothing in this feed is worth more than that.",
      },
      {
        kicker: "Reminder 2 of 7 — Ask",
        title: "Why did you open Facebook?",
        body: "Name the one real reason. If there is no reason, close the tab — that is the answer.",
      },
      {
        kicker: "Reminder 3 of 7 — Your sadhana",
        title: "Practice before scrolling",
        body: "Yoga, Puja and Sandhya are what actually change you. The feed changes nothing.",
      },
      {
        kicker: "Reminder 4 of 7 — Your work",
        title: "Awaken Me is waiting",
        body: "You are building an app that helps people wake up consciously. What is today's one step for it?",
      },
      {
        kicker: "Reminder 5 of 7 — Your body",
        title: "Vitality is earned daily",
        body: "A clear body, strong digestion and full-day energy — scrolling builds none of that.",
      },
      {
        kicker: "Reminder 6 of 7 — Be conscious",
        title: "One thing, then leave",
        body: "If you came for a message, a group or a profile, do only that one thing. No drifting.",
      },
      {
        kicker: "Reminder 7 of 7 — Your choice",
        title: "The feed begins below this block",
        body: "You have read all seven reminders. If you still scroll, scroll consciously — you decided, the feed did not.",
      },
    ],
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
    // When Facebook has rendered the feed itself, the wall is inserted
    // directly in front of that element (see content.js), so the blocks
    // sit exactly where the feed begins instead of at the top of <main>.
    placeholderAnchor() {
      return (
        document.querySelector("div[role='feed']") ||
        document.querySelector("[data-pagelet='Feed']") ||
        document.querySelector("[data-pagelet='MainFeed']")
      );
    },
    title: "Remember why you are here",
    body: "Seven reminders stand between you and the feed.",
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
