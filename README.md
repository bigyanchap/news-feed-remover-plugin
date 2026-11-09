# News Feed Remover

A Microsoft Edge extension for macOS that hides YouTube recommendations and the home feeds on X (Twitter), Instagram, and LinkedIn. On Facebook, a full-width wall of seven big goal-reminder blocks covers the whole page under the header, and the news feed behind it is suppressed entirely. On YouTube, ads are not blocked either: they play, and the Skip button is clicked automatically the moment YouTube offers it. Each site has its own switch in the toolbar popup.

Search, profiles, messages, subscriptions, and other non-feed pages stay available.

## Install in Microsoft Edge on Mac

1. Open **Microsoft Edge**.
2. Go to `edge://extensions`.
3. Turn on **Developer mode** (bottom-left).
4. Click **Load unpacked**.
5. Select this folder: `news-feed-remover-plugin`.
6. Pin the extension from the Extensions menu so the popup is easy to open.

## Use

Click the toolbar icon. Each site has a switch:

- **YouTube** — homepage recommendations and end-screen suggestions; the watch-page sidebar is left alone once a video is open, and ads play but are skipped automatically
- **X (Twitter)** — home timeline and trending
- **Facebook** — a full-width wall of seven goal-reminder blocks (each at least 300px tall) covering the whole page under the header, left end to right end; the news feed behind it is suppressed entirely, so no posts ever appear
- **Instagram** — home posts feed
- **LinkedIn** — main feed and news module

Changes apply immediately on open tabs. You can still search, post, message, and open profiles.

## Reload after updates

If you change the source files, open `edge://extensions` and click **Reload** on News Feed Remover.
