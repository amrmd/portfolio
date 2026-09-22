// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import social from '~/content/social.json'

import { InstagramCardBody, TikTokCardBody } from './social-cards'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} />
  ),
}))

afterEach(cleanup)

describe('Instagram hover card', () => {
  it('renders the current name and handle', () => {
    const { container } = render(<InstagramCardBody data={social.instagram} />)

    expect(container.textContent).toContain(social.instagram.name)
    expect(container.textContent).toContain(`@${social.instagram.handle}`)
  })
})

describe('TikTok hover card', () => {
  it('renders the current name and handle', () => {
    const { container } = render(<TikTokCardBody data={social.tiktok} />)

    expect(container.textContent).toContain(social.tiktok.name)
    expect(container.textContent).toContain(`@${social.tiktok.handle}`)
  })
})
