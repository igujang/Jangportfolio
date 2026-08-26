import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import VimeoBlock from '@/components/VimeoBlock'
import { getNext, getWork, works } from '@/lib/works'

export function generateStaticParams() {
  return works.map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const work = getWork(slug)
  if (!work) return {}
  return {
    title: `${work.title} | 장동호 디자이너`,
    description: `${work.category} · ${work.title}`,
  }
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const work = getWork(slug)
  if (!work) notFound()

  const next = getNext(slug)

  return (
    <main className="min-h-[100svh] pb-[12vh]">
      {/* ── 돌아가기 ── */}
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-0 md:py-5">
          <Link
            href="/"
            className="text-[0.8rem] font-semibold tracking-tight text-[#8a8a8a] transition-colors hover:text-[#0a0a0a] md:text-[0.9rem]"
          >
            ← 목록으로
          </Link>
          <span className="flex items-baseline gap-2 text-[#c4c4c4]">
            <span className="text-[0.62rem] font-semibold tracking-[0.08em] md:text-[0.68rem]">
              {work.category}
            </span>
            <span className="text-[0.62rem] font-medium tabular-nums md:text-[0.68rem]">
              [{work.n}]
            </span>
          </span>
        </div>
      </header>

      {/* ── 작업물 (비핸스 규격: 1400px 폭, 세로 연속) ── */}
      <article className="mx-auto max-w-[1400px]">
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
      </article>

      {/* ── 다음 프로젝트 ── */}
      {next && (
        <nav className="mx-auto mt-[10vh] max-w-[1400px] border-t border-[#eee] px-5 pt-[6vh] md:px-0">
          <Link href={`/works/${next.slug}`} className="group block">
            <span className="text-[0.65rem] font-semibold tracking-[0.12em] text-[#c4c4c4]">
              NEXT PROJECT
            </span>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="text-[clamp(1.3rem,2.4vw,2.4rem)] font-bold leading-tight tracking-[-0.02em] text-[#c4c4c4] transition-colors duration-300 group-hover:text-[#0a0a0a]">
                {next.title}
              </span>
              <span className="rounded-full bg-[#f2f2f2] px-[0.7em] py-[0.32em] text-[0.6rem] font-semibold tracking-[0.08em] text-[#bdbdbd] transition-colors duration-300 group-hover:bg-[#e4e4e4] group-hover:text-[#3d3d3d]">
                {next.category}
              </span>
              <span className="text-[0.7rem] font-medium tabular-nums text-[#d6d6d6] transition-colors duration-300 group-hover:text-[#8a8a8a]">
                [{next.n}]
              </span>
            </div>
          </Link>
        </nav>
      )}
    </main>
  )
}
