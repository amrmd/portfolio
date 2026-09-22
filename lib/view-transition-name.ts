export type PostTransitionElement = 'cover' | 'title'

function postTransitionId(slug: string) {
  switch (slug) {
    case 'image-based-prompt-injection':
      return 'p01'
    default:
      throw new Error('Unknown post view-transition slug')
  }
}

// View-transition names are CSS identifiers. Keep every stored content key
// behind an explicit allowlist before it reaches an inline style value.
export function postViewTransitionName(
  element: PostTransitionElement,
  slug: string,
) {
  return `${element}-${postTransitionId(slug)}`
}
