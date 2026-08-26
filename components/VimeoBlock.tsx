'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * 비메오 임베드.
 * 화면에 가까워질 때 비로소 iframe을 올린다 — 영상이 10개 넘는 프로젝트에서
 * 처음부터 전부 불러오면 페이지가 무거워지기 때문.
 *
 *  loop = true  → background 모드: 자동재생 · 무음 · 무한반복 · 컨트롤 없음
 *  loop = false → 일반 플레이어: 클릭 재생 · 소리 있음
 */
export default function VimeoBlock({
  id,
  loop,
  w,
  h,
}: {
  id: string
  loop: boolean
  w: number
  h: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true)
          io.disconnect()
        }
      },
      { rootMargin: '600px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const src = loop
    ? `https://player.vimeo.com/video/${id}?background=1&autoplay=1&loop=1&muted=1&autopause=0`
    : `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0&loop=1&autopause=0&dnt=1`

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden bg-[#f6f6f6]"
      style={{ aspectRatio: `${w} / ${h}` }}
    >
      {show && (
        <iframe
          src={src}
          title={`vimeo-${id}`}
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      )}
    </div>
  )
}
