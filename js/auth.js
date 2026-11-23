function redirectToDashboard(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.elements.name?.value?.trim();
  if (name) localStorage.setItem('solarUserName', name);
  window.location.href = 'dashboard.html';
}

document.querySelector('#loginForm')?.addEventListener('submit', redirectToDashboard);
document.querySelector('#registerForm')?.addEventListener('submit', redirectToDashboard);
