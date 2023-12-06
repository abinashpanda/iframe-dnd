import { HomeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function App() {
  return (
    <div className="p-4">
      <Button icon={<HomeIcon />} size="sm">
        Dashboard
      </Button>
      <Button icon={<HomeIcon />} size="icon-sm" />
    </div>
  )
}
