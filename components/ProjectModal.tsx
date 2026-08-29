'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * 비핸스식 프로젝트 창.
 *
 *  데스크탑 — 어두운 배경 위에 1400px 흰 패널.
 *             닫기 X는 화면 우측 상단(패널 밖), 이전/다음은 좌우 하단 원형 버튼.
 *  모바일   — 전체화면. 흰 헤더에 제목·프로필·닫기 버튼.
 *
 *  닫기: X 버튼 · 배경 클릭 · ESC
 */
export default function ProjectModal({
  title,
  owner,
  prev,
  next,
  children,
}: {
  title: string
  owner: string
  prev: { slug: string; title: string } | null
  next: { slug: string; title: string } | null
  children: React.ReactNode
}) {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const close = () => router.back()

  // ESC로 닫기 + 뒤 페이지 스크롤 잠금
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('modal-open')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 프로젝트를 바꾸면 맨 위로
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [title])

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50">
      {/* 어두운 배경 — 페이드만 한다.
          확대되는 레이어와 분리해야 한다. 한 겹으로 두고 scale을 걸면
          축소 상태(0.94)에서 화면 가장자리에 뒤 페이지가 비친다. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.22, ease: EASE }}
        className="absolute inset-0 bg-black/70 backdrop-blur-[3px]"
      />

      {/* 내용 — 살짝 확대되며 들어온다. 인덱스에서 제목을 탭했을 때
          "그 프로젝트가 펼쳐지는" 느낌을 주는 부분. */}
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.36, ease: EASE }}
        className="absolute inset-0"
      >
        {/* 스크롤 영역 — 배경(빈 곳)을 누르면 닫힌다.
          커서를 zoom-out으로 바꿔 "여기를 누르면 닫힌다"는 걸 알려준다
          (비핸스의 돋보기− 커서와 같은 역할). 패널 위에서는 기본 커서로 되돌린다. */}
        <div
          ref={scrollRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) close()
          }}
          className="no-scrollbar h-full w-full cursor-zoom-out overflow-y-auto overscroll-contain"
        >
          <div className="mx-auto w-full max-w-[1400px] cursor-auto bg-white md:my-0">
            {/* ── 헤더 ── */}
            <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-black/[0.06] bg-white/95 px-5 py-4 backdrop-blur-md md:px-8 md:py-5">
              <div className="min-w-0">
                <h1 className="truncate text-[1.15rem] font-bold tracking-tight text-[#0a0a0a] md:text-[1.45rem]">
                  {title}
                </h1>
                <div className="mt-1.5 flex items-center gap-2.5">
                  <Image
                    src="/avatar.jpg"
                    alt={owner}
                    width={28}
                    height={28}
                    className="h-[26px] w-[26px] shrink-0 rounded-full object-cover md:h-7 md:w-7"
                  />
                  <span className="text-[0.85rem] font-medium text-[#5a5a5a] md:text-[0.9rem]">
                    {owner}
                  </span>
                </div>
              </div>

              {/* 모바일 닫기 — 회색 원형 (데스크탑에서는 화면 우측 상단으로 나감) */}
              <button
                type="button"
                onClick={close}
                aria-label="닫기"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f0f0f0] text-[#2b2b2b] transition-colors hover:bg-[#e2e2e2] md:hidden"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </header>

            {/* ── 작업물 ── */}
            {children}

            {/* ── 이전 / 다음 (모바일: 하단 고정 영역) ── */}
            <nav className="grid grid-cols-2 gap-3 border-t border-black/[0.06] px-5 py-7 md:hidden">
              {prev ? (
                <Link
                  href={`/works/${prev.slug}`}
                  replace
                  className="flex flex-col gap-1 rounded-xl bg-[#f7f7f7] px-4 py-3.5 active:bg-[#eee]"
                >
                  <span className="text-[0.6rem] font-semibold tracking-[0.1em] text-[#b4b4b4]">
                    ← 이전
                  </span>
                  <span className="line-clamp-2 text-[0.82rem] font-semibold leading-snug text-[#3d3d3d]">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={`/works/${next.slug}`}
                  replace
                  className="flex flex-col gap-1 rounded-xl bg-[#f7f7f7] px-4 py-3.5 text-right active:bg-[#eee]"
                >
                  <span className="text-[0.6rem] font-semibold tracking-[0.1em] text-[#b4b4b4]">
                    다음 →
                  </span>
                  <span className="line-clamp-2 text-[0.82rem] font-semibold leading-snug text-[#3d3d3d]">
                    {next.title}
                  </span>
                </Link>
              )}
            </nav>
          </div>
        </div>

        {/* ── 데스크탑 전용: 화면 우측 상단 닫기 ── */}
        <button
          type="button"
          onClick={close}
          aria-label="닫기"
          className="fixed right-5 top-5 z-20 hidden h-11 w-11 place-items-center rounded-full bg-white/90 text-[#1a1a1a] shadow-lg transition-colors hover:bg-white md:grid"
        >
          <XIcon className="h-6 w-6" />
        </button>

        {/* ── 데스크탑 전용: 좌우 하단 이전/다음 ── */}
        {prev && <SideNav dir="prev" slug={prev.slug} label="이전" />}
        {next && <SideNav dir="next" slug={next.slug} label="다음" />}
      </motion.div>
    </div>
  )
}

function SideNav({ dir, slug, label }: { dir: 'prev' | 'next'; slug: string; label: string }) {
  const isPrev = dir === 'prev'
  return (
    <Link
      href={`/works/${slug}`}
      replace
      aria-label={`${label} 프로젝트`}
      className={`fixed bottom-8 z-20 hidden flex-col items-center gap-1.5 md:flex ${
        isPrev ? 'left-4' : 'right-4'
      }`}
    >
      <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-[#1a1a1a] shadow-lg transition-transform hover:scale-105">
        <ChevronIcon className={`h-5 w-5 ${isPrev ? 'rotate-180' : ''}`} />
      </span>
      <span className="text-[0.68rem] font-semibold text-white/80">{label}</span>
    </Link>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M9 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
