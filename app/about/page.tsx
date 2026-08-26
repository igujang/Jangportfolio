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
  | { t: 'p'; s: string }
  | { t: 'ul'; items: string[] }

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
        BX DESIGNER
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
