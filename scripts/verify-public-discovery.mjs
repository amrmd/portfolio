import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'

import matter from 'gray-matter'
import { JSDOM } from 'jsdom'

import { openProductionServer } from './production-server.mjs'

const expectedOrigin =
  process.env.PUBLIC_DISCOVERY_EXPECTED_ORIGIN ?? process.env.SITE_URL
if (!expectedOrigin) {
  throw new Error(
    'Set PUBLIC_DISCOVERY_EXPECTED_ORIGIN or SITE_URL before running verify:public-discovery.',
  )
}
const productionOrigin = new URL(expectedOrigin).origin

function localizedPages(pathname, zh, en, imageAlt) {
  const zhPath = pathname
  const enPath = pathname === '/' ? '/en' : `/en${pathname}`
  return [
    {
      path: zhPath,
      locale: 'zh-CN',
      title: zh.title,
      documentTitle: pathname === '/' ? zh.title : `${zh.title} | Amr Mohamed`,
      description: zh.description,
      imageAlt: imageAlt.zh,
    },
    {
      path: enPath,
      locale: 'en',
      title: en.title,
      documentTitle: pathname === '/' ? en.title : `${en.title} | Amr Mohamed`,
      description: en.description,
      imageAlt: imageAlt.en,
    },
  ]
}

const publicPages = [
  ...localizedPages(
    '/',
    {
      title: 'Amr Mohamed',
      description: '数字营销专家、Agent 指挥官、创意总监。',
    },
    {
      title: 'Amr Mohamed',
      description: 'Digital Marketer. Agent Orchestrator. Creative Director.',
    },
    {
      zh: 'Amr Mohamed。数字营销专家、Agent 指挥官、创意总监。',
      en: 'Amr Mohamed. Digital Marketer. Agent Orchestrator. Creative Director.',
    },
  ),
  ...localizedPages(
    '/blog',
    {
      title: '写作',
      description: 'Cali 关于设计、工程、产品，以及一路上在意的人和事的文章。',
    },
    {
      title: 'Writing',
      description:
        'Essays by Cali about design, engineering, products, and the people and ideas that matter along the way.',
    },
    {
      zh: '写作 · Amr Mohamed。Cali 关于设计、工程、产品，以及一路上在意的人和事的文章。',
      en: 'Writing · Amr Mohamed. Essays by Cali about design, engineering, products, and the people and ideas that matter along the way.',
    },
  ),
  ...localizedPages(
    '/photos',
    { title: '照片', description: 'Cali 在工作、生活和旅途中留下的一些瞬间。' },
    {
      title: 'Photos',
      description: 'Moments Cali has kept from work, life, and everywhere in between.',
    },
    {
      zh: '照片 · Amr Mohamed。Cali 在工作、生活和旅途中留下的一些瞬间。',
      en: 'Photos · Amr Mohamed. Moments Cali has kept from work, life, and everywhere in between.',
    },
  ),
  ...localizedPages(
    '/projects',
    {
      title: '项目',
      description:
        '这些年做过的产品、开源工具和小实验。有些实用，有些只是好玩，但每一个我都认真做过。',
    },
    {
      title: 'Projects',
      description:
        'Products, open-source tools, and small experiments I have made over the years. Some useful, some playful, all made with care.',
    },
    {
      zh: '项目 · Amr Mohamed。这些年做过的产品、开源工具和小实验。有些实用，有些只是好玩，但每一个我都认真做过。',
      en: 'Projects · Amr Mohamed. Products, open-source tools, and small experiments I have made over the years. Some useful, some playful, all made with care.',
    },
  ),
  ...localizedPages(
    '/ama',
    {
      title: '一对一',
      description:
        '从产品设计、工程、职业到独立开发、创业、出海、英语学习与 AI 工作流，用一小时聊清楚怎么判断、怎么取舍、下一步做什么。',
    },
    {
      title: 'AMA',
      description:
        'A one-to-one conversation about AI-native work, product strategy, engineering, startups, career moves, and building products.',
    },
    {
      zh: '一对一 · Amr Mohamed。从产品设计、工程、职业到独立开发、创业、出海、英语学习与 AI 工作流，用一小时聊清楚怎么判断、怎么取舍、下一步做什么。',
      en: 'AMA · Amr Mohamed. A one-to-one conversation about AI-native work, product strategy, engineering, startups, career moves, and building products.',
    },
  ),
]

const blogDirectory = new URL('../content/blog/', import.meta.url)
for (const slug of (await readdir(blogDirectory)).sort()) {
  const zh = matter(await readFile(new URL(`${slug}/index.mdx`, blogDirectory), 'utf8')).data
  const en = matter(await readFile(new URL(`${slug}/index.en.mdx`, blogDirectory), 'utf8')).data
  publicPages.push(
    ...localizedPages(
      `/blog/${slug}`,
      zh,
      en,
      {
        zh: `${zh.title} · Amr Mohamed`,
        en: `${en.title} · Amr Mohamed`,
      },
    ),
  )
}

function expectedCanonical(page) {
  return new URL(page.canonical ?? page.path, productionOrigin).href
}

