import data from '@/content/works.json'
import profile from '@/content/profile.json'

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
  /** 상세 페이지에서 이미지 사이 세로 간격(px) */
  gap: number
  /** 목록에는 남기되 내용은 비워둔 프로젝트 */
  blank?: boolean
  /** 수상·선정 표기 (있으면 본문 맨 아래에 뱃지로 노출) */
  award?: string
  thumb: Thumb
  blocks: Block[]
}

export const works = data as Work[]

export const OWNER = '장동호'

/** 프로필 사진 주소 — 내용 해시가 붙어 있어 사진을 바꾸면 주소도 바뀐다.
 *  (파일명이 그대로면 브라우저가 예전 사진을 계속 보여준다) */
export const PROFILE_SRC = profile.profile
export const AVATAR_SRC = profile.avatar

export function getWork(slug: string) {
  return works.find((w) => w.slug === slug)
}

const indexOf = (slug: string) => works.findIndex((w) => w.slug === slug)

/** 다음 프로젝트 (마지막이면 처음으로 순환) */
export function getNext(slug: string) {
  const i = indexOf(slug)
  return i === -1 ? null : works[(i + 1) % works.length]
}

/** 이전 프로젝트 (처음이면 마지막으로 순환) */
export function getPrev(slug: string) {
  const i = indexOf(slug)
  return i === -1 ? null : works[(i - 1 + works.length) % works.length]
}
