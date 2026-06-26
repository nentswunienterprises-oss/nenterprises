const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const yearNode = document.querySelector("#year");
const revealNodes = document.querySelectorAll("[data-reveal]");
const STUDIO_STORAGE_KEY = "nenterprises-document-studio";

if (navToggle && header) {
  navToggle.addEventListener("click", () => {
    const isOpen = header.dataset.open === "true";
    header.dataset.open = String(!isOpen);
    navToggle.setAttribute("aria-expanded", String(!isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      header.dataset.open = "false";
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      header.dataset.open = "false";
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

if (yearNode) {
  yearNode.textContent = new Date().getFullYear().toString();
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealNodes.forEach((node) => observer.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}

function initDocumentStudio() {
  const editor = document.querySelector("#rich-editor");
  const htmlInput = document.querySelector("#html-input");

  if (!editor || !htmlInput) {
    return;
  }

  const docKicker = document.querySelector("#doc-kicker");
  const docTitle = document.querySelector("#doc-title");
  const docSubtitle = document.querySelector("#doc-subtitle");
  const docReference = document.querySelector("#doc-reference");
  const docDate = document.querySelector("#doc-date");
  const docFooter = document.querySelector("#doc-footer");

  const previewKicker = document.querySelector("#preview-kicker");
  const previewTitle = document.querySelector("#preview-title");
  const previewSubtitle = document.querySelector("#preview-subtitle");
  const previewReference = document.querySelector("#preview-reference");
  const previewDate = document.querySelector("#preview-date");
  const previewFooter = document.querySelector("#preview-footer");
  const previewBody = document.querySelector("#preview-body");

  const toolbarButtons = document.querySelectorAll(".toolbar-button");
  const actionButtons = document.querySelectorAll(".studio-action");

  const sampleHtml = htmlInput.value.trim();

  function parseHtmlFragment(rawHtml) {
    const parser = new DOMParser();
    const parsed = parser.parseFromString(rawHtml, "text/html");
    return parsed.body.innerHTML.trim();
  }

  function syncPreviewFromEditor() {
    const html = editor.innerHTML.trim();
    htmlInput.value = html;
    previewBody.innerHTML = html;
  }

  function syncMetaToPreview() {
    previewKicker.textContent = docKicker.value.trim() || "Nenterprises Internal Document";
    previewTitle.textContent = docTitle.value.trim() || "Untitled Nenterprises Document";
    previewSubtitle.textContent = docSubtitle.value.trim() || "";
    previewReference.textContent = docReference.value.trim() || "NENT-DOC";
    previewDate.textContent = docDate.value.trim() || "";
    previewFooter.textContent = docFooter.value.trim() || "";
  }

  function saveDraft() {
    const state = {
      kicker: docKicker.value,
      title: docTitle.value,
      subtitle: docSubtitle.value,
      reference: docReference.value,
      date: docDate.value,
      footer: docFooter.value,
      html: htmlInput.value,
    };

    localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(state));
  }

  function loadDraft() {
    const raw = localStorage.getItem(STUDIO_STORAGE_KEY);

    if (!raw) {
      return false;
    }

    try {
      const state = JSON.parse(raw);
      docKicker.value = state.kicker || docKicker.value;
      docTitle.value = state.title || docTitle.value;
      docSubtitle.value = state.subtitle || docSubtitle.value;
      docReference.value = state.reference || docReference.value;
      docDate.value = state.date || docDate.value;
      docFooter.value = state.footer || docFooter.value;
      htmlInput.value = state.html || htmlInput.value;
      editor.innerHTML = parseHtmlFragment(htmlInput.value);
      syncMetaToPreview();
      syncPreviewFromEditor();
      return true;
    } catch (_error) {
      return false;
    }
  }

  function loadSample() {
    docKicker.value = "Nenterprises Internal Document";
    docTitle.value = "Building continuity through doctrine and execution.";
    docSubtitle.value = "This document translates principles into a readable, branded format for internal and external use.";
    docReference.value = "NENT-DOC-001";
    docDate.value = "26 June 2026";
    docFooter.value = "Nenterprises | Institutional continuity through doctrine, systems, and stewardship.";
    htmlInput.value = sampleHtml;
    editor.innerHTML = parseHtmlFragment(sampleHtml);
    syncMetaToPreview();
    syncPreviewFromEditor();
  }

  function clearDocument() {
    docTitle.value = "";
    docSubtitle.value = "";
    docReference.value = "";
    docDate.value = "";
    docFooter.value = "";
    htmlInput.value = "";
    editor.innerHTML = "";
    syncMetaToPreview();
    syncPreviewFromEditor();
  }

  function importHtml() {
    editor.innerHTML = parseHtmlFragment(htmlInput.value);
    syncPreviewFromEditor();
  }

  function downloadHtml() {
    const exportStyles = `
      body {
        margin: 0;
        padding: 40px 24px;
        background: #f8f4ee;
        color: #0a0a0a;
        font-family: Inter, "Segoe UI", sans-serif;
      }

      .doc-preview {
        width: min(100%, 840px);
        margin: 0 auto;
        padding: 54px 56px 42px;
        background: #fffdf9;
        color: #0a0a0a;
      }

      .doc-preview-header {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
        gap: 18px;
        padding-bottom: 26px;
        border-bottom: 1px solid rgba(10, 10, 10, 0.1);
      }

      .doc-preview-logo {
        width: 240px;
        max-width: 100%;
      }

      .doc-preview-meta {
        display: grid;
        gap: 4px;
        justify-items: end;
      }

      .doc-preview-meta p,
      .doc-preview-kicker,
      .doc-preview-footer p {
        margin: 0;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .doc-preview-kicker {
        color: rgba(10, 10, 10, 0.56);
      }

      .doc-preview-intro {
        display: grid;
        gap: 18px;
        padding: 34px 0 22px;
      }

      .doc-preview-title {
        margin: 0;
        font-family: "Inter Tight", Inter, "Segoe UI", sans-serif;
        font-size: 52px;
        font-weight: 700;
        line-height: 0.95;
        letter-spacing: -0.06em;
      }

      .doc-preview-subtitle {
        margin: 0;
        max-width: 58ch;
        color: rgba(10, 10, 10, 0.72);
        font-size: 18px;
      }

      .doc-preview-body {
        padding: 12px 0 34px;
      }

      .doc-preview-footer {
        padding-top: 20px;
        border-top: 1px solid rgba(10, 10, 10, 0.1);
      }

      .doc-preview h1,
      .doc-preview h2,
      .doc-preview h3 {
        margin: 1.1em 0 0.45em;
        font-family: "Inter Tight", Inter, "Segoe UI", sans-serif;
        font-weight: 700;
        line-height: 0.98;
        letter-spacing: -0.04em;
      }

      .doc-preview h1 {
        font-size: 34px;
      }

      .doc-preview h2 {
        font-size: 25px;
      }

      .doc-preview h3 {
        font-size: 19px;
      }

      .doc-preview p,
      .doc-preview li,
      .doc-preview blockquote {
        font-size: 16px;
        line-height: 1.8;
      }

      .doc-preview p {
        margin: 0 0 1rem;
      }

      .doc-preview ul,
      .doc-preview ol {
        margin: 0 0 1rem;
        padding-left: 1.4rem;
      }

      .doc-preview blockquote {
        margin: 1.5rem 0;
        padding: 0.25rem 0 0.25rem 1.2rem;
        border-left: 2px solid #a78b63;
        color: rgba(10, 10, 10, 0.72);
      }

      .doc-preview a {
        color: inherit;
        text-decoration: underline;
        text-decoration-color: rgba(167, 139, 99, 0.7);
        text-underline-offset: 3px;
      }
    `;

    const previewClone = document.querySelector("#doc-preview").cloneNode(true);

    previewClone.querySelectorAll("img").forEach((image) => {
      image.src = new URL(image.getAttribute("src"), window.location.href).href;
    });

    const documentHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${previewTitle.textContent}</title>
  <style>${exportStyles}</style>
</head>
<body>
${previewClone.outerHTML}
</body>
</html>`;

    const blob = new Blob([documentHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "nenterprises-document.html";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  toolbarButtons.forEach((button) => {
    button.addEventListener("click", () => {
      editor.focus();

      const block = button.dataset.block;
      const command = button.dataset.command;
      const action = button.dataset.action;

      if (block) {
        document.execCommand("formatBlock", false, block);
      } else if (command) {
        document.execCommand(command, false);
      } else if (action === "link") {
        const url = window.prompt("Enter a URL");

        if (url) {
          document.execCommand("createLink", false, url);
        }
      }

      syncPreviewFromEditor();
    });
  });

  actionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;

      if (action === "import-html") {
        importHtml();
      }

      if (action === "save-local") {
        saveDraft();
      }

      if (action === "load-sample") {
        loadSample();
      }

      if (action === "clear") {
        clearDocument();
      }

      if (action === "print") {
        window.print();
      }

      if (action === "download-html") {
        downloadHtml();
      }
    });
  });

  [docKicker, docTitle, docSubtitle, docReference, docDate, docFooter].forEach((field) => {
    field.addEventListener("input", () => {
      syncMetaToPreview();
      saveDraft();
    });
  });

  htmlInput.addEventListener("input", saveDraft);

  editor.addEventListener("input", () => {
    syncPreviewFromEditor();
    saveDraft();
  });

  if (!loadDraft()) {
    loadSample();
  } else {
    syncMetaToPreview();
    syncPreviewFromEditor();
  }
}

initDocumentStudio();
