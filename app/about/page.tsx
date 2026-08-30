import { readFile } from 'node:fs/promises'
import path from 'node:path'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이력 | 장동호 디자이너',
  description: 'BX 디자이너 장동호의 경력과 이력입니다.',
}

/**
 * content/about.md 를 읽어 화면에 뿌린다.
 * GitHub 웹에서 그 파일만 고치면 Vercel이 자동으로 다시 배포한다.
 */
type Node =
  | { t: 'h2'; s: string }
  | { t: 'h3'; s: string }
  /** 소제목 바로 아래 한 줄 — 재직 기간, 발급 기관 같은 부가 정보 */
  | { t: 'meta'; s: string }
  | { t: 'p'; s: string }
  | { t: 'ul'; items: string[] }
  | { t: 'links'; items: { label: string; href: string }[] }

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g
/** 링크만으로 이루어진 줄 — 나란히 놓는 바로 그린다 */
const ONLY_LINKS = /^(?:\[[^\]]+\]\([^)]+\)\s*)+$/

function parse(md: string): Node[] {
  const out: Node[] = []
  let list: string[] | null = null

  const flush = () => {
    if (list?.length) out.push({ t: 'ul', items: list })
    list = null
  }

  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) {
      flush()
      continue
    }
    if (line.startsWith('- ')) {
      ;(list ??= []).push(line.slice(2))
      continue
    }
    flush()
    if (line.startsWith('### ')) out.push({ t: 'h3', s: line.slice(4) })
    else if (line.startsWith('## ')) out.push({ t: 'h2', s: line.slice(3) })
    else if (ONLY_LINKS.test(line))
      out.push({
        t: 'links',
        items: [...line.matchAll(LINK)].map((m) => ({ label: m[1], href: m[2] })),
      })
    // 소제목 다음 첫 줄은 기간·기관 같은 부가 정보다
    // (2025.01 — 2026.06 / 졸업 / 한국산업인력공단)
    else if (out.at(-1)?.t === 'h3') out.push({ t: 'meta', s: line })
    else out.push({ t: 'p', s: line })
  }
  flush()
  return out
}

/** **굵게** 만 처리한다 */
function rich(s: string, key: string) {
  return s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={`${key}-${i}`} className="font-bold text-[#0a0a0a]">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={`${key}-${i}`}>{part}</span>
    )
  )
}

export default async function AboutPage() {
  const md = await readFile(path.join(process.cwd(), 'content', 'about.md'), 'utf8')
  const nodes = parse(md)

  return (
    <main className="min-h-[100svh] px-[5vw] py-[6vh] md:px-[4vw] md:py-[7vh]">
      <Link
        href="/"
        className="text-[0.8rem] font-semibold tracking-tight text-[#8a8a8a] transition-colors hover:text-[#0a0a0a] md:text-[0.9rem]"
      >
        ← 목록으로
      </Link>

      <h1 className="mt-[6vh] text-[clamp(1.6rem,3.4vw,3rem)] font-bold tracking-tight">
        장동호 디자이너
      </h1>
      <p className="mt-2 text-[clamp(0.75rem,1vw,0.95rem)] font-medium tracking-[0.06em] text-[#b4b4b4]">
        DESIGNER
      </p>

      <div className="mt-[7vh] max-w-[720px] pb-[10vh]">
        {nodes.map((n, i) => {
          switch (n.t) {
            case 'h2':
              return (
                <h2
                  key={i}
                  className="mt-[5vh] border-t border-[#eee] pt-6 text-[clamp(0.68rem,0.82vw,0.8rem)] font-semibold tracking-[0.14em] text-[#b4b4b4] first:mt-0 first:border-0 first:pt-0"
                >
                  {n.s.toUpperCase()}
                </h2>
              )
            case 'h3':
              return (
                <h3
                  key={i}
                  className="mt-7 text-[clamp(1rem,1.4vw,1.3rem)] font-bold tracking-tight text-[#0a0a0a]"
                >
                  {n.s}
                </h3>
              )
            case 'meta':
              return (
                <p
                  key={i}
                  className="mt-1.5 text-[clamp(0.75rem,0.92vw,0.88rem)] font-medium tabular-nums tracking-[0.02em] text-[#b4b4b4]"
                >
                  {n.s}
                </p>
              )
            case 'links':
              return (
                <div key={i} className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
                  {n.items.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[clamp(0.95rem,1.25vw,1.2rem)] font-bold tracking-tight text-[#0a0a0a] underline decoration-[#d6d6d6] decoration-2 underline-offset-[7px] transition-colors hover:decoration-[#0a0a0a]"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              )
            case 'ul':
              return (
                <ul key={i} className="mt-3 flex flex-col gap-1.5">
                  {n.items.map((it, j) => (
                    <li
                      key={j}
                      className="flex gap-3 text-[clamp(0.85rem,1.05vw,1rem)] leading-relaxed text-[#5a5a5a]"
                    >
                      <span aria-hidden className="select-none text-[#d6d6d6]">
                        —
                      </span>
                      <span>{rich(it, `${i}-${j}`)}</span>
                    </li>
                  ))}
                </ul>
              )
            default:
              return (
                <p
                  key={i}
                  className="mt-3 text-[clamp(0.85rem,1.05vw,1rem)] leading-relaxed text-[#5a5a5a]"
                >
                  {rich(n.s, String(i))}
                </p>
              )
          }
        })}
      </div>
    </main>
  )
}
