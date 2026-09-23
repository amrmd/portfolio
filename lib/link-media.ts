import previews from '~/content/link-previews.json'
import { googleFaviconUrl } from '~/lib/favicon'

// Origins the /link-media proxy will serve favicons for, derived from the
// build-time preview snapshot (content/link-previews.json) plus the few
// chrome links that live outside prose — the proxy can never be aimed at an
// arbitrary host. Links added to a post before the snapshot refreshes fall
// back to Google's favicon service directly (see lib/link-previews.ts).
const EXTRA_FAVICON_ORIGINS = ['https://zolplay.com']

const snapshot = previews as Record<string, unknown>

const faviconOrigins = new Set<string>(EXTRA_FAVICON_ORIGINS)

for (const href of Object.keys(snapshot)) {
  try {
    faviconOrigins.add(new URL(href).origin)
  } catch {
    continue
  }
}

export type LinkMediaKind = 'favicon'

// Resolves a proxy target to Google's favicon upstream, or null when the
// target isn't allowlisted. Favicons resolve per site: any target under a
// known origin maps to that origin's icon.
export function upstreamLinkMediaUrl(kind: string, target: string): string | null {
  if (kind !== 'favicon') return null

  let origin: string
  try {
    origin = new URL(target).origin
  } catch {
    return null
  }
  return faviconOrigins.has(origin) ? googleFaviconUrl(origin) : null
}

export function linkMediaPath(kind: LinkMediaKind, target: string): string {
  return `/link-media/${kind}?url=${encodeURIComponent(target)}`
}
