// Mobile menu toggle
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  // Close mobile menu after clicking a link
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}

// Footer year
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Simple mailto-based contact form for static hosting
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const interest = document.getElementById("interest").value.trim();
    const message = document.getElementById("message").value.trim();

    const subject = encodeURIComponent(`BR Realty Website Inquiry - ${interest}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nInterest: ${interest}\n\nMessage:\n${message}`
    );

    // Replace this email with your real business email later
    window.location.href = `mailto:info@brrealty.com?subject=${subject}&body=${body}`;
  });
}
