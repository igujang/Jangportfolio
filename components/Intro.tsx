'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'

/** 같은 세션에서 한 번 본 사람에게는 다시 보이지 않는다 */
const SEEN_KEY = 'intro-seen'

const EASE = [0.22, 1, 0.36, 1] as const

/** 노크 두 번 사이의 간격(ms).
 *
 *  사람이 실제로 문을 두드리는 간격이 이 정도다. 400ms 넘게 벌리면
 *  노크가 아니라 글자 두 개가 차례로 나오는 걸로 보인다. 여기가 이
 *  연출의 성패를 가르는 값이라 함부로 늘리지 말 것. */
const HIT_1 = 300
const HIT_2 = 550
/** 두 번 두드리고 문 앞에서 기다리는 시간까지 포함한 시점 */
const TO_GREET = 1050
/** 오버레이가 걷히는 시간 */
const LEAVE = 560

type Phase = 'knock' | 'greet' | 'leaving' | 'done'

export default function Intro() {
  const [phase, setPhase] = useState<Phase>('knock')
  /** 지금까지 두드린 횟수 — 0, 1, 2 */
  const [hits, setHits] = useState(0)
  const shake = useAnimationControls()
  const timers = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  /** 인덱스로 들어간다 */
  const enter = useCallback(() => {
    clearTimers()
    setPhase((p) => (p === 'leaving' || p === 'done' ? p : 'leaving'))
    try {
      sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* 시크릿 모드 등에서 막혀도 연출 자체는 굴러가야 한다 */
    }
    window.setTimeout(() => {
      setPhase('done')
      document.body.classList.remove('modal-open')
    }, LEAVE)
  }, [clearTimers])

  /** 노크 중에 클릭하면 인사말로 건너뛴다 */
  const skipToGreet = useCallback(() => {
    clearTimers()
    setHits(2)
    setPhase('greet')
  }, [clearTimers])

  useEffect(() => {
    let skip = false
    try {
      skip = !!sessionStorage.getItem(SEEN_KEY)
    } catch {
      skip = false
    }
    // 모션을 줄여 달라고 한 사람에게 문 두드리는 화면을 보여줄 이유가 없다
    if (!skip) skip = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (skip) {
      setPhase('done')
      return
    }

    document.body.classList.add('modal-open')

    const at = (fn: () => void, ms: number) => {
      timers.current.push(window.setTimeout(fn, ms))
    }
    // 두드릴 때마다 화면이 살짝 흔들린다. 이게 '쳤다'는 감각을 만든다.
    const knock = (n: number) => () => {
      setHits(n)
      shake.start({ x: [0, -3, 2, 0], transition: { duration: 0.16, ease: 'easeOut' } })
    }
    at(knock(1), HIT_1)
    at(knock(2), HIT_2)
    at(() => setPhase('greet'), TO_GREET)

    return () => {
      clearTimers()
      document.body.classList.remove('modal-open')
    }
  }, [clearTimers, shake])

  // esc 로도 빠져나갈 수 있어야 한다
  useEffect(() => {
    if (phase === 'done') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') enter()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, enter])

  if (phase === 'done') return null

  const greeting = phase === 'greet' || phase === 'leaving'

  return (
    <motion.div
      id="intro"
      // 노크 중에 누르면 인사말로, 인사말에서 누르면 안으로.
      // 2초를 못 기다리는 사람을 붙잡아 둘 이유가 없다.
      onClick={greeting ? enter : skipToGreet}
      animate={{ y: phase === 'leaving' ? '-100%' : 0 }}
      transition={{ duration: LEAVE / 1000, ease: EASE }}
      className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-[#ffffff] px-[5vw]"
    >
      <motion.div animate={shake} className="flex flex-col items-center">
        {!greeting && (
          <p className="flex gap-[0.3em] text-[clamp(1.6rem,4vw,3.2rem)] font-medium tracking-tight text-[#0a0a0a]">
            {['knock,', 'knock.'].map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: -6, scale: 1.04 }}
                animate={hits > i ? { opacity: 1, y: 0, scale: 1 } : {}}
                // 페이드인은 안 된다. 노크는 타격이라 툭 나타나야 한다.
                transition={{ duration: 0.06, ease: 'easeOut' }}
              >
                {word}
              </motion.span>
            ))}
          </p>
        )}

        {greeting && (
          <button
            type="button"
            onClick={enter}
            className="group flex flex-col items-center text-center break-keep"
          >
            {['만나서 반갑습니다', '디자이너 장동호입니다'].map((line, i) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.44, ease: EASE, delay: 0.2 + i * 0.3 }}
                className={`text-[clamp(1.6rem,3.4vw,3rem)] tracking-tight text-[#0a0a0a] ${
                  i === 0 ? 'font-bold' : 'font-medium'
                } underline decoration-transparent decoration-2 underline-offset-[10px] transition-colors group-hover:decoration-[#0a0a0a]`}
              >
                {line}
              </motion.span>
            ))}

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.9 }}
              className="mt-[4vh] text-[0.8rem] font-semibold tracking-[0.14em] text-[#b4b4b4]"
            >
              CLICK TO ENTER
            </motion.span>
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}
