'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import type { Work } from '@/lib/works'

const NAME = '장동호 디자이너'
const NAME_ROW = -1 // 이름 행. 프로젝트는 0..n-1

const INK = '#0a0a0a'
const MUTED = '#c4c4c4'
const EASE = [0.22, 1, 0.36, 1] as const
const DUR = 0.28
// 탭 → 제목이 검정으로 물들고 썸네일이 떠올라 한 박자 머무를 시간.
// 260ms로 해 봤더니 썸네일이 떴는지도 모를 만큼 빨리 지나갔다.
const TAP_DELAY = 620

export default function WorkIndex({ works }: { works: Work[] }) {
  const router = useRouter()
  const pathname = usePathname()
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

  // 모달을 닫고 인덱스로 돌아오면 탭 흔적(검정 제목·썸네일)을 지운다.
  // 모달이 열려 있는 동안(pathname !== '/')은 그대로 둔다 — 어차피 가려진다.
  useEffect(() => {
    if (pathname === '/') setPressed(null)
  }, [pathname])

  const hover = (i: number) => (isTouch ? undefined : () => setActive(i))

  // 터치 — 탭하면 제목이 검정으로 물들고 썸네일이 떠오른 뒤 프로젝트로 넘어간다.
  // href는 <Link>에 그대로 남겨둔다(프리페치·새 탭·크롤러). 터치일 때만 가로챈다.
  const tap = (i: number, href: string) => (e: React.MouseEvent) => {
    if (!isTouch) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    setPressed(i)
    window.setTimeout(() => router.push(href), TAP_DELAY)
  }

  // 강조 판정 — 데스크탑은 호버 중인 행.
  // 터치는 아무것도 안 눌렀을 때 이름 행이 검정이고 나머지는 회색이다.
  // 프로젝트를 탭하면 검정이 그쪽으로 옮겨가고, 모달을 닫고 돌아오면
  // (pressed가 null로 돌아가면서) 다시 이름 행으로 되돌아온다.
  const isOn = (i: number) =>
    isTouch ? (pressed === null ? i === NAME_ROW : pressed === i) : active === i
  const workAt = (i: number) => (i === NAME_ROW ? null : works[i])

  return (
    <main className="relative min-h-[100svh] px-[5vw] py-[5vh] md:px-[4vw] xl:px-[3.2vw] xl:py-[4vh]">
      {/* 행 간격은 index-row-gap 하나로 끝낸다. 터치에서 화면 높이에 맞춰
          간격을 벌려 봤더니(flex-1 + justify-between) 45px씩 떠서 리스트가
          성글어 보였다 — 아래에 여백이 남더라도 간격을 유지하는 편이 낫다. */}
      <ul className="index-row-gap flex flex-col">
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

      {/* ── 썸네일 · 데스크탑 (우측 하단 고정, 호버를 따라감) ──
          크기는 400px 고정 — 창 폭에 따라 줄이지 않는다. 예전엔 제목을
          침범할까 봐 20.83vw로 줄였는데, 실측해 보니 썸네일 높이 대역까지
          닿는 건 제목이 짧은 아래쪽 행들뿐이라 1280px에서도 최소 26px 여유가
          남는다(긴 제목인 참이슬·locl은 리스트 위쪽이라 최대 스크롤로도
          닿지 못한다). 오프셋 2.08vw는 그대로 둔다 — 48px 고정으로 바꾸면
          1280px에서 그 26px 여유가 4px까지 줄어든다. */}
      <div className="pointer-events-none fixed bottom-[2.08vw] right-[2.08vw] z-10 hidden xl:block">
        <ThumbCard work={workAt(active)} className="w-[400px]" />
      </div>

      {/* ── 썸네일 · 터치 (탭한 순간에만 잠깐) ──
          태블릿·모바일에는 호버가 없어서 썸네일을 가만히 띄워 두면 무엇을
          가리키는 건지 알 수 없다. 그래서 평소엔 감춰 두고, 탭하는 순간
          그 프로젝트 썸네일이 떠올랐다가 곧바로 모달로 이어지게 한다.
          — 선택 표시기가 아니라 진입 연출의 일부다.
          화면 폭의 60%(최대 360px). 리스트 글자 위에 걸치지만 TAP_DELAY
          동안만 보이고 바로 모달이 덮으므로 문제되지 않는다. */}
      <AnimatePresence>
        {pressed !== null && (
          <motion.div
            key="tap-thumb"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="pointer-events-none fixed bottom-[24px] right-[24px] z-10 xl:hidden"
          >
            <ThumbCard work={workAt(pressed)} className="w-[min(60vw,360px)]" />
          </motion.div>
        )}
      </AnimatePresence>
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
      className="flex flex-wrap items-center gap-x-[clamp(0.3rem,1.1vw,1.6rem)] gap-y-1 outline-none"
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

/** 둥근 흰 상자 안에 썸네일 하나. 데스크탑·터치가 같은 모양을 쓴다. */
function ThumbCard({ work, className }: { work: Work | null; className: string }) {
  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-[24px] bg-white shadow-[0_18px_60px_-18px_rgba(0,0,0,0.28)] ring-1 ring-black/[0.05] ${className}`}
    >
      {/* mode="wait" 제거 — 이전 것이 사라진 뒤에 다음 것이 뜨면 교체가
          느려 보인다. 겹쳐서 동시에 크로스페이드되게 한다. */}
      <AnimatePresence>
        <motion.div
          key={work?.slug ?? 'profile'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="absolute inset-0"
        >
          <ThumbBody work={work} />
        </motion.div>
      </AnimatePresence>
    </div>
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