function requiredElement(document, selector, description) {
  const element = document.querySelector(selector)
  assert.ok(element, `missing ${description}`)
  return element
}

function markdownLinkTargets(markdown) {
  const targets = new Set()
  for (const line of markdown.split('\n')) {
    if (!line.startsWith('- [')) continue
    const targetStart = line.indexOf('](')
    const targetEnd = line.indexOf('): ', targetStart + 2)
    if (targetStart >= 0 && targetEnd > targetStart) {
      targets.add(line.slice(targetStart + 2, targetEnd))
    }
  }
  return targets
}

async function verifyMetadata(baseUrl, page) {
  const response = await fetch(new URL(page.path, baseUrl))
  assert.equal(response.status, 200, `${page.path} status`)
  const dom = new JSDOM(await response.text())
  const { document } = dom.window

  assert.equal(document.documentElement.lang, page.locale, `${page.path} lang`)
  const robots =
    document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? ''
  if (page.indexable === false) {
    assert.match(robots, /noindex/, `${page.path} indexing`)
    assert.doesNotMatch(robots, /nofollow/, `${page.path} links`)
  } else {
    assert.doesNotMatch(robots, /noindex|nofollow/, `${page.path} indexing`)
  }
  assert.equal(document.title, page.documentTitle, `${page.path} title`)
  assert.equal(
    requiredElement(
      document,
      'meta[name="description"]',
      `${page.path} description`,
    ).getAttribute('content'),
    page.description,
  )
  const canonical = requiredElement(
    document,
    'link[rel="canonical"]',
    `${page.path} canonical`,
  ).getAttribute('href')
  assert.ok(canonical)
  assert.equal(
    new URL(canonical).href,
    expectedCanonical(page),
    `${page.path} canonical`,
  )

  const unlocalized = page.path.replace(/^\/en(?=\/|$)/, '') || '/'
  const zh = new URL(unlocalized, productionOrigin).href
  const enPath = unlocalized === '/' ? '/en' : `/en${unlocalized}`
  const en = new URL(enPath, productionOrigin).href
  for (const [language, expected] of [
    ['zh-CN', zh],
    ['en', en],
    ['x-default', zh],
  ]) {
    const alternate = requiredElement(
      document,
      `link[rel="alternate"][hreflang="${language}"]`,
      `${page.path} ${language} alternate`,
    ).getAttribute('href')
    assert.ok(alternate)
    assert.equal(new URL(alternate).href, expected)
  }

  assert.equal(
    requiredElement(
      document,
      'meta[property="og:locale"]',
      `${page.path} OG locale`,
    ).getAttribute('content'),
    page.locale === 'en' ? 'en_US' : 'zh_CN',
  )
  for (const [selector, expected, description] of [
    ['meta[property="og:title"]', page.title, 'OG title'],
    ['meta[property="og:description"]', page.description, 'OG description'],
    ['meta[name="twitter:title"]', page.title, 'Twitter title'],
    ['meta[name="twitter:description"]', page.description, 'Twitter description'],
    ['meta[property="og:image:alt"]', page.imageAlt, 'OG image alt'],
    ['meta[name="twitter:image:alt"]', page.imageAlt, 'Twitter image alt'],
  ]) {
    const element = requiredElement(
      document,
      selector,
      `${page.path} ${description}`,
    )
    assert.equal(
      element.getAttribute('content'),
      expected,
    )
  }
  assert.equal(
    requiredElement(
      document,
      'meta[property="og:image:width"]',
      `${page.path} OG image width`,
    ).getAttribute('content'),
    '1200',
  )
  assert.equal(
    requiredElement(
      document,
      'meta[property="og:image:height"]',
      `${page.path} OG image height`,
    ).getAttribute('content'),
    '630',
  )
  if (page.smartAppBanner) {
    assert.equal(
      requiredElement(
        document,
        'meta[name="apple-itunes-app"]',
        `${page.path} App Store smart banner`,
      ).getAttribute('content'),
      'app-id=6769728441',
    )
  }
  const ogImage = requiredElement(
    document,
    'meta[property="og:image"]',
    `${page.path} OG image`,
  ).getAttribute('content')
  assert.ok(ogImage)
  assert.equal(new URL(ogImage).origin, productionOrigin)
  const remoteImage = new URL(ogImage)
  const localImage = new URL(
    `${remoteImage.pathname}${remoteImage.search}`,
    baseUrl,
  )
  const imageResponse = await fetch(localImage)
  assert.equal(imageResponse.status, 200, `${page.path} OG image status`)
  assert.match(imageResponse.headers.get('content-type') ?? '', /^image\/png/)
  const imageBytes = Buffer.from(await imageResponse.arrayBuffer())
  assert.deepEqual([...imageBytes.subarray(1, 4)], [0x50, 0x4e, 0x47])
  assert.equal(imageBytes.readUInt32BE(16), 1200, `${page.path} PNG width`)
  assert.equal(imageBytes.readUInt32BE(20), 630, `${page.path} PNG height`)
}

