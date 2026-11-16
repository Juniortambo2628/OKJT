import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatNumber, formatDateTime, statusLabel, titleCase } from '../dist/helpers.js'

// F11, lifted from TFE (tests/JS/currency.test.mjs, statusLabel.test.mjs).

test('formatNumber is pinned to en-US grouping', () => {
  assert.equal(formatNumber(1234567), '1,234,567')
  assert.equal(formatNumber('42000'), '42,000')
  assert.equal(formatNumber(1234.567, 1), '1,234.6')
})

test('formatNumber renders junk as 0 rather than NaN', () => {
  assert.equal(formatNumber(undefined), '0')
  assert.equal(formatNumber('abc'), '0')
})

test('formatNumber takes another locale when asked', () => {
  assert.equal(formatNumber(1234567, 0, 'de-DE'), '1.234.567')
})

test('formatDateTime is blank for a missing or invalid date', () => {
  assert.equal(formatDateTime(null), '')
  assert.equal(formatDateTime('not a date'), '')
  assert.match(formatDateTime('2027-06-14T19:00:00Z', { timeZone: 'UTC' }), /^Jun 14, 2027, 7:00\s?PM$/)
})

test('formatDateTime takes Intl options, e.g. a date alone', () => {
  assert.equal(formatDateTime('2027-06-14T19:00:00Z', { timeZone: 'UTC', hour: undefined, minute: undefined }), 'Jun 14, 2027')
})

test('statusLabel gives every badge one casing', () => {
  assert.equal(statusLabel('PENDING'), 'Pending')
  assert.equal(statusLabel('pending_payment'), 'Pending payment')
  assert.equal(statusLabel('approved'), 'Approved')
  assert.equal(statusLabel(''), '')
  assert.equal(statusLabel(null), '')
})

test('titleCase sentence-cases a slug without touching a written label', () => {
  assert.equal(titleCase('upcoming'), 'Upcoming')
  assert.equal(titleCase('school_community'), 'School community')
  assert.equal(titleCase('Running a club'), 'Running a club')
  assert.equal(titleCase('Health & wellbeing'), 'Health & wellbeing')
})

test('titleCase passes through anything that is not a filled string', () => {
  assert.equal(titleCase(''), '')
  assert.equal(titleCase(null), null)
  assert.equal(titleCase(undefined), undefined)
})
