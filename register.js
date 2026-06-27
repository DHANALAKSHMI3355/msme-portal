async function registerUser(username, email, password) {
  const response = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  const result = await response.json();
  return { success: response.ok, message: result.message || 'Registration failed.' };
}
