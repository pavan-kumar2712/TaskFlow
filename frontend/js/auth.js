const API_BASE = "http://localhost:5000/api";

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = document.getElementById("message");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          email: document.getElementById("email").value,
          password: document.getElementById("password").value
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      location.href = "dashboard.html";
    } catch (err) {
      showMessage(message, err.message);
    }
  });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = document.getElementById("message");

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          name: document.getElementById("name").value,
          email: document.getElementById("email").value,
          password: document.getElementById("password").value
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showMessage(message, "Registration successful. Redirecting to login...", true);
      setTimeout(() => location.href = "index.html", 800);
    } catch (err) {
      showMessage(message, err.message);
    }
  });
}

function showMessage(el, text, ok=false) {
  el.textContent = text;
  el.style.color = ok ? "#00875a" : "#de350b";
}
