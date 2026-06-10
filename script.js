const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const yearNode = document.querySelector("#year");
const revealNodes = document.querySelectorAll("[data-reveal]");

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
