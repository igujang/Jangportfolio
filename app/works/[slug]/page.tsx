import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProjectModal from '@/components/ProjectModal'
import WorkBlocks from '@/components/WorkBlocks'
import { getNext, getPrev, getWork, OWNER, works } from '@/lib/works'

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

  const title = `${work.title} | 장동호 디자이너`
  const description = `${work.category} · ${work.title}`
  const url = `/works/${work.slug}`
  /** 썸네일이 영상인 프로젝트는 링크 미리보기에 쓸 수 없다 — 기본 OG 이미지로 넘어간다 */
  const image = work.thumb?.type === 'image' ? work.thumb : null

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: '장동호 디자이너',
      locale: 'ko_KR',
      type: 'article',
      ...(image && {
        images: [{ url: image.src, width: image.w, height: image.h, alt: work.title }],
      }),
    },
  }
}

/**
 * 주소로 직접 들어왔거나 새로고침했을 때 보이는 화면.
 * (목록에서 클릭하면 app/@modal 쪽이 인터셉트해서 같은 것을 창으로 띄운다)
 *
 * 예전에는 여기서 헤더·닫기 버튼을 따로 그렸는데, 그러다 보니 새로고침만
 * 하면 어두운 배경도 이전/다음 버튼도 없는 다른 화면이 됐다. 양쪽이 따로
 * 관리되면서 버튼 크기도 어긋났다. 같은 컴포넌트를 쓰고 닫기 동작만
 * 다르게 준다(standalone).
 */
export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const work = getWork(slug)
  if (!work) notFound()

  const prev = getPrev(slug)
  const next = getNext(slug)

  return (
    <ProjectModal
      standalone
      title={work.title}
      owner={OWNER}
      prev={prev && { slug: prev.slug, title: prev.title }}
      next={next && { slug: next.slug, title: next.title }}
    >
      <WorkBlocks work={work} />
    </ProjectModal>
  )
}
