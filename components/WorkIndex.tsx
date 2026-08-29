'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import type { Work } from '@/lib/works'

const NAME = '장동호 디자이너'
const NAME_ROW = -1 // 이름 행. 프로젝트는 0..n-1

const INK = '#0a0a0a'
const MUTED = '#c4c4c4'
const EASE = [0.22, 1, 0.36, 1] as const
const DUR = 0.28
// 탭한 제목이 검정으로 물드는 걸 눈으로 확인할 만큼만 기다렸다가 이동한다.
// 색 전환(DUR 0.28s)이 끝나기 전에 출발해야 끊긴 느낌이 없다.
const TAP_DELAY = 200

export default function WorkIndex({ works }: { works: Work[] }) {
  const router = useRouter()
  const [active, setActive] = useState(0)
  const [isTouch, setIsTouch] = useState(false)
  // 터치에서 방금 누른 행. 평소엔 아무것도 강조하지 않는다(전부 회색).
  const [pressed, setPressed] = useState<number | null>(null)

  // 마우스가 없는 기기에서는 호버가 없으므로 강조 방식 자체가 다르다
  useEffect(() => {
    const mq = window.matchMedia('(hover: none)')
    const sync = () => setIsTouch(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const hover = (i: number) => (isTouch ? undefined : () => setActive(i))

  // 터치 — 탭하면 제목이 검정으로 바뀌는 걸 보여준 뒤 프로젝트로 넘어간다.
  // href는 <Link>에 그대로 남겨둔다(프리페치·새 탭·크롤러). 터치일 때만 가로챈다.
  const tap = (i: number, href: string) => (e: React.MouseEvent) => {
    if (!isTouch) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    setPressed(i)
    window.setTimeout(() => router.push(href), TAP_DELAY)
  }

  // 강조 판정 — 데스크탑은 호버 중인 행, 터치는 방금 탭한 행
  const isOn = (i: number) => (isTouch ? pressed === i : active === i)
  const current = active === NAME_ROW ? null : works[active]

  return (
    <main className="relative flex min-h-[100svh] flex-col px-[5vw] py-[5vh] md:px-[4vw] xl:px-[3.2vw] xl:py-[4vh]">
      {/* 하단 여백은 두지 않는다.
          - 데스크탑(xl) — 썸네일은 화면 우측 하단에 떠 있고, 그 높이 대역까지
            내려오는 건 제목이 짧은 아래쪽 행들뿐이라 겹치지 않는다.
            리스트는 내용 높이 그대로 두고 자연스럽게 스크롤되게 한다.
          - 터치(<xl) — 13개 행이 화면 절반밖에 못 채워서 아래가 휑하게 비었다.
            (제목은 clamp 최솟값 16.8px에 걸려 있고, 그 크기에서 이미 가장 긴
             행이 가로를 거의 다 쓰므로 키울 수도 없다.)
            flex-1 + justify-between으로 남는 높이를 행 사이에 고르게 나눠
            리스트가 화면을 꽉 채우게 한다. index-row-gap이 최소 간격 역할을
            하므로, 작업이 늘어 내용이 화면보다 커지면 저절로 원래대로 돌아간다. */}
      <ul className="index-row-gap flex flex-1 flex-col justify-between xl:flex-none xl:justify-start">
        {/* ── 이름 (프로젝트와 같은 크기, 맨 위) ── */}
        <li>
          <Row
            href="/about"
            title={NAME}
            category="PROFILE"
            num="00"
            activeState={isOn(NAME_ROW)}
            onHover={hover(NAME_ROW)}
            onFocus={() => setActive(NAME_ROW)}
            onClick={tap(NAME_ROW, '/about')}
          />
        </li>

        {/* ── 프로젝트 ── */}
        {works.map((w, i) => (
          <li key={w.slug}>
            <Row
              href={`/works/${w.slug}`}
              title={w.title}
              category={w.category}
              num={w.n}
              activeState={isOn(i)}
              onHover={hover(i)}
              onFocus={() => setActive(i)}
              onClick={tap(i, `/works/${w.slug}`)}
            />
          </li>
        ))}
      </ul>

      {/* ── 썸네일 (우측 하단 고정, 1:1) ──
          호버로 항목을 고르는 환경(xl 이상)에서만 띄운다. 그 아래는 터치라
          가리킬 수단이 없어 썸네일이 보여줄 것도 없다.

          크기는 400px 고정 — 창 폭에 따라 줄이지 않는다. 예전엔 제목을
          침범할까 봐 20.83vw로 줄였는데, 실측해 보니 썸네일 높이 대역까지
          닿는 건 제목이 짧은 아래쪽 행들뿐이라 1280px에서도 최소 26px 여유가
          남는다(긴 제목인 참이슬·locl은 리스트 위쪽이라 최대 스크롤로도
          닿지 못한다). 오프셋 2.08vw는 그대로 둔다 — 48px 고정으로 바꾸면
          1280px에서 그 26px 여유가 4px까지 줄어든다. */}
      <div className="pointer-events-none fixed z-10 hidden xl:block xl:bottom-[2.08vw] xl:right-[2.08vw]">
        <div className="relative aspect-square w-[400px] overflow-hidden rounded-[24px] bg-white shadow-[0_18px_60px_-18px_rgba(0,0,0,0.28)] ring-1 ring-black/[0.05]">
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
  onClick,
}: {
  href: string
  title: string
  category: string
  num: string
  activeState: boolean
  onHover?: () => void
  onFocus: () => void
  onClick?: (e: React.MouseEvent) => void
}) {
  const t = { duration: DUR, ease: EASE }
  return (
    <Link
      href={href}
      onMouseEnter={onHover}
      onFocus={onFocus}
      onClick={onClick}
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
        sizes="400px"
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
