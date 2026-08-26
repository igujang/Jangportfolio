'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import type { Work } from '@/lib/works'

const NAME = '장동호 디자이너'

/** 이름 행을 -1, 프로젝트를 0..n-1 로 표현한다 */
const NAME_ROW = -1

export default function WorkIndex({ works }: { works: Work[] }) {
  const [active, setActive] = useState(0)
  const [isTouch, setIsTouch] = useState(false)
  const rowRefs = useRef<(HTMLElement | null)[]>([])

  // 마우스가 없는 기기에서는 호버 대신 스크롤 위치로 선택한다
  useEffect(() => {
    const mq = window.matchMedia('(hover: none)')
    const sync = () => setIsTouch(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // 모바일: 화면 중앙 '선택 라인'에 가장 가까운 항목을 활성화
  const syncByScroll = useCallback(() => {
    // 맨 위에 있거나 스크롤이 없는 화면에서는 중앙선이 엉뚱한 항목을 집으므로 첫 항목을 보여준다
    if (window.scrollY < 12 || document.documentElement.scrollHeight <= window.innerHeight + 8) {
      setActive(0)
      return
    }
    const line = window.innerHeight / 2
    let best = 0
    let bestDist = Infinity
    rowRefs.current.forEach((el, i) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      const d = Math.abs(r.top + r.height / 2 - line)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    // rowRefs 0번은 이름 행, 1번부터가 프로젝트
    setActive(best === 0 ? NAME_ROW : best - 1)
  }, [])

  useEffect(() => {
    if (!isTouch) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(syncByScroll)
    }
    syncByScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [isTouch, syncByScroll])

  const hover = (i: number) => (isTouch ? undefined : () => setActive(i))
  const current = active === NAME_ROW ? null : works[active]

  return (
    <main className="relative min-h-[100svh] px-[5vw] py-[6vh] md:px-[4vw] md:py-[7vh]">
      {/* ── 이름 (최상단 고정) ── */}
      <Link
        href="/about"
        ref={(el) => {
          rowRefs.current[0] = el
        }}
        onMouseEnter={hover(NAME_ROW)}
        className="group mb-[6vh] inline-block md:mb-[8vh]"
      >
        <motion.span
          animate={{ color: active === NAME_ROW ? '#0a0a0a' : '#c4c4c4' }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="text-[1rem] font-bold tracking-tight md:text-[1.25rem] xl:text-[clamp(1.35rem,1.35vw,1.75rem)]"
        >
          {NAME}
        </motion.span>
      </Link>

      {/* ── 프로젝트 목록 ── */}
      <ul className="flex flex-col gap-[0.85rem] pb-[42vh] md:gap-[clamp(0.9rem,1.6vh,1.4rem)] md:pb-[34vh] xl:gap-[clamp(1rem,1.9vh,1.7rem)] xl:pb-[8vh]">
        {works.map((w, i) => (
          <li
            key={w.slug}
            ref={(el) => {
              rowRefs.current[i + 1] = el
            }}
          >
            <Link
              href={`/works/${w.slug}`}
              onMouseEnter={hover(i)}
              onFocus={() => setActive(i)}
              className="flex flex-wrap items-baseline gap-x-[clamp(0.6rem,1.1vw,1.5rem)] gap-y-1 outline-none"
            >
              <motion.span
                animate={{ color: active === i ? '#0a0a0a' : '#c4c4c4' }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="text-[1.12rem] font-bold leading-[1.2] tracking-[-0.02em] md:text-[1.85rem] md:leading-[1.15] xl:text-[clamp(2rem,2.55vw,2.6rem)]"
              >
                {w.title}
              </motion.span>

              <motion.span
                animate={{
                  backgroundColor: active === i ? '#e4e4e4' : '#f2f2f2',
                  color: active === i ? '#3d3d3d' : '#bdbdbd',
                }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="shrink-0 rounded-full px-[0.7em] py-[0.32em] text-[0.56rem] font-semibold tracking-[0.08em] md:text-[0.62rem] xl:text-[clamp(0.62rem,0.62vw,0.72rem)]"
              >
                {w.category}
              </motion.span>

              <motion.span
                animate={{ color: active === i ? '#8a8a8a' : '#d6d6d6' }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="shrink-0 text-[0.62rem] font-medium tabular-nums md:text-[0.72rem] xl:text-[clamp(0.72rem,0.72vw,0.85rem)]"
              >
                [{w.n}]
              </motion.span>
            </Link>
          </li>
        ))}
      </ul>

      {/* ── 썸네일 (우측 하단 고정, 1:1) ── */}
      <div className="pointer-events-none fixed bottom-[4vh] right-[5vw] z-10 md:bottom-[48px] md:right-[48px]">
        <div className="relative aspect-square w-[148px] overflow-hidden rounded-[16px] sm:w-[190px] md:w-[264px] md:rounded-[24px] xl:w-[clamp(300px,21vw,400px)] xl:rounded-[clamp(24px,1.8vw,34px)] bg-white shadow-[0_18px_60px_-18px_rgba(0,0,0,0.28)] ring-1 ring-black/[0.05]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current?.slug ?? 'about'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <ThumbBody work={current} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}

function ThumbBody({ work }: { work: Work | null }) {
  // 이름에 호버했을 때
  if (!work) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0a0a0a]">
        <span className="text-[clamp(0.7rem,0.9vw,1rem)] font-semibold tracking-[0.14em] text-white">
          ABOUT →
        </span>
      </div>
    )
  }

  // 아직 썸네일을 만들지 않은 프로젝트
  if (!work.thumb) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#f4f4f4]">
        <span className="text-[clamp(1.6rem,3vw,3rem)] font-bold text-[#dcdcdc] tabular-nums">
          {work.n}
        </span>
        <span className="text-[clamp(0.5rem,0.62vw,0.68rem)] font-semibold tracking-[0.12em] text-[#c8c8c8]">
          {work.category}
        </span>
      </div>
    )
  }

  if (work.thumb.type === 'video') {
    return (
      <video
        key={work.thumb.src}
        src={work.thumb.src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="h-full w-full object-cover"
      />
    )
  }

  return (
    <Image
      src={work.thumb.src}
      alt={work.title}
      fill
      sizes="(max-width: 768px) 40vw, 400px"
      className="object-cover"
      priority
    />
  )
}
