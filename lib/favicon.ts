import { publicHttpUrl } from '~/lib/og-zolplay.mjs'

// Google's public favicon endpoint: no API key, safe to hotlink, and works
// for any public domain. Used in place of the first-party og.zolplay.com
// favicon service so favicon lookups no longer depend on that third party.
// Reuses og-zolplay.mjs's SSRF-safe hostname check (rejects localhost,
// private/link-local IPs, non-http(s) schemes) so this stays as safe to
// expose through /link-media as the service it replaces.
const GOOGLE_FAVICON_BASE = 'https://www.google.com/s2/favicons'
const GOOGLE_FAVICON_SIZE = 64

export function googleFaviconUrl(origin: string): string | null {
  const target = publicHttpUrl(origin)
  if (!target) return null
  const url = new URL(GOOGLE_FAVICON_BASE)
  url.searchParams.set('domain', target.hostname)
  url.searchParams.set('sz', String(GOOGLE_FAVICON_SIZE))
  return url.href
}
