import Image from 'next/image'
import VimeoBlock from '@/components/VimeoBlock'
import type { Work } from '@/lib/works'

/**
 * 상세 내용 — 비핸스 규격(최대 1400px 폭)으로 세로 나열.
 * 세로로 이어지도록 만든 프로젝트는 간격 0, 나머지는 60px.
 */
export default function WorkBlocks({ work }: { work: Work }) {
  if (!work.blocks.length) {
    return (
      <div className="flex min-h-[46vh] flex-col items-center justify-center gap-3 px-6 py-24 text-center">
        <p className="text-[0.95rem] font-semibold text-[#3d3d3d]">준비 중입니다</p>
        <p className="max-w-[26rem] text-[0.85rem] leading-relaxed text-[#9a9a9a]">
          자료를 정리하는 중입니다. 곧 업데이트할 예정입니다.
        </p>
      </div>
    )
  }

  const isZeroGap = work.gap === 0

  return (
    <>
      <div className="flex flex-col" style={{ gap: isZeroGap ? 0 : `${work.gap}px` }}>
        {work.blocks.map((b, i) => {
          const isLast = i === work.blocks.length - 1
          // 간격 0px 프로젝트에서 이미지 사이에 보이던 미세한 회색 선은
          // 서브픽셀 반올림으로 생기는 틈이다. 1px씩 겹쳐 덮어 없앤다.
          const seamFix = isZeroGap && !isLast ? { marginBottom: -1 } : undefined

          let content: React.ReactNode
          if (b.type === 'vimeo') {
            content = <VimeoBlock id={b.id} loop={b.loop} w={b.w} h={b.h} />
          } else if (b.type === 'video') {
            content = (
              <video
                src={b.src}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="block w-full"
                style={{ aspectRatio: `${b.w} / ${b.h}` }}
              />
            )
          } else {
            content = (
              <Image
                src={b.src}
                alt={`${work.title} ${i + 1}`}
                width={b.w}
                height={b.h}
                sizes="(max-width: 1400px) 100vw, 1400px"
                priority={i < 2}
                className="block h-auto w-full"
              />
            )
          }

          return (
            <div key={`${b.type}-${i}`} style={seamFix} className="relative">
              {content}
            </div>
          )
        })}
      </div>

      {work.award && (
        <div className="flex justify-center px-6 py-10">
          <span className="rounded-full bg-[#f5f5f5] px-5 py-2.5 text-[0.85rem] font-semibold tracking-tight text-[#3d3d3d]">
            {work.award}
          </span>
        </div>
      )}
    </>
  )
}
