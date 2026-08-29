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

  return (
    <div className="flex flex-col" style={{ gap: `${work.gap}px` }}>
      {work.blocks.map((b, i) => {
        if (b.type === 'vimeo') {
          return <VimeoBlock key={`${b.id}-${i}`} id={b.id} loop={b.loop} w={b.w} h={b.h} />
        }
        if (b.type === 'video') {
          return (
            <video
              key={b.src}
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
        }
        return (
          <Image
            key={b.src}
            src={b.src}
            alt={`${work.title} ${i + 1}`}
            width={b.w}
            height={b.h}
            sizes="(max-width: 1400px) 100vw, 1400px"
            priority={i < 2}
            className="block h-auto w-full"
          />
        )
      })}
    </div>
  )
}
