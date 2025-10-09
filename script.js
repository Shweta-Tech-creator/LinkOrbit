document.addEventListener("DOMContentLoaded", () => {
  // FAQ toggle
  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const faqItem = button.parentElement;
      faqItem.classList.toggle("active");
    });
  });
});

const modal = document.getElementById("auth-modal");
const closeBtn = document.querySelector(".close-btn");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

// Open modal (default = login form)
document.getElementById("open-auth").addEventListener("click", (e) => {
  e.preventDefault();
  modal.style.display = "flex";
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
});

// Switch to signup
document.getElementById("switch-to-signup").addEventListener("click", (e) => {
  e.preventDefault();
  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});

// Switch to login
document.getElementById("switch-to-login").addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
});

// Close modal
closeBtn.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// Toggle password visibility
function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}
