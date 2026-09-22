import { cacheLife } from 'next/cache'

import { getAllPosts } from '~/lib/content'
import {
  archivedNewsletterIds,
  getArchivedNewsletter,
} from '~/lib/newsletters'
import { projects } from '~/lib/projects'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import { seo } from '~/lib/seo'

function absoluteUrl(path: string) {
  return new URL(path, seo.url).href
}

function oneLine(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function markdownLink(label: string, url: string, note: string) {
  const safeLabel = oneLine(label).replaceAll('[', '\\[').replaceAll(']', '\\]')
  return `- [${safeLabel}](${url}): ${oneLine(note)}`
}

export function buildLlmsText() {
  const posts = getAllPosts()
  const sections = ['blog', 'photos', 'projects', 'ama'] as const

  return [
    '# Amr Mohamed',
    '',
    '> The bilingual public site of AI-powered marketing strategist Amr Mohamed.',
    '',
    'Chinese pages use unprefixed URLs. English versions use `/en`. Prefer the page matching the user’s language, and use each page’s canonical URL when citing it.',
    '',
    markdownLink(
      publicPageMetadata.home.en.title,
      absoluteUrl('/en'),
      publicPageMetadata.home.en.description,
    ),
    markdownLink(
      publicPageMetadata.home.zh.title,
      absoluteUrl('/'),
      publicPageMetadata.home.zh.description,
    ),
    ...sections.flatMap((section) => [
      markdownLink(
        publicPageMetadata[section].en.title,
        absoluteUrl(`/en/${section}`),
        publicPageMetadata[section].en.description,
      ),
      markdownLink(
        publicPageMetadata[section].zh.title,
        absoluteUrl(`/${section}`),
        publicPageMetadata[section].zh.description,
      ),
    ]),
    '',
    '## Writing',
    '',
    ...posts.flatMap((post) => [
      markdownLink(
        post.titleEn,
        absoluteUrl(`/en/blog/${post.slug}`),
        post.descriptionEn,
      ),
      markdownLink(
        post.title,
        absoluteUrl(`/blog/${post.slug}`),
        post.description ?? `文章：${post.title}`,
      ),
    ]),
    '',
    '## Newsletter archive',
    '',
    ...archivedNewsletterIds.flatMap((id) => {
      const newsletter = getArchivedNewsletter(id)
      return [
        markdownLink(
          newsletter.titleEn,
          absoluteUrl(`/en/newsletters/${id}`),
          newsletter.descriptionEn,
        ),
        markdownLink(
          newsletter.title,
          absoluteUrl(`/newsletters/${id}`),
          newsletter.description,
        ),
      ]
    }),
    '',
    '## Projects',
    '',
    ...projects.map((project) =>
      markdownLink(
        project.nameEn,
        absoluteUrl(project.url),
        project.descriptionEn ?? project.description,
      ),
    ),
    '',
    '## Optional',
    '',
    markdownLink(
      'Chinese RSS feed',
      absoluteUrl('/feed.xml'),
      'Latest Chinese writing in RSS format.',
    ),
    markdownLink(
      'English RSS feed',
      absoluteUrl('/feed.en.xml'),
      'Latest English writing in RSS format.',
    ),
    markdownLink(
      'Sitemap',
      absoluteUrl('/sitemap.xml'),
      'Complete index of canonical public URLs and language alternates.',
    ),
    '',
  ].join('\n')
}

async function getLlmsText() {
  'use cache'
  cacheLife('max')

  return buildLlmsText()
}

export async function GET() {
  return new Response(await getLlmsText(), {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  })
}
