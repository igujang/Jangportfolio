import Image from 'next/image'
import VimeoBlock from '@/components/VimeoBlock'
import type { Work } from '@/lib/works'

/**
 * 상세 내용 — 1200px 폭으로 세로 나열.
 * 1400px 이던 것을 줄였다 — 노트북(뷰포트 약 900px)에서 16:9 한 장이 787px 이라
 * 헤더까지 더하면 화면에 안 들어왔다. 1200px 이면 675px 이 되어 한 장이 온전히 보인다.
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
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority={i < 2}
                /* 재인코딩 금지 — 파일을 그대로 내려보낸다.
                   next/image 는 기본으로 AVIF q75 로 다시 굽는데, 이미 압축된
                   작업물을 한 번 더 굽는 것이라 화질이 눈에 띄게 무너졌다.
                   실측(주요기업_1): 원본 902KB → 브라우저 39KB, 원본의 4%.
                   빌드 단계에서 5MB 미만은 원본 그대로 두므로, 여기서도
                   손대지 않아야 원본 화질이 그대로 전달된다. */
                unoptimized
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
