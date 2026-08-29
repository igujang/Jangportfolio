'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
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
    // 선택 기준선을 화면 정중앙(50%)이 아니라 아래쪽(65%)에 둔다.
    // 기준선이 아래로 내려갈수록 마지막 항목이 그 지점까지 닿는 데 필요한
    // 스크롤 여유(=하단 여백)가 줄어든다 — 썸네일을 위해 비워뒀던 큰 공백을
    // 없애면서도 스크롤로 선택되는 느낌은 그대로 유지하기 위함.
    const line = window.innerHeight * 0.65
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
          - 모바일(터치) — 기준선을 65%로 내린 덕분에 예전 50vh보다
            훨씬 적은 여유만 있어도 마지막 항목이 선택된다.
          - 데스크탑(호버) — 우측 하단 썸네일에 가리지 않을 정도만 남긴다.
            (무한 루프 대신 유한한 목록으로 가되, 끝난 뒤 여백만
            덩그러니 남지 않게 한다) */}
      <ul
        className="index-row-gap flex flex-col"
        style={{ paddingBottom: isTouch ? '35vh' : 'clamp(200px, 24vw, 460px)' }}
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

      {/* ── 썸네일 (우측 하단 고정, 1:1) ──
          모바일에서는 숨긴다 — 화면이 좁아 리스트와 겹쳐 보이고,
          태블릿 이상에서만 노출해도 충분하다. */}
      <div className="pointer-events-none fixed z-10 hidden md:block md:bottom-[48px] md:right-[48px] xl:bottom-[2.08vw] xl:right-[2.08vw]">
        <div className="relative aspect-square w-[200px] overflow-hidden rounded-[24px] bg-white shadow-[0_18px_60px_-18px_rgba(0,0,0,0.28)] ring-1 ring-black/[0.05] xl:w-[clamp(280px,20.83vw,400px)]">
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

/**
 * 제목이 줄바꿈되지 않도록, 자기 행(li) 폭에 맞춰 폰트 크기를 줄인다.
 * 긴 제목(예: "대학교, 기업 교육 및 행사 디자인")은 모바일 폭에서
 * CSS clamp의 최소값으로도 한 줄에 안 들어가 줄바꿈됐었다.
 * 실제로 필요한 만큼만 줄이므로 짧은 제목은 원래 크기 그대로 유지된다.
 */
function useFitTitle(text: string) {
  const ref = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const fit = () => {
      const row = el.closest('li')
      if (!row) return
      el.style.fontSize = '' // CSS clamp 기준값으로 리셋 후 다시 측정 (화면이 넓어지면 원래 크기로 복귀)
      const available = row.clientWidth
      const needed = el.scrollWidth
      if (needed > available && available > 0) {
        const current = parseFloat(getComputedStyle(el).fontSize)
        el.style.fontSize = `${Math.floor(current * (available / needed) * 0.98)}px`
      }
    }

    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [text])

  return ref
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
  const titleRef = useFitTitle(title)
  return (
    <Link
      href={href}
      onMouseEnter={onHover}
      onFocus={onFocus}
      className="flex flex-wrap items-center gap-x-[clamp(0.55rem,1.1vw,1.6rem)] gap-y-1 outline-none"
    >
      <motion.span
        ref={titleRef}
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
