/**
 * Passkeys in the browser, for okjt/laravel-kit's PasskeyController. The API
 * speaks base64url strings; the browser's WebAuthn API needs ArrayBuffers.
 * `base` is where the passkey routes live (they need the session, so they
 * sit in the web routes under /api).
 */

function b64urlToBuffer(b64url) {
  const bin = atob(b64url.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function bufferToB64url(buffer) {
  let bin = '';
  new Uint8Array(buffer).forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeOptions(options, listKey) {
  return {
    ...options,
    challenge: b64urlToBuffer(options.challenge),
    [listKey]: (options[listKey] || []).map((c) => ({ ...c, id: b64urlToBuffer(c.id) })),
  };
}

function encodeCredential(credential) {
  const { response } = credential;
  const base = {
    id: credential.id,
    rawId: bufferToB64url(credential.rawId),
    type: credential.type,
    clientExtensionResults: credential.getClientExtensionResults?.() || {},
  };

  if ('attestationObject' in response) {
    return {
      ...base,
      response: {
        attestationObject: bufferToB64url(response.attestationObject),
        clientDataJSON: bufferToB64url(response.clientDataJSON),
        transports: response.getTransports?.() || [],
      },
    };
  }

  return {
    ...base,
    response: {
      authenticatorData: bufferToB64url(response.authenticatorData),
      clientDataJSON: bufferToB64url(response.clientDataJSON),
      signature: bufferToB64url(response.signature),
      userHandle: response.userHandle ? bufferToB64url(response.userHandle) : null,
    },
  };
}

async function fetchOptions(url, headers, failure) {
  const res = await fetch(url, { headers: { Accept: 'application/json', ...headers }, credentials: 'same-origin' });
  if (!res.ok) throw new Error(failure);
  const payload = await res.json();
  return payload.data?.options || payload.options;
}

async function send(url, headers, body, failure) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
    credentials: 'same-origin',
    body: JSON.stringify(body),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.message || failure);
  return payload.data || payload;
}

/** Sign in with a passkey: options → authenticator → token (or requires_2fa / requires_verification). */
export async function loginWithPasskey({ base = '/api' } = {}) {
  const options = await fetchOptions(`${base}/passkeys/login/options`, {}, 'Could not start passkey sign-in.');
  const credential = await navigator.credentials.get({ publicKey: decodeOptions(options, 'allowCredentials') });
  return send(`${base}/passkeys/login`, {}, { credential: encodeCredential(credential) }, 'Passkey sign-in failed.');
}

/** Add a passkey for the signed-in person (their bearer token). */
export async function registerPasskey(name, token, { base = '/api' } = {}) {
  const auth = { Authorization: `Bearer ${token}` };
  const options = await fetchOptions(`${base}/passkeys/options`, auth, 'Could not start passkey registration.');
  const credential = await navigator.credentials.create({ publicKey: decodeOptions(options, 'excludeCredentials') });
  return send(`${base}/passkeys`, auth, { name, credential: encodeCredential(credential) }, 'Could not save passkey.');
}

export function passkeysSupported() {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential;
}
