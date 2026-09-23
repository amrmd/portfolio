export type OgZolplayEndpoint = 'metadata' | 'favicon'

export interface LinkPreviewSnapshot {
  domain: string
  title?: string
  titleEn?: string
  description?: string
  descriptionEn?: string
}

export function ogZolplayUrl(endpoint: OgZolplayEndpoint, target: string): string | null

export function publicHttpUrl(target: string): URL | null

export function normalizeOgMetadata(
  target: string,
  metadata: unknown,
  previous?: LinkPreviewSnapshot,
): LinkPreviewSnapshot | undefined
