import { test } from 'node:test'
import assert from 'node:assert/strict'
import { planNavigation, locationFromUrl, toHref } from '../dist/navigation.js'

// R3: where a kit link takes you inside an Inertia app (from Tena-host's bridge).
const HERE = 'https://app.example.com/hosts?tab=a#top'

test('another page on this site is an Inertia visit, query and hash kept', () => {
  assert.deepEqual(planNavigation('/pricing?plan=pro#faq', HERE), { kind: 'visit', href: '/pricing?plan=pro#faq' })
  assert.deepEqual(planNavigation({ pathname: '/events', search: '?y=1' }, HERE), { kind: 'visit', href: '/events?y=1' })
})

test('a #section on this page stays on the page', () => {
  assert.deepEqual(planNavigation('#paths', HERE), { kind: 'hash', href: '#paths' })
  assert.deepEqual(planNavigation('/hosts?tab=a#paths', HERE), { kind: 'hash', href: '#paths' })
})

test('the same path with another query is a visit, not a hash change', () => {
  assert.equal(planNavigation('/hosts?tab=b', HERE).kind, 'visit')
})

test('another site loads as a plain link', () => {
  assert.deepEqual(planNavigation('https://wa.me/254700000000', HERE), { kind: 'external', href: 'https://wa.me/254700000000' })
})

test('a relative link resolves against the current page', () => {
  assert.deepEqual(planNavigation('business', 'https://app.example.com/v2/hosts'), { kind: 'visit', href: '/v2/business' })
})

test("Inertia's url and the browser hash become react-router's location", () => {
  assert.deepEqual(locationFromUrl('/hosts?tab=a', '#paths'), { pathname: '/hosts', search: '?tab=a', hash: '#paths', state: null, key: '#paths' })
  assert.deepEqual(locationFromUrl('/'), { pathname: '/', search: '', hash: '', state: null, key: 'default' })
  assert.equal(locationFromUrl('').pathname, '/')
})

test('toHref writes a react-router To as a string', () => {
  assert.equal(toHref('/a'), '/a')
  assert.equal(toHref({ pathname: '/a', search: 'x=1', hash: 'b' }), '/a?x=1#b')
  assert.equal(toHref(null), '')
})
