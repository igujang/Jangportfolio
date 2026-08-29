import { notFound } from 'next/navigation'
import ProjectModal from '@/components/ProjectModal'
import WorkBlocks from '@/components/WorkBlocks'
import { getNext, getPrev, getWork, OWNER, works } from '@/lib/works'

export function generateStaticParams() {
  return works.map((w) => ({ slug: w.slug }))
}

/** 목록에서 클릭했을 때 — 위에 창으로 뜬다 */
export default async function WorkModal({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const work = getWork(slug)
  if (!work) notFound()

  const prev = getPrev(slug)
  const next = getNext(slug)

  return (
    <ProjectModal
      title={work.title}
      owner={OWNER}
      prev={prev && { slug: prev.slug, title: prev.title }}
      next={next && { slug: next.slug, title: next.title }}
    >
      <WorkBlocks work={work} />
    </ProjectModal>
  )
}
