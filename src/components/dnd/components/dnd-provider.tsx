import { useEffect } from 'react'
import { useDndStore } from '../store'

export function DndProvider({ children }: React.PropsWithChildren) {
  const active = useDndStore((store) => store.active)
  const setMousePos = useDndStore((store) => store.setMousePos)

  useEffect(
    function listenMouseMove() {
      function handleMouseMove(event: MouseEvent) {
        setMousePos({ x: event.clientX, y: event.clientY })
      }

      if (active) {
        window.addEventListener('mousemove', handleMouseMove, { passive: true })
      }

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
      }
    },
    [active, setMousePos],
  )

  return children
}
