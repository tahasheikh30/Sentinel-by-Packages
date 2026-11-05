import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'))
const html = readFileSync('index.html', 'utf8')
const csp = vercel.headers[0].headers.find((h) => h.key === 'Content-Security-Policy').value
const directive = (name) => (csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(name + ' ')) || '')

describe('Content-Security-Policy in vercel.json', () => {
  it('does not allow arbitrary inline styles or scripts', () => {
    expect(directive('style-src')).not.toContain("'unsafe-inline'")
    expect(directive('script-src')).not.toContain("'unsafe-inline'")
    expect(directive('script-src')).not.toContain("'unsafe-eval'")
  })

  it('needs no inline styles: index.html has no <style> block or style attribute, and the early paint colour is a file', () => {
    expect(html).not.toMatch(/<style/i)
    expect(html).not.toMatch(/\sstyle=/i)
    expect(html).toContain('href="/early.css"')
    expect(readFileSync('public/early.css', 'utf8')).toContain('background:#11181d')
    expect(directive('style-src')).toBe("style-src 'self'")
  })

  it('keeps the framing, object and base restrictions', () => {
    expect(directive('frame-ancestors')).toBe("frame-ancestors 'none'")
    expect(directive('object-src')).toBe("object-src 'none'")
    expect(directive('base-uri')).toBe("base-uri 'self'")
    expect(directive('default-src')).toBe("default-src 'self'")
  })
})
