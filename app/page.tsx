import WorkIndex from '@/components/WorkIndex'
import { works } from '@/lib/works'

export default function Home() {
  return <WorkIndex works={works} />
}
