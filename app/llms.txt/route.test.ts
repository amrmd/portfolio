import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { getAllPosts } from '~/lib/content'
import { projects } from '~/lib/projects'
import { seo } from '~/lib/seo'

import { buildLlmsText } from './route'

describe('llms.txt', () => {
  it('publishes a concise Markdown map of every public content family', () => {
    const text = buildLlmsText()

    expect(text).toMatch(/^# Amr Mohamed\n\n>/)
    expect(text.length).toBeGreaterThan(50)
    expect(text).not.toContain('calibaby')
    expect(text).not.toContain('Cali Baby')

    for (const path of ['/', '/en']) {
      expect(text).toContain(`](${new URL(path, seo.url).href})`)
    }

    for (const post of getAllPosts()) {
      expect(text).toContain(new URL(`/blog/${post.slug}`, seo.url).href)
      expect(text).toContain(new URL(`/en/blog/${post.slug}`, seo.url).href)
    }

    expect(text).not.toContain('newsletters')

    for (const project of projects) {
      expect(text).toContain(new URL(project.url, seo.url).href)
    }
  })
})
