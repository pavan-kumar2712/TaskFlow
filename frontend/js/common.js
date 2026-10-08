const API = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`
  };
}

function requireAuth() {
  if (!getToken()) location.href = "index.html";
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  location.href = "index.html";
}

function getUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); }
  catch { return {}; }
}

function showMessage(el, text, ok=false) {
  el.textContent = text;
  el.style.color = ok ? "#00875a" : "#de350b";
}
