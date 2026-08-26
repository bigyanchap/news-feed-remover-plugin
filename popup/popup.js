const DEFAULT_SETTINGS = {
  youtube: true,
  twitter: true,
  facebook: true,
  instagram: true,
  linkedin: true,
};

const switches = [...document.querySelectorAll("input[data-site]")];
const storage = globalThis.chrome?.storage?.sync;

async function loadSettings() {
  if (!storage) return { ...DEFAULT_SETTINGS };
  const { settings } = await storage.get({ settings: DEFAULT_SETTINGS });
  return { ...DEFAULT_SETTINGS, ...settings };
}

function paint(settings) {
  for (const input of switches) {
    input.checked = Boolean(settings[input.dataset.site]);
  }
}

async function save(settings) {
  if (!storage) return;
  await storage.set({ settings });
}

document.addEventListener("DOMContentLoaded", async () => {
  paint(await loadSettings());
});

for (const input of switches) {
  input.addEventListener("change", async () => {
    const settings = await loadSettings();
    settings[input.dataset.site] = input.checked;
    await save(settings);
  });
}

document.getElementById("enable-all").addEventListener("click", async () => {
  const settings = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(settings)) settings[key] = true;
  await save(settings);
  paint(settings);
});

document.getElementById("disable-all").addEventListener("click", async () => {
  const settings = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(settings)) settings[key] = false;
  await save(settings);
  paint(settings);
});
