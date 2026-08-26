const DEFAULT_SETTINGS = {
  youtube: true,
  twitter: true,
  facebook: true,
  instagram: true,
  linkedin: true,
};

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.sync.get({ settings: null });
  if (!stored.settings) {
    await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
  }
});
