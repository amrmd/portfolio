'use client'

import Image from 'next/image'

import { ExternalLabel } from '~/components/external-mark'
import { SitePreviewCard } from '~/components/preview-card-timing'
import { T } from '~/lib/i18n'

export interface SocialSnapshot {
  name: string
  handle: string
  bio: string
  bioEn: string
  followers?: string
  following?: string
}

export interface GitHubSnapshot {
  user: string
  followers?: number
  total: number
  to: string
  levels: string
}

// heatmap shows the recent ~180 days (26 weeks); the stat below still
// counts the full past year
const WEEKS = 26
const DAYS = 7

export const GLYPHS: Record<string, { path: string; color?: string }> = {
  telegram: {
    path: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
    color: '#2AABEE',
  },
  github: {
    path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  },
  instagram: {
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 9.999a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z',
  },
  tiktok: {
    path: 'M16.6 5.82c-1.01-.98-1.66-2.27-1.83-3.7V2h-3.6v13.52a2.6 2.6 0 1 1-1.84-2.48V9.2a6.06 6.06 0 0 0-1.06-.09A6.15 6.15 0 1 0 14.34 15V8.85a8.25 8.25 0 0 0 4.83 1.55V6.72c-.94 0-1.85-.32-2.57-.9z',
  },
}

function Glyph({ service }: { service: keyof typeof GLYPHS }) {
  const { path, color } = GLYPHS[service]
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden
      className="service-card-glyph"
      style={color ? { color } : undefined}
    >
      <path fill="currentColor" d={path} />
    </svg>
  )
}

function Card({
  trigger,
  href,
  children,
  className,
  triggerClassName = 'footer-tree-link',
}: {
  trigger: React.ReactNode
  href: string
  children: React.ReactNode
  className: string
  triggerClassName?: string
}) {
  return (
    <SitePreviewCard
      href={href}
      target="_blank"
      rel="noreferrer"
      triggerClassName={triggerClassName}
      closeDelay={120}
      popupClassName={className}
      popup={children}
      side="top"
    >
      <ExternalLabel>{trigger}</ExternalLabel>
    </SitePreviewCard>
  )
}

function Identity({
  data,
  avatar,
  service,
  withBio = true,
}: {
  data: SocialSnapshot
  avatar: string
  service: keyof typeof GLYPHS
  withBio?: boolean
}) {
  return (
    <>
      <span className="service-card-head">
        <Image
          src={avatar}
          alt=""
          width={40}
          height={40}
          className="service-card-avatar"
        />
        <span className="service-card-names">
          <span className="service-card-name">{data.name}</span>
          <span className="service-card-sub">@{data.handle}</span>
        </span>
        <Glyph service={service} />
      </span>
      {withBio && (
        <span className="service-card-bio">
          <T zh={data.bio} en={data.bioEn} />
        </span>
      )}
    </>
  )
}

// Per-service hover cards for the chrome's social links. Server rendering
// supplies ISR-backed values with content/social.json and content/github.json
// as fallbacks; an open card never touches the network. Touch devices just
// follow the link. Bodies are exported separately so other triggers can serve
// the same cards.
export function InstagramCardBody({ data }: { data: SocialSnapshot }) {
  return <Identity data={data} avatar="/images/avatar.png" service="instagram" withBio={false} />
}

export function TikTokCardBody({ data }: { data: SocialSnapshot }) {
  return <Identity data={data} avatar="/images/avatar.png" service="tiktok" withBio={false} />
}

export function XiaohongshuCardBody() {
  return (
    <span className="xiaohongshu-card-content" data-profile-id="5cbba503000000001101b6a2">
      <span className="service-card-head">
        <Image
          src="/images/headshot.jpg"
          alt=""
          width={40}
          height={40}
          className="service-card-avatar"
        />
        <span className="service-card-names">
          <span className="service-card-name">Amr Mohamed</span>
          <span className="service-card-sub">小红书号 calicastle</span>
        </span>
        <span className="service-card-glyph xiaohongshu-card-wordmark" aria-hidden>
          <Image
            src="/images/xiaohongshu-wordmark.svg"
            alt=""
            width={48}
            height={23}
          />
        </span>
      </span>
      <span className="service-card-bio xiaohongshu-card-bio">
        <span>设计工程师，Cali 宝宝 app 开发者设计师</span>
        <span>@佐玩 Zolplay 创始人 CEO</span>
      </span>
      <span className="service-card-stat">
        <span>
          <b>10+</b> 粉丝
        </span>
        <span aria-hidden>·</span>
        <span>
          <b>1千+</b> 获赞与收藏
        </span>
      </span>
    </span>
  )
}

