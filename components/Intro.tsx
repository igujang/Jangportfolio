'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'

/** 같은 세션에서 한 번 본 사람에게는 다시 보이지 않는다 */
const SEEN_KEY = 'intro-seen'

const EASE = [0.22, 1, 0.36, 1] as const

/** 이미 본 사람에게서 인트로를 걷어내는 일은 화면이 그려지기 전에 끝나야 한다.
   useEffect 로 하면 걷히는 순간이 한 박자 늦어 흰 화면이 잠깐 남는다.
   서버에서는 useLayoutEffect 가 경고를 내므로 갈아 끼운다. */
const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect
/** 안내 문구가 숨쉬는 속도 */
const BREATHE = 'easeInOut' as const

/** 노크 두 번 사이의 간격(ms).
 *
 *  사람이 실제로 문을 두드리는 간격이 이 정도다. 400ms 넘게 벌리면
 *  노크가 아니라 글자 두 개가 차례로 나오는 걸로 보인다. 여기가 이
 *  연출의 성패를 가르는 값이라 함부로 늘리지 말 것. */
const HIT_1 = 300
const HIT_2 = 550
/** 두 번 두드리고 문 앞에서 기다리는 시간까지 포함한 시점 */
const TO_GREET = 1100
/** 오버레이가 걷히는 시간 */
const LEAVE = 560

/** 두 글자를 나란히 놓지 않는다. 서로 어긋나게 놓아야 두드린 반동처럼 보인다. */
const WORDS = [
  { text: 'knock,', tilt: -2.6, shift: '-0.07em' },
  { text: 'knock.', tilt: 1.8, shift: '0.09em' },
]

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

  useBeforePaint(() => {
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
    // 두드릴 때마다 화면이 통째로 튕긴다. 이게 '쳤다'는 감각을 만든다.
    // 두 번째를 더 세게 쳐야 리듬이 산다.
    const knock = (n: number) => () => {
      setHits(n)
      const k = n === 2 ? 1.35 : 1
      shake.start({
        x: [0, -9 * k, 6 * k, -3 * k, 0],
        y: [0, 5 * k, -3 * k, 1 * k, 0],
        rotate: [0, -0.7 * k, 0.45 * k, 0],
        transition: { duration: 0.3, ease: 'easeOut' },
      })
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
      role="button"
      tabIndex={0}
      aria-label="들어가기"
      // 노크 중에 누르면 인사말로, 인사말에서 누르면 안으로.
      // 2초를 못 기다리는 사람을 붙잡아 둘 이유가 없다.
      onClick={greeting ? enter : skipToGreet}
      animate={{ y: phase === 'leaving' ? '-100%' : 0 }}
      transition={{ duration: LEAVE / 1000, ease: EASE }}
      className="fixed inset-0 z-[60] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#ffffff] px-[5vw]"
    >
      <motion.div animate={shake} className="relative flex flex-col items-center">
        {!greeting && (
          <>
            {/* 두드린 자리에서 퍼지는 파장 */}
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {WORDS.map((w, i) =>
                hits > i ? (
                  <motion.span
                    key={`ring-${w.text}`}
                    initial={{ scale: 0.25, opacity: 0.5 }}
                    animate={{ scale: 2.1, opacity: 0 }}
                    transition={{ duration: 0.85, ease: 'easeOut' }}
                    className="absolute h-[34vmin] w-[34vmin] rounded-full border border-[#d6d6d6]"
                  />
                ) : null
              )}
            </span>

            <p className="relative flex items-baseline gap-[0.3em] text-[clamp(2rem,6.4vw,5.2rem)] font-bold tracking-tight text-[#0a0a0a]">
              {WORDS.map((w, i) => (
                <span
                  key={w.text}
                  className="inline-block"
                  style={{ transform: `translateY(${w.shift})` }}
                >
                  <motion.span
                    className="inline-block"
                    initial={{ opacity: 0, scale: 1.45, rotate: w.tilt * 2.4 }}
                    animate={hits > i ? { opacity: 1, scale: 1, rotate: w.tilt } : {}}
                    // 페이드인은 안 된다. 노크는 타격이라 튕기듯 박혀야 한다.
                    transition={{ type: 'spring', stiffness: 1100, damping: 15, mass: 0.5 }}
                  >
                    {w.text}
                  </motion.span>
                </span>
              ))}
            </p>
          </>
        )}

        {greeting && (
          <motion.button
            type="button"
            onClick={enter}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className="group flex cursor-pointer flex-col items-center text-center break-keep"
          >
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.44, ease: EASE, delay: 0.18 }}
              className="text-[clamp(1.6rem,3.4vw,3rem)] font-bold tracking-tight text-[#0a0a0a]"
            >
              만나서 반갑습니다
            </motion.span>

            {/* 이 줄이 문고리다 — 밑줄을 늘 보이게 둬서 누를 것임을 알린다 */}
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.44, ease: EASE, delay: 0.44 }}
              className="mt-1 text-[clamp(1.6rem,3.4vw,3rem)] font-medium tracking-tight text-[#0a0a0a] underline decoration-[#d6d6d6] decoration-2 underline-offset-[10px] transition-colors duration-200 group-hover:decoration-[#0a0a0a]"
            >
              디자이너 장동호입니다
            </motion.span>

          </motion.button>
        )}
      </motion.div>

      {/* 안내는 인사말에 붙이지 않는다. 붙이면 큰 글자 두 줄 아래 작은 글자가
          하나 매달린 꼴이 되어 어디를 눌러야 하는지가 오히려 흐려진다.
          화면 아래 끝으로 충분히 떼어 놓아야 인사말은 인사말대로 남고
          이것은 화면 전체에 대한 안내로 읽힌다. */}
      {greeting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE, delay: 1.1 }}
          className="pointer-events-none absolute inset-x-0 bottom-[7vh] flex justify-center"
        >
          {/* 아주 느리게 숨쉬게 둔다. 가만히 있으면 눈이 가지 않는다. */}
          <motion.span
            animate={{ opacity: [1, 0.45, 1] }}
            transition={{ duration: 2.8, ease: BREATHE, repeat: Infinity }}
            className="text-[0.92rem] font-normal tracking-[0.3em] text-[#c4c4c4]"
          >
            CLICK TO ENTER
          </motion.span>
        </motion.div>
      )}
    </motion.div>
  )
}
