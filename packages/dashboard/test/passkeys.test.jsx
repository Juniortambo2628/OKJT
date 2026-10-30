import { loginWithPasskey, registerPasskey, passkeysSupported } from '../dist/index.js'

const bytes = (...b) => new Uint8Array(b).buffer
const json = (body, ok = true) => ({ ok, json: async () => body })

let calls
beforeEach(() => {
  calls = []
  navigator.credentials = {
    get: vi.fn(async ({ publicKey }) => {
      calls.push(publicKey)
      return {
        id: 'cred', rawId: bytes(251, 255), type: 'public-key', getClientExtensionResults: () => ({}),
        response: { authenticatorData: bytes(1), clientDataJSON: bytes(2), signature: bytes(3), userHandle: null },
      }
    }),
    create: vi.fn(async ({ publicKey }) => {
      calls.push(publicKey)
      return {
        id: 'new', rawId: bytes(9), type: 'public-key',
        response: { attestationObject: bytes(4), clientDataJSON: bytes(5), getTransports: () => ['internal'] },
      }
    }),
  }
})

test('signing in decodes the challenge and sends the signed assertion back as base64url', async () => {
  global.fetch = vi.fn()
    .mockResolvedValueOnce(json({ data: { options: { challenge: '-_8', allowCredentials: [{ id: 'AQ', type: 'public-key' }] } } }))
    .mockResolvedValueOnce(json({ data: { token: 't', user: { id: 1 } } }))

  await expect(loginWithPasskey()).resolves.toEqual({ token: 't', user: { id: 1 } })

  expect([...new Uint8Array(calls[0].challenge)]).toEqual([251, 255])
  expect([...new Uint8Array(calls[0].allowCredentials[0].id)]).toEqual([1])
  expect(fetch.mock.calls[0][0]).toBe('/api/passkeys/login/options')
  const [url, init] = fetch.mock.calls[1]
  expect(url).toBe('/api/passkeys/login')
  expect(JSON.parse(init.body).credential).toEqual({
    id: 'cred', rawId: '-_8', type: 'public-key', clientExtensionResults: {},
    response: { authenticatorData: 'AQ', clientDataJSON: 'Ag', signature: 'Aw', userHandle: null },
  })
})

test('adding a passkey sends the bearer token and the attestation', async () => {
  global.fetch = vi.fn()
    .mockResolvedValueOnce(json({ data: { options: { challenge: 'AQ' } } }))
    .mockResolvedValueOnce(json({ data: { id: 3, name: 'Laptop' } }))

  await expect(registerPasskey('Laptop', 'tok', { base: '/x' })).resolves.toEqual({ id: 3, name: 'Laptop' })

  expect(calls[0].excludeCredentials).toEqual([])
  expect(fetch.mock.calls[0][0]).toBe('/x/passkeys/options')
  expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer tok')
  const body = JSON.parse(fetch.mock.calls[1][1].body)
  expect(body.name).toBe('Laptop')
  expect(body.credential.response).toEqual({ attestationObject: 'BA', clientDataJSON: 'BQ', transports: ['internal'] })
})

test('the server’s refusal becomes the error message', async () => {
  global.fetch = vi.fn()
    .mockResolvedValueOnce(json({ options: { challenge: 'AQ' } }))
    .mockResolvedValueOnce(json({ message: 'Unable to sign in with this account.' }, false))

  await expect(loginWithPasskey()).rejects.toThrow('Unable to sign in with this account.')
})

test('a failed start says so', async () => {
  global.fetch = vi.fn().mockResolvedValueOnce(json({}, false))
  await expect(registerPasskey('x', 't')).rejects.toThrow('Could not start passkey registration.')
})

test('support follows the browser', () => {
  delete window.PublicKeyCredential
  expect(passkeysSupported()).toBe(false)
  window.PublicKeyCredential = function PublicKeyCredential() {}
  expect(passkeysSupported()).toBe(true)
})
