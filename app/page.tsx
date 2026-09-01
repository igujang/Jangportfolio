import Intro from '@/components/Intro'
import WorkIndex from '@/components/WorkIndex'
import { workSummaries } from '@/lib/works'

export default function Home() {
  // 상세 이미지 목록까지 클라이언트로 보내지 않는다. 요약본만 넘긴다.
  return (
    <>
      {/* 인덱스는 인트로 뒤에 이미 그려져 있다. 클릭한 뒤에 불러오지 않는다. */}
      <WorkIndex works={workSummaries} />
      <Intro />
    </>
  )
}
