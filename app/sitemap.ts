import type { MetadataRoute } from 'next'
import { works } from '@/lib/works'
import { SITE_URL } from '@/lib/site'

/** 검색엔진에 넘기는 주소 목록. 프로젝트가 늘면 works.json 만 고치면 된다. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    ...works.map((w) => ({
      url: `${SITE_URL}/works/${w.slug}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ]
}
