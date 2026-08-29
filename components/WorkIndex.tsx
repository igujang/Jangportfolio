'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import type { Work } from '@/lib/works'

const NAME = '장동호 디자이너'
const NAME_ROW = -1 // 이름 행. 프로젝트는 0..n-1

const INK = '#0a0a0a'
const MUTED = '#c4c4c4'
const EASE = [0.22, 1, 0.36, 1] as const
const DUR = 0.28

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

  const syncByScroll = useCallback(() => {
    // 맨 위이거나 스크롤이 없으면 중앙선이 엉뚱한 항목을 집으므로 첫 항목을 보여준다
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
    <main className="relative min-h-[100svh] px-[5vw] py-[5vh] md:px-[4vw] xl:px-[3.2vw] xl:py-[4vh]">
      {/* 하단 여백:
          - 모바일(터치) — 스크롤로 마지막 항목을 화면 중앙까지 끌어올려야
            선택되므로 화면 절반만큼 필요하다.
          - 데스크탑(호버) — 그 이유가 없으니 우측 하단 썸네일에 가리지
            않을 정도만 남긴다. 안 그러면 리스트 끝난 뒤 여백만 덩그러니
            남아 보인다(무한 루프 대신 택한 방식). */}
      <ul
        className="index-row-gap flex flex-col"
        style={{ paddingBottom: isTouch ? '50vh' : 'clamp(200px, 24vw, 460px)' }}
      >
        {/* ── 이름 (프로젝트와 같은 크기, 맨 위) ── */}
        <li
          ref={(el) => {
            rowRefs.current[0] = el
          }}
        >
          <Row
            href="/about"
            title={NAME}
            category="PROFILE"
            num="00"
            activeState={active === NAME_ROW}
            onHover={hover(NAME_ROW)}
            onFocus={() => setActive(NAME_ROW)}
          />
        </li>

        {/* ── 프로젝트 ── */}
        {works.map((w, i) => (
          <li
            key={w.slug}
            ref={(el) => {
              rowRefs.current[i + 1] = el
            }}
          >
            <Row
              href={`/works/${w.slug}`}
              title={w.title}
              category={w.category}
              num={w.n}
              activeState={active === i}
              onHover={hover(i)}
              onFocus={() => setActive(i)}
            />
          </li>
        ))}
      </ul>

      {/* ── 썸네일 (우측 하단 고정, 1:1) ── */}
      <div className="pointer-events-none fixed bottom-[4vh] right-[5vw] z-10 xl:bottom-[2.08vw] xl:right-[2.08vw]">
        <div className="relative aspect-square w-[148px] overflow-hidden rounded-[16px] bg-white shadow-[0_18px_60px_-18px_rgba(0,0,0,0.28)] ring-1 ring-black/[0.05] sm:w-[200px] md:w-[280px] md:rounded-[24px] xl:w-[clamp(280px,20.83vw,400px)] xl:rounded-[24px]">
          {/* mode="wait" 제거 — 이전 것이 사라진 뒤에 다음 것이 뜨면 교체가
              느려 보인다. 겹쳐서 동시에 크로스페이드되게 한다. */}
          <AnimatePresence>
            <motion.div
              key={current?.slug ?? 'profile'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
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

function Row({
  href,
  title,
  category,
  num,
  activeState,
  onHover,
  onFocus,
}: {
  href: string
  title: string
  category: string
  num: string
  activeState: boolean
  onHover?: () => void
  onFocus: () => void
}) {
  const t = { duration: DUR, ease: EASE }
  return (
    <Link
      href={href}
      onMouseEnter={onHover}
      onFocus={onFocus}
      className="flex flex-wrap items-center gap-x-[clamp(0.55rem,1.1vw,1.6rem)] gap-y-1 outline-none"
    >
      <motion.span
        animate={{ color: activeState ? INK : MUTED }}
        transition={t}
        className="index-title"
      >
        {title}
      </motion.span>

      <motion.span
        animate={{
          backgroundColor: activeState ? '#e4e4e4' : '#f2f2f2',
          color: activeState ? '#3d3d3d' : '#bdbdbd',
        }}
        transition={t}
        className="index-chip shrink-0 rounded-full"
      >
        {category}
      </motion.span>

      <motion.span
        animate={{ color: activeState ? '#8a8a8a' : '#d6d6d6' }}
        transition={t}
        className="index-num shrink-0 tabular-nums"
      >
        [{num}]
      </motion.span>
    </Link>
  )
}

function ThumbBody({ work }: { work: Work | null }) {
  // 이름 행 — 프로필 사진
  if (!work) {
    return (
      <Image
        src="/profile.jpg"
        alt="장동호"
        fill
        sizes="(max-width: 768px) 40vw, 420px"
        className="object-cover"
        priority
      />
    )
  }

  // 아직 썸네일이 없는 프로젝트
  if (!work.thumb) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#f4f4f4]">
        <span className="text-[clamp(1.6rem,3vw,3rem)] font-bold tabular-nums text-[#dcdcdc]">
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
      sizes="(max-width: 768px) 40vw, 420px"
      className="object-cover"
      priority
    />
  )
}
