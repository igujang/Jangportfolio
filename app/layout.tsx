import type { Metadata, Viewport } from 'next'
import { SITE_URL } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  /** 상대 경로로 적은 OG 이미지·canonical 을 절대주소로 바꿔주는 기준점 */
  metadataBase: new URL(SITE_URL),
  title: '장동호 디자이너 | BX Design Portfolio',
  description: '브랜드 경험을 설계하는 BX 디자이너 장동호의 포트폴리오입니다.',
  alternates: { canonical: '/' },
  openGraph: {
    title: '장동호 디자이너 | BX Design Portfolio',
    description: '브랜드 경험을 설계하는 BX 디자이너 장동호의 포트폴리오입니다.',
    url: '/',
    siteName: '장동호 디자이너',
    locale: 'ko_KR',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  /** 목록에서 프로젝트를 클릭했을 때 위에 뜨는 창 */
  modal: React.ReactNode
}) {
  return (
    // 인트로 스킵 스크립트가 리액트보다 먼저 <html> 에 표시를 단다
    <html lang="ko" suppressHydrationWarning>
      <body>
        {children}
        {modal}
      </body>
    </html>
  )
}
