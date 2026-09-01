/**
 * 브라우저가 HTML 을 읽어 내려가는 중에 곧바로 실행되는 스크립트.
 *
 * 리액트가 붙기 전에 화면을 손봐야 할 때 쓴다. 그냥 <script> 를 렌더하면
 * 개발 모드에서 리액트가 경고를 띄우므로, 서버에서만 실행되는 타입으로
 * 내보내고 클라이언트에서는 text/plain 으로 바꿔 무시하게 한다.
 * 타입이 서로 달라지는 것은 suppressHydrationWarning 으로 넘긴다.
 *
 * 참고: next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
