import data from '@/content/works.json'

export type Block =
  | { type: 'image'; src: string; w: number; h: number }
  | { type: 'video'; src: string; w: number; h: number }
  | { type: 'vimeo'; id: string; loop: boolean; w: number; h: number }

export type Thumb = { type: 'image' | 'video'; src: string; w: number; h: number } | null

export type Work = {
  n: string
  dir: string
  slug: string
  title: string
  category: string
  thumb: Thumb
  blocks: Block[]
}

export const works = data as Work[]

export function getWork(slug: string) {
  return works.find((w) => w.slug === slug)
}

/** 다음 프로젝트 (마지막이면 처음으로 순환) */
export function getNext(slug: string) {
  const i = works.findIndex((w) => w.slug === slug)
  if (i === -1) return null
  return works[(i + 1) % works.length]
}
