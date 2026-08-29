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
        <div className="flex justify-center px-6 py-12">
          {/* 노트폴리오 브랜드 색(청록)을 그대로 쓴다 — 회색 알약은
              수상 내역이 맞달리지 않았다. 글자도 한 단계 키웠다. */}
          <span className="rounded-full bg-[#2BC7CE] px-8 py-4 text-[1.05rem] font-bold tracking-tight text-white shadow-[0_8px_24px_-8px_rgba(43,199,206,0.6)]">
            {work.award}
          </span>
        </div>
      )}
    </>
  )
}
