// Lifted from TFE (tests/JS/errorReporter.test.mjs), plus the options the kit adds.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { shouldReport, installErrorReporter, MAX_PER_PAGE } from '../dist/errorReporter.js'
import { installErrorReporter as fromHelpers, shouldReportError } from '../dist/helpers.js'

const base = { origin: 'https://tfe.okjtech.co.ke', page: '/fan/budget-calculator' }

test('a real error from our own bundle is reported once', () => {
  const seen = new Set()
  const e = { ...base, message: 'x is undefined', source: 'https://tfe.okjtech.co.ke/build/assets/app.js' }
  assert.equal(shouldReport(e, seen), true)
  assert.equal(shouldReport(e, seen), false, 'duplicate on the same page')
})

test('extension and browser noise is dropped', () => {
  assert.equal(shouldReport({ ...base, message: 'Could not establish connection. Receiving end does not exist.' }), false)
  assert.equal(shouldReport({ ...base, message: 'boom', source: 'chrome-extension://abc/serpBadge.js' }), false)
  assert.equal(shouldReport({ ...base, message: 'Script error.' }), false)
  assert.equal(shouldReport({ ...base, message: 'ResizeObserver loop completed with undelivered notifications.' }), false)
})

test('third-party scripts are not ours to fix', () => {
  assert.equal(shouldReport({ ...base, message: 'boom', source: 'https://ads.example.com/x.js' }), false)
})

test('nothing is reported from the pages a project names (TFE: bank savings)', () => {
  const skipPages = [/^\/fan\/bank-savings/, /^\/sandbox-bank/]
  assert.equal(shouldReport({ ...base, page: '/fan/bank-savings/3', message: 'boom' }, new Set(), { skipPages }), false)
  assert.equal(shouldReport({ ...base, page: '/sandbox-bank/onboard', message: 'boom' }, new Set(), { skipPages }), false)
  assert.equal(shouldReport({ ...base, page: '/fan/bank-savings/3', message: 'boom' }), true, 'no list, no skipping')
})

test('a page reports at most MAX_PER_PAGE distinct errors, or its own limit', () => {
  const seen = new Set()
  for (let i = 0; i < MAX_PER_PAGE; i++) assert.equal(shouldReport({ ...base, message: `e${i}` }, seen), true)
  assert.equal(shouldReport({ ...base, message: 'one more' }, seen), false)
  const few = new Set()
  assert.equal(shouldReport({ ...base, message: 'a' }, few, { maxPerPage: 1 }), true)
  assert.equal(shouldReport({ ...base, message: 'b' }, few, { maxPerPage: 1 }), false)
})

function fakeWindow() {
  const listeners = {}
  const sent = []
  return {
    sent, listeners,
    location: { pathname: '/app/guests', href: 'https://app.test/app/guests?x=1', origin: 'https://app.test' },
    navigator: { sendBeacon: (url, blob) => { sent.push({ url, blob }); return true } },
    fetch: () => Promise.resolve(),
    addEventListener: (type, fn) => { listeners[type] = fn },
  }
}

test('installs once, sends uncaught errors to the endpoint, and never throws itself', async () => {
  const win = fakeWindow()
  installErrorReporter({ win, endpoint: '/api/client-errors' })
  installErrorReporter({ win }) // a second install is ignored
  win.listeners.error({ message: 'x is undefined', filename: 'https://app.test/build/app.js', lineno: 3, colno: 9, error: { stack: 'at x' } })
  assert.equal(win.sent.length, 1)
  assert.equal(win.sent[0].url, '/api/client-errors')
  const body = JSON.parse(await win.sent[0].blob.text())
  assert.equal(body.message, 'x is undefined')
  assert.equal(body.line, 3)

  win.navigator.sendBeacon = () => { throw new Error('beacon broke') }
  assert.doesNotThrow(() => win.listeners.unhandledrejection({ reason: new Error('later') }))
})

test('the helpers entry exports it', () => {
  assert.equal(fromHelpers, installErrorReporter)
  assert.equal(typeof shouldReportError, 'function')
})
