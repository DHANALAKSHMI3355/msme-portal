async function loginUser(username, password) {
  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const result = await response.json();
  return { success: response.ok, message: result.message || 'Login failed.' };
}

async function registerUser(username, email, password) {
  const response = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  const result = await response.json();
  return { success: response.ok, message: result.message || 'Registration failed.' };
}

const dashboard =
document.getElementById(
"dashboard"
);

document.getElementById(
"openDashboard"
)
.addEventListener(
"click",
()=>{

dashboard.style.display=
"block";

}
);

document.getElementById(
"closeDashboard"
)
.addEventListener(
"click",
()=>{

dashboard.style.display=
"none";

}
);