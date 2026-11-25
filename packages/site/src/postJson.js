/** POST JSON to the app (with Laravel's XSRF cookie); resolves with the body, throws { status, errors, message }. */
function xsrfToken() {
  const match = typeof document !== 'undefined' && document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default async function postJson(endpoint, data) {
  const token = xsrfToken();
  const res = await fetch(endpoint, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(token ? { 'X-XSRF-TOKEN': token } : {}) },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, errors: body.errors, message: body.message };
  return body;
}
