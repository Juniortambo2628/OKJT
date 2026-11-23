import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as helpers from '../dist/helpers.js'

test('@okjt/ui/helpers exports the chunk-reload helpers', () => {
  assert.equal(typeof helpers.installChunkReload, 'function')
  assert.equal(typeof helpers.isChunkLoadError, 'function')
  assert.equal(typeof helpers.shouldReloadForChunks, 'function')
})

test('@okjt/ui/helpers loads nothing that needs React or toasts', () => {
  for (const file of ['dist/helpers.js', 'dist/chunkReload.js', 'dist/formats.js', 'dist/undo.js', 'dist/errorReporter.js']) {
    const src = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
    assert.doesNotMatch(src, /from ["'](react|react-dom|react-hot-toast|framer-motion|lucide-react)/, file)
    for (const [, dep] of src.matchAll(/from ["']\.\/([^"']+)["']/g)) assert.ok(['chunkReload.js', 'formats.js', 'undo.js', 'errorReporter.js'].includes(dep), `${file} imports ./${dep}`)
  }
})
