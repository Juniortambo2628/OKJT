import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { IMAGE_MIMES, VIDEO_MIMES, MEDIA_ACCEPT } from '../dist/helpers.js'

const php = new URL('../../laravel-kit/src/Media/MediaLibrary.php', import.meta.url)
const listIn = (src, name) => [...src.match(new RegExp(`const ${name} = \\[([^\\]]*)\\]`))[1].matchAll(/'([^']+)'/g)].map((m) => m[1])

test('the browser accepts exactly what laravel-kit\'s MediaLibrary accepts', { skip: !existsSync(php) && 'laravel-kit not beside ui' }, () => {
  const src = readFileSync(php, 'utf8')
  assert.deepEqual(IMAGE_MIMES, listIn(src, 'IMAGE_MIMES'))
  assert.deepEqual(VIDEO_MIMES, listIn(src, 'VIDEO_MIMES'))
})

test('accept strings, and never SVG', () => {
  assert.equal(MEDIA_ACCEPT.image, IMAGE_MIMES.join(','))
  assert.equal(MEDIA_ACCEPT.media, [...IMAGE_MIMES, ...VIDEO_MIMES].join(','))
  assert.doesNotMatch(MEDIA_ACCEPT.media, /svg/)
})