export function TelegramCardBody({ data }: { data: SocialSnapshot }) {
  return <Identity data={data} avatar="/images/avatar.png" service="telegram" withBio={false} />
}

export function GitHubCardBody({ data }: { data: GitHubSnapshot }) {
  const levels = data.levels.slice(-WEEKS * DAYS)
  return (
    <>
      <span className="contrib-grid" aria-hidden>
        {Array.from({ length: WEEKS }, (_, w) => (
          <span key={w} className="contrib-col">
            {Array.from({ length: DAYS }, (_, d) => {
              const i = w * DAYS + d
              return (
                <i
                  key={d}
                  data-level={levels[i] ?? '0'}
                  style={{ '--ci': i } as React.CSSProperties}
                />
              )
            })}
          </span>
        ))}
      </span>
      <span className="service-card-stat">
        <span>
          <b>{data.total.toLocaleString()}</b> <T zh="次贡献" en="contributions" />
        </span>
        {data.followers != null && (
          <>
            <span aria-hidden>·</span>
            <span>
              <b>{data.followers}</b> <T zh="关注者" en="followers" />
            </span>
          </>
        )}
        <Glyph service="github" />
      </span>
    </>
  )
}

export function InstagramCard({ data }: { data: SocialSnapshot }) {
  return (
    <Card trigger="Instagram" href={`https://instagram.com/${data.handle}`} className="link-card service-card">
      <InstagramCardBody data={data} />
    </Card>
  )
}

export function TikTokCard({ data }: { data: SocialSnapshot }) {
  return (
    <Card trigger="TikTok" href={`https://tiktok.com/@${data.handle}`} className="link-card service-card">
      <TikTokCardBody data={data} />
    </Card>
  )
}

export function TelegramCard({ data }: { data: SocialSnapshot }) {
  return (
    <Card trigger="Telegram" href={`https://t.me/${data.handle}`} className="link-card service-card">
      <TelegramCardBody data={data} />
    </Card>
  )
}

export function GitHubCard({
  data,
  trigger = 'GitHub',
  triggerClassName,
}: {
  data: GitHubSnapshot
  trigger?: React.ReactNode
  triggerClassName?: string
}) {
  return (
    <Card
      trigger={trigger}
      href={`https://github.com/${data.user}`}
      className="link-card service-card"
      triggerClassName={triggerClassName}
    >
      <GitHubCardBody data={data} />
    </Card>
  )
}

export function XiaohongshuCard({
  trigger = '小红书',
  triggerClassName,
}: {
  trigger?: React.ReactNode
  triggerClassName?: string
}) {
  return (
    <Card
      trigger={trigger}
      href="https://xhslink.com/m/7vluP5ANiNE"
      className="link-card service-card xiaohongshu-card"
      triggerClassName={triggerClassName}
    >
      <XiaohongshuCardBody />
    </Card>
  )
}

// Email's card is the front of a mailed envelope: stamps, cancellation
// marks, sender, recipient, and folded seams. Purely visual; the trigger
// itself opens mailto:.
export function EmailCard({
  address,
  trigger = 'Email',
  triggerClassName = 'footer-tree-link',
}: {
  address: string
  trigger?: React.ReactNode
  triggerClassName?: string
}) {
  return (
    <SitePreviewCard
      href={`mailto:${address}`}
      triggerClassName={triggerClassName}
      closeDelay={120}
      popupClassName="link-card email-envelope-card"
      side="top"
      popup={
        <span className="email-envelope" aria-hidden>
          <span className="email-envelope-flap" />
          <span className="email-envelope-return">
            <span>FROM</span>
            AMR MOHAMED
            <br />
            HANOI
          </span>
          <span className="email-envelope-stamps">
            <span className="email-envelope-stamp email-envelope-stamp-portrait">
              <Image src="/images/avatar.png" alt="" width={32} height={32} />
              <span>AMR · 20</span>
            </span>
            <span className="email-envelope-stamp email-envelope-stamp-mark">
              <span className="email-envelope-stamp-star">✦</span>
              <span>POST · 26</span>
            </span>
          </span>
          <span className="email-envelope-postmark" />
          <span className="email-envelope-address">
            <span><T zh="收" en="TO" /></span>
            {address}
          </span>
        </span>
      }
    >
      {trigger}
    </SitePreviewCard>
  )
}
