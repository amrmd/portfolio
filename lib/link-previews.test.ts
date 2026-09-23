import { describe, expect, it } from 'vitest'

import { upstreamLinkMediaUrl } from './link-media'
import { faviconUrl } from './link-previews'

describe('link preview media URLs', () => {
  it('routes known targets through the cached first-party proxy', () => {
    expect(faviconUrl('https://astro.build/')).toBe(
      '/link-media/favicon?url=https%3A%2F%2Fastro.build',
    )
  })

  it('requests favicons against the root domain only', () => {
    // deep paths under a known origin collapse to that origin's icon
    expect(faviconUrl('https://astro.build/blog/some-post?x=1#y')).toBe(
      '/link-media/favicon?url=https%3A%2F%2Fastro.build',
    )
  })

  it('falls back to Google favicons for targets missing from the snapshot', () => {
    expect(faviconUrl('https://not-in-snapshot.example/articles/design')).toBe(
      'https://www.google.com/s2/favicons?domain=not-in-snapshot.example&sz=64',
    )
  })

  it('degrades bad links to null instead of throwing', () => {
    expect(faviconUrl('not a url')).toBeNull()
    expect(faviconUrl('javascript:alert(1)')).toBeNull()
    expect(faviconUrl('http://localhost/admin')).toBeNull()
  })
})

describe('link media proxy allowlist', () => {
  it('resolves allowlisted favicon targets to Google', () => {
    expect(upstreamLinkMediaUrl('favicon', 'https://astro.build')).toBe(
      'https://www.google.com/s2/favicons?domain=astro.build&sz=64',
    )
    expect(upstreamLinkMediaUrl('favicon', 'https://astro.build/deep/page')).toBe(
      'https://www.google.com/s2/favicons?domain=astro.build&sz=64',
    )
  })

  it('serves chrome favicons outside prose', () => {
    expect(upstreamLinkMediaUrl('favicon', 'https://zolplay.com')).toBe(
      'https://www.google.com/s2/favicons?domain=zolplay.com&sz=64',
    )
  })

  it('rejects everything else', () => {
    expect(upstreamLinkMediaUrl('favicon', 'https://not-in-snapshot.example')).toBeNull()
    expect(upstreamLinkMediaUrl('favicon', 'not a url')).toBeNull()
    expect(upstreamLinkMediaUrl('metadata', 'https://astro.build')).toBeNull()
    expect(upstreamLinkMediaUrl('image', 'https://astro.build')).toBeNull()
  })
})
