import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import WorkBlocks from '@/components/WorkBlocks'
import { AVATAR_SRC, getNext, getPrev, getWork, OWNER, works } from '@/lib/works'

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

/**
 * 주소로 직접 들어왔거나 새로고침했을 때 보이는 전체 페이지.
 * (목록에서 클릭하면 app/@modal 쪽이 대신 창으로 띄운다)
 */
export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const work = getWork(slug)
  if (!work) notFound()

  const prev = getPrev(slug)
  const next = getNext(slug)

  return (
    <main className="min-h-[100svh]">
      <div className="mx-auto w-full max-w-[1200px]">
        {/* 모달과 같은 동작 — sticky 를 빼서 휠을 내리면 사라지고
            맨 위로 올라오면 다시 나타난다. 닫기는 아래 화면 고정. */}
        <header className="flex items-center justify-between gap-4 border-b border-black/[0.06] bg-white px-5 py-4 md:px-8 md:py-5">
          <div className="min-w-0">
            <h1 className="truncate text-[1.15rem] font-bold tracking-tight text-[#0a0a0a] md:text-[1.45rem]">
              {work.title}
            </h1>
            <div className="mt-1.5 flex items-center gap-2.5">
              <Image
                src={AVATAR_SRC}
                alt={OWNER}
                width={28}
                height={28}
                className="h-[26px] w-[26px] shrink-0 rounded-full object-cover md:h-7 md:w-7"
              />
              <span className="text-[0.85rem] font-medium text-[#5a5a5a] md:text-[0.9rem]">
                {OWNER}
              </span>
            </div>
          </div>

        </header>

        {/* 닫기 — 화면 우측 상단 고정 (헤더가 사라져도 남는다) */}
        <Link
          href="/"
          aria-label="닫기"
          className="fixed right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#1a1a1a] shadow-lg backdrop-blur-sm transition-colors hover:bg-white md:right-5 md:top-5"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 md:h-6 md:w-6" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Link>

        <WorkBlocks work={work} />

        <nav className="grid grid-cols-2 gap-3 border-t border-black/[0.06] px-5 py-9 md:px-8">
          {prev ? (
            <Link
              href={`/works/${prev.slug}`}
              className="flex flex-col gap-1 rounded-xl bg-[#f7f7f7] px-4 py-4 transition-colors hover:bg-[#efefef]"
            >
              <span className="text-[0.62rem] font-semibold tracking-[0.1em] text-[#b4b4b4]">
                ← 이전
              </span>
              <span className="line-clamp-2 text-[0.85rem] font-semibold leading-snug text-[#3d3d3d]">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/works/${next.slug}`}
              className="flex flex-col gap-1 rounded-xl bg-[#f7f7f7] px-4 py-4 text-right transition-colors hover:bg-[#efefef]"
            >
              <span className="text-[0.62rem] font-semibold tracking-[0.1em] text-[#b4b4b4]">
                다음 →
              </span>
              <span className="line-clamp-2 text-[0.85rem] font-semibold leading-snug text-[#3d3d3d]">
                {next.title}
              </span>
            </Link>
          )}
        </nav>
      </div>
    </main>
  )
}