async function verifyDiscoveryFiles(baseUrl) {
  const sitemap = await fetch(new URL('/sitemap.xml', baseUrl))
  assert.equal(sitemap.status, 200)
  assert.match(
    sitemap.headers.get('content-type') ?? '',
    /(?:application|text)\/xml/,
  )
  const sitemapXml = await sitemap.text()
  const sitemapPaths = publicPages
    .filter((page) => page.indexable !== false)
    .map((page) => page.path)
  for (const path of new Set(sitemapPaths)) {
    assert.ok(
      sitemapXml.includes(new URL(path, productionOrigin).href),
      `sitemap ${path}`,
    )
  }
  for (const page of publicPages.filter((candidate) => candidate.indexable === false)) {
    assert.ok(
      !sitemapXml.includes(new URL(page.path, productionOrigin).href),
      `sitemap excludes ${page.path}`,
    )
  }

  const robots = await fetch(new URL('/robots.txt', baseUrl))
  assert.equal(robots.status, 200)
  const robotsText = await robots.text()
  assert.match(robotsText, /User-Agent: \*/)
  assert.match(robotsText, /Allow: \//)
  assert.match(robotsText, /Disallow: \/admin/)
  assert.match(robotsText, /Disallow: \/api\/admin/)
  assert.match(
    robotsText,
    new RegExp(`Sitemap: ${new URL('/sitemap.xml', productionOrigin).href}`),
  )

  const icon = await fetch(new URL('/icon.png', baseUrl))
  assert.equal(icon.status, 200)
  assert.match(icon.headers.get('content-type') ?? '', /^image\/png/)
  const iconBytes = new Uint8Array(await icon.arrayBuffer())
  assert.deepEqual([...iconBytes.slice(1, 4)], [0x50, 0x4e, 0x47])

  const llms = await fetch(new URL('/llms.txt', baseUrl))
  assert.equal(llms.status, 200)
  assert.match(llms.headers.get('content-type') ?? '', /^text\/markdown/)
  const llmsText = await llms.text()
  assert.match(llmsText, /^# Amr Mohamed\n\n>/)
  const llmsTargets = markdownLinkTargets(llmsText)
  for (const path of new Set(publicPages.map((page) => page.path))) {
    assert.ok(
      llmsTargets.has(new URL(path, productionOrigin).href),
      `llms.txt ${path}`,
    )
  }
}

async function verifyNotFound(baseUrl) {
  for (const pathname of [
    '/release-check-missing',
    '/blog/not-a-published-post',
    '/en/blog/not-a-published-post',
    '/newsletters/not-an-id',
    '/en/newsletters/not-an-id',
  ]) {
    const response = await fetch(new URL(pathname, baseUrl))
    assert.equal(response.status, 404, `${pathname} status`)
    const body = await response.text()
    const document = new JSDOM(body).window.document
    assert.match(
      requiredElement(
        document,
        'meta[name="robots"]',
        `${pathname} robots`,
      ).getAttribute('content') ?? '',
      /noindex/,
    )
    for (const element of document.querySelectorAll(
      'script, style, template, noscript',
    )) {
      element.remove()
    }
    const visibleText = document.body?.textContent ?? ''
    assert.match(visibleText, /This page slipped off the grid/)
    assert.match(visibleText, /Go home/)
    assert.doesNotMatch(
      visibleText,
      /(?:node_modules|\/Users\/|Error:|at\s+\w+\s*\()/,
    )
  }
}

async function verifyNoIndexUtilities(baseUrl) {
  const pages = [
    {
      path: '/confirm/legacy-token',
      title: 'Newsletter 确认链接已停用 | Amr Mohamed',
      description:
        '这个旧链接不会再读取或更新任何订阅信息。Newsletter 服务已经停止，你仍然可以通过 RSS 阅读网站更新。',
    },
    {
      path: '/en/confirm/legacy-token',
      title: 'Newsletter confirmation is retired | Amr Mohamed',
      description:
        'This old link no longer reads or updates subscriber information. The newsletter service has ended, but site updates remain available through RSS.',
    },
  ]

  for (const page of pages) {
    const response = await fetch(new URL(page.path, baseUrl))
    assert.equal(response.status, 200, `${page.path} status`)
    const document = new JSDOM(await response.text()).window.document
    assert.equal(document.title, page.title, `${page.path} title`)
    assert.equal(
      requiredElement(
        document,
        'meta[name="description"]',
        `${page.path} description`,
      ).getAttribute('content'),
      page.description,
    )
    const robots = requiredElement(
      document,
      'meta[name="robots"]',
      `${page.path} robots`,
    ).getAttribute('content') ?? ''
    assert.match(robots, /noindex/)
    assert.match(robots, /nofollow/)
  }
}

const server = await openProductionServer(process.env.PUBLIC_DISCOVERY_BASE_URL)
try {
  await verifyDiscoveryFiles(server.baseUrl)
  for (const page of publicPages) {
    await verifyMetadata(server.baseUrl, page)
  }
  await verifyNoIndexUtilities(server.baseUrl)
  await verifyNotFound(server.baseUrl)
  console.log(
    `Verified ${publicPages.length} public pages, discovery files, and failure handling against ${server.baseUrl}`,
  )
} finally {
  await server.stop()
}
