import WorkIndex from '@/components/WorkIndex'
import { workSummaries } from '@/lib/works'

export default function Home() {
  // 상세 이미지 목록까지 클라이언트로 보내지 않는다. 요약본만 넘긴다.
  return <WorkIndex works={workSummaries} />
}
