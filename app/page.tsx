import { InlineScript } from '@/components/InlineScript'
import Intro from '@/components/Intro'
import WorkIndex from '@/components/WorkIndex'
import { workSummaries } from '@/lib/works'

/** 같은 세션에서 이미 인트로를 본 사람에게는 한 프레임도 보이지 않게 한다.
 *
 *  리액트가 붙기 전에 정해져야 해서 인라인 스크립트로 둔다. 이 표시를
 *  보고 globals.css 가 #intro 를 그리기 전에 감춘다. <html> 의 속성이
 *  바뀌므로 layout.tsx 의 <html> 에 suppressHydrationWarning 이 필요하다. */
const SKIP_IF_SEEN = `try{if(sessionStorage.getItem('intro-seen'))document.documentElement.dataset.intro='seen'}catch(e){}`

export default function Home() {
  // 상세 이미지 목록까지 클라이언트로 보내지 않는다. 요약본만 넘긴다.
  return (
    <>
      <InlineScript html={SKIP_IF_SEEN} />
      {/* 인덱스는 인트로 뒤에 이미 그려져 있다. 클릭한 뒤에 불러오지 않는다. */}
      <WorkIndex works={workSummaries} />
      <Intro />
    </>
  )
}
