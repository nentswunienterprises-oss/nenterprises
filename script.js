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
  const shareLinkOutput = document.querySelector("#share-link-output");
  const statusNode = document.querySelector("#studio-status");

  const toolbarButtons = document.querySelectorAll(".toolbar-button");
  const actionButtons = document.querySelectorAll(".studio-action");

  const sampleHtml = htmlInput.value.trim();
  let statusTimeout = null;

  function setStatus(message) {
    if (!statusNode) {
      return;
    }

    statusNode.textContent = message;

    if (statusTimeout) {
      window.clearTimeout(statusTimeout);
    }

    statusTimeout = window.setTimeout(() => {
      statusNode.textContent = "";
    }, 2800);
  }

  function bytesToBase64Url(bytes) {
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function base64UrlToBytes(base64Url) {
    const normalized = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  }

  async function encodeStatePayload(state) {
    const json = JSON.stringify(state);
    const input = new TextEncoder().encode(json);

    if ("CompressionStream" in window) {
      const stream = new CompressionStream("gzip");
      const writer = stream.writable.getWriter();
      writer.write(input);
      writer.close();
      const compressed = await new Response(stream.readable).arrayBuffer();
      return `gz.${bytesToBase64Url(new Uint8Array(compressed))}`;
    }

    return `raw.${bytesToBase64Url(input)}`;
  }

  async function decodeStatePayload(payload) {
    if (!payload) {
      return null;
    }

    const [prefix, encoded] = payload.split(".", 2);

    if (!prefix || !encoded) {
      return null;
    }

    try {
      const bytes = base64UrlToBytes(encoded);

      if (prefix === "gz" && "DecompressionStream" in window) {
        const stream = new DecompressionStream("gzip");
        const writer = stream.writable.getWriter();
        writer.write(bytes);
        writer.close();
        const decompressed = await new Response(stream.readable).arrayBuffer();
        return JSON.parse(new TextDecoder().decode(decompressed));
      }

      if (prefix === "raw" || prefix === "gz") {
        return JSON.parse(new TextDecoder().decode(bytes));
      }
    } catch (_error) {
      return null;
    }

    return null;
  }

  function buildStudioState() {
    return {
      kicker: docKicker.value,
      title: docTitle.value,
      subtitle: docSubtitle.value,
      reference: docReference.value,
      date: docDate.value,
      footer: docFooter.value,
      html: htmlInput.value,
    };
  }

  async function buildShareUrl(previewMode = false) {
    const state = buildStudioState();
    const payload = await encodeStatePayload(state);
    const url = new URL(window.location.href);
    url.searchParams.set("doc", payload);

    if (previewMode) {
      url.searchParams.set("view", "preview");
    } else {
      url.searchParams.delete("view");
    }

    return url.toString();
  }

  async function syncShareLink() {
    if (!shareLinkOutput) {
      return;
    }

    shareLinkOutput.value = await buildShareUrl(true);
  }

  function applyPreviewModeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const isPreviewMode = params.get("view") === "preview";

    document.body.classList.toggle("studio-preview-mode", isPreviewMode);
  }

  function parseHtmlFragment(rawHtml) {
    const parser = new DOMParser();
    const parsed = parser.parseFromString(rawHtml, "text/html");
    return parsed.body.innerHTML.trim();
  }

  async function syncPreviewFromEditor() {
    const html = editor.innerHTML.trim();
    htmlInput.value = html;
    previewBody.innerHTML = html;
    await syncShareLink();
  }

  async function syncMetaToPreview() {
    previewKicker.textContent = docKicker.value.trim() || "Nenterprises Internal Document";
    previewTitle.textContent = docTitle.value.trim() || "Untitled Nenterprises Document";
    previewSubtitle.textContent = docSubtitle.value.trim() || "";
    previewReference.textContent = docReference.value.trim() || "NENT-DOC";
    previewDate.textContent = docDate.value.trim() || "";
    previewFooter.textContent = docFooter.value.trim() || "";
    await syncShareLink();
  }

  function saveDraft() {
    localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(buildStudioState()));
  }

  async function loadDraftFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const payload = params.get("doc");
    const state = await decodeStatePayload(payload);

    if (!state) {
      return false;
    }

    docKicker.value = state.kicker || docKicker.value;
    docTitle.value = state.title || docTitle.value;
    docSubtitle.value = state.subtitle || docSubtitle.value;
    docReference.value = state.reference || docReference.value;
    docDate.value = state.date || docDate.value;
    docFooter.value = state.footer || docFooter.value;
    htmlInput.value = state.html || htmlInput.value;
    editor.innerHTML = parseHtmlFragment(htmlInput.value);
    await syncMetaToPreview();
    await syncPreviewFromEditor();
    applyPreviewModeFromUrl();
    return true;
  }

  async function loadDraft() {
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
      await syncMetaToPreview();
      await syncPreviewFromEditor();
      return true;
    } catch (_error) {
      return false;
    }
  }

  async function loadSample() {
    docKicker.value = "Nenterprises Internal Document";
    docTitle.value = "Building continuity through doctrine and execution.";
    docSubtitle.value = "This document translates principles into a readable, branded format for internal and external use.";
    docReference.value = "NENT-DOC-001";
    docDate.value = "26 June 2026";
    docFooter.value = "Nenterprises | Institutional continuity through doctrine, systems, and stewardship.";
    htmlInput.value = sampleHtml;
    editor.innerHTML = parseHtmlFragment(sampleHtml);
    await syncMetaToPreview();
    await syncPreviewFromEditor();
  }

  async function clearDocument() {
    docTitle.value = "";
    docSubtitle.value = "";
    docReference.value = "";
    docDate.value = "";
    docFooter.value = "";
    htmlInput.value = "";
    editor.innerHTML = "";
    await syncMetaToPreview();
    await syncPreviewFromEditor();
  }

  async function importHtml() {
    editor.innerHTML = parseHtmlFragment(htmlInput.value);
    await syncPreviewFromEditor();
  }

  function buildEmailHtml() {
    const logoUrl = new URL("../assets/logo-showcase.svg", window.location.href).href;
    return `
      <div style="margin:0;padding:32px 18px;background:#f8f4ee;font-family:Inter,'Segoe UI',sans-serif;color:#0a0a0a;">
        <div style="max-width:760px;margin:0 auto;background:#fffdf9;padding:44px 42px;border:1px solid #e7e1d6;">
          <div style="display:block;padding-bottom:24px;border-bottom:1px solid rgba(10,10,10,0.1);">
            <img src="${logoUrl}" alt="Nenterprises" style="width:240px;max-width:100%;display:block;margin-bottom:18px;">
            <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#6e6a64;">
              <span>${previewReference.textContent}</span>
              <span>${previewDate.textContent}</span>
            </div>
          </div>
          <div style="padding:28px 0 20px;">
            <p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#6e6a64;">${previewKicker.textContent}</p>
            <h1 style="margin:0 0 16px;font-family:'Inter Tight',Inter,'Segoe UI',sans-serif;font-size:44px;font-weight:700;line-height:0.96;letter-spacing:-0.06em;color:#0a0a0a;">${previewTitle.textContent}</h1>
            <p style="margin:0;max-width:58ch;font-size:18px;line-height:1.7;color:rgba(10,10,10,0.72);">${previewSubtitle.textContent}</p>
          </div>
          <div style="font-size:16px;line-height:1.8;color:#0a0a0a;">
            ${previewBody.innerHTML}
          </div>
          <div style="padding-top:22px;margin-top:28px;border-top:1px solid rgba(10,10,10,0.1);font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#6e6a64;">
            ${previewFooter.textContent}
          </div>
        </div>
      </div>
    `;
  }

  async function copyRichHtml() {
    const html = buildEmailHtml();
    const plainText = [
      previewKicker.textContent,
      previewTitle.textContent,
      previewSubtitle.textContent,
      "",
      previewBody.innerText.trim(),
      "",
      previewFooter.textContent,
    ].join("\n");

    if (navigator.clipboard && window.ClipboardItem) {
      const clipboardItem = new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plainText], { type: "text/plain" }),
      });

      await navigator.clipboard.write([clipboardItem]);
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(html);
    } else {
      throw new Error("Clipboard API unavailable");
    }

    setStatus("Rich HTML copied. You can paste it into an email.");
  }

  async function copySourceHtml() {
    await navigator.clipboard.writeText(htmlInput.value);
    setStatus("Source HTML copied.");
  }

  async function copyShareLink() {
    const shareUrl = await buildShareUrl(true);
    await navigator.clipboard.writeText(shareUrl);
    if (shareLinkOutput) {
      shareLinkOutput.value = shareUrl;
    }
    setStatus("Share link copied.");
  }

  async function copyEditorLink() {
    const editorUrl = await buildShareUrl(false);
    await navigator.clipboard.writeText(editorUrl);
    setStatus("Editor link copied.");
  }

  async function openShareView() {
    const shareUrl = await buildShareUrl(true);
    window.open(shareUrl, "_blank", "noopener");
  }

  async function openEditorView() {
    window.location.href = await buildShareUrl(false);
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
    button.addEventListener("click", async () => {
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

      await syncPreviewFromEditor();
    });
  });

  actionButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        const action = button.dataset.action;

        if (action === "import-html") {
          await importHtml();
        }

        if (action === "save-local") {
          saveDraft();
          setStatus("Draft saved locally on this device.");
        }

        if (action === "copy-source-html") {
          await copySourceHtml();
        }

        if (action === "load-sample") {
          await loadSample();
        }

        if (action === "clear") {
          await clearDocument();
        }

        if (action === "print") {
          window.print();
        }

        if (action === "copy-rich-html") {
          await copyRichHtml();
        }

        if (action === "copy-share-link") {
          await copyShareLink();
        }

        if (action === "copy-editor-link") {
          await copyEditorLink();
        }

        if (action === "open-share-view") {
          await openShareView();
        }

        if (action === "open-editor-view") {
          await openEditorView();
        }

        if (action === "download-html") {
          downloadHtml();
          setStatus("Standalone HTML file downloaded.");
        }
      } catch (_error) {
        setStatus("That action could not complete in this browser.");
      }
    });
  });

  [docKicker, docTitle, docSubtitle, docReference, docDate, docFooter].forEach((field) => {
    field.addEventListener("input", async () => {
      await syncMetaToPreview();
      saveDraft();
    });
  });

  htmlInput.addEventListener("input", async () => {
    saveDraft();
    await syncShareLink();
  });

  editor.addEventListener("input", async () => {
    await syncPreviewFromEditor();
    saveDraft();
  });

  (async () => {
    applyPreviewModeFromUrl();

    if (await loadDraftFromUrl()) {
      return;
    }

    if (!(await loadDraft())) {
      await loadSample();
    } else {
      await syncMetaToPreview();
      await syncPreviewFromEditor();
    }
  })();
}

initDocumentStudio();
