const fields = {
  siteName: {
    input: document.querySelector("#siteNameInput"),
    output: document.querySelector("#brandText"),
  },
  headline: {
    input: document.querySelector("#headlineInput"),
    output: document.querySelector("#headlineText"),
  },
  lead: {
    input: document.querySelector("#leadInput"),
    output: document.querySelector("#leadText"),
  },
};

const previewFrame = document.querySelector("#previewFrame");
const themeButtons = document.querySelectorAll("[data-theme]");
const widthButtons = document.querySelectorAll("[data-width]");
const savedState = JSON.parse(localStorage.getItem("websiteEditorState") || "{}");

function saveState() {
  const state = {
    siteName: fields.siteName.input.value,
    headline: fields.headline.input.value,
    lead: fields.lead.input.value,
    theme: document.body.dataset.theme || "teal",
    width: previewFrame.dataset.width || "desktop",
  };

  localStorage.setItem("websiteEditorState", JSON.stringify(state));
}

function updateText(key, value) {
  fields[key].output.textContent = value;
  saveState();
}

Object.entries(fields).forEach(([key, field]) => {
  if (savedState[key]) {
    field.input.value = savedState[key];
    field.output.textContent = savedState[key];
  }

  field.input.addEventListener("input", () => updateText(key, field.input.value));
});

function activateButton(buttons, activeButton) {
  buttons.forEach((button) => button.classList.toggle("is-active", button === activeButton));
}

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    document.body.dataset.theme = button.dataset.theme;
    activateButton(themeButtons, button);
    saveState();
  });
});

widthButtons.forEach((button) => {
  button.addEventListener("click", () => {
    previewFrame.dataset.width = button.dataset.width;
    activateButton(widthButtons, button);
    saveState();
  });
});

if (savedState.theme) {
  const activeTheme = document.querySelector(`[data-theme="${savedState.theme}"]`);
  document.body.dataset.theme = savedState.theme;
  if (activeTheme) activateButton(themeButtons, activeTheme);
}

if (savedState.width) {
  const activeWidth = document.querySelector(`[data-width="${savedState.width}"]`);
  previewFrame.dataset.width = savedState.width;
  if (activeWidth) activateButton(widthButtons, activeWidth);
}
