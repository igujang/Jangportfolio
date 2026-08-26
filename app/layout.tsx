import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '장동호 디자이너 | BX Design Portfolio',
  description: '브랜드 경험을 설계하는 BX 디자이너 장동호의 포트폴리오입니다.',
  openGraph: {
    title: '장동호 디자이너 | BX Design Portfolio',
    description: '브랜드 경험을 설계하는 BX 디자이너 장동호의 포트폴리오입니다.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
