import { useDndStore } from '../store'

export function useDraggable(props: { id: string; data: any }) {
  const setActive = useDndStore((store) => store.setActive)
  const setMousePos = useDndStore((store) => store.setMousePos)

  return {
    draggableProps: {
      draggable: true,
      onMouseDown: (event: React.MouseEvent) => {
        setActive(props.id)
        setMousePos({ x: event.clientX, y: event.clientY })
      },
      onMouseUp: () => {
        setActive(undefined)
      },
    },
  }
}
