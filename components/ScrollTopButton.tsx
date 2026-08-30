'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

/**
 * 맨 위로 — 한참 내려온 뒤 한 번에 되돌아가는 버튼.
 *
 * 스크롤을 담당하는 요소가 두 가지다.
 *   모달        — 안쪽 스크롤 영역(scrollerRef)
 *   전체 페이지 — 창(window)
 * 둘 다 쓸 수 있도록 scrollerRef 를 받으면 그것을, 없으면 창을 다룬다.
 *
 * 위치는 화면마다 이미 떠 있는 버튼이 달라 caller 가 className 으로 정한다.
 * (모달 데스크탑은 우측 하단에 '다음'이 있어 그 위로 올려야 한다)
 */
export default function ScrollTopButton({
  scrollerRef,
  className = '',
}: {
  scrollerRef?: React.RefObject<HTMLElement | null>
  className?: string
}) {
  const [show, setShow] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = scrollerRef?.current
    const target: HTMLElement | Window = el ?? window
    const read = () => (el ? el.scrollTop : window.scrollY)
    // 한 화면 남짓 내려갔을 때부터 보여준다 — 조금만 움직여도 뜨면 성가시다
    const sync = () => setShow(read() > 700)
    sync()
    target.addEventListener('scroll', sync, { passive: true })
    return () => target.removeEventListener('scroll', sync)
  }, [scrollerRef])

  const toTop = () => {
    const el = scrollerRef?.current
    const behavior = reduce ? 'auto' : 'smooth'
    if (el) el.scrollTo({ top: 0, behavior })
    else window.scrollTo({ top: 0, behavior })
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={toTop}
          aria-label="맨 위로"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={`fixed z-20 grid h-12 w-12 place-items-center rounded-full bg-white/90 text-[#1a1a1a] shadow-lg backdrop-blur-sm transition-colors hover:bg-white ${className}`}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
            <path
              d="M12 19V5M5 12l7-7 7 7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
