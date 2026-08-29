/**
 * 비메오 임베드.
 * 처음부터 전부 불러온다 — 비핸스처럼 로딩된다. 예전에는 화면에 가까워질
 * 때만 불러왔는데, 스크롤하다 도달하면 그제서야 뜨는 게 어설퍼 보였다.
 *
 *  loop = true  → background 모드: 자동재생 · 무음 · 무한반복 · 컨트롤 없음
 *  loop = false → 일반 플레이어: 클릭 재생 · 소리 있음
 */
export default function VimeoBlock({
  id,
  loop,
  w,
  h,
}: {
  id: string
  loop: boolean
  w: number
  h: number
}) {
  const src = loop
    ? `https://player.vimeo.com/video/${id}?background=1&autoplay=1&loop=1&muted=1&autopause=0`
    : `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0&loop=1&autopause=0&dnt=1`

  return (
    <div
      className="relative w-full overflow-hidden bg-[#f6f6f6]"
      style={{ aspectRatio: `${w} / ${h}` }}
    >
      {/* 컨테이너보다 1px 살짝 크게 잡는다 — 플레이어 안쪽 여백이나
          비율 오차로 생기는 가장자리의 얇은 선(회색/검정)이 밖으로
          밀려나가 보이지 않게 하기 위함. */}
      <iframe
        src={src}
        title={`vimeo-${id}`}
        loading="eager"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="absolute -inset-px h-[calc(100%+2px)] w-[calc(100%+2px)] border-0"
      />
    </div>
  )
}
