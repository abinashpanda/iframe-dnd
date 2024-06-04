import { createLazyFileRoute } from '@tanstack/react-router'
import { DndContext, useDndContext, useDraggable, DragOverlay, useDroppable } from '@dnd-kit/core'
import { z } from 'zod'
import { forwardRef, useEffect, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import FrameComponent from 'react-frame-component'
import { DashboardIcon } from '@radix-ui/react-icons'
import { useMeasure } from '@uidotdev/usehooks'
import { cn } from '@/lib/utils'

export const Route = createLazyFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <DndContext>
      <div className="flex h-screen">
        <div className="w-[320px] overflow-auto border-r bg-background p-4">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }, (_, i) => i).map((i) => {
              return <Draggable key={i} index={i} id={i.toString()} />
            })}
          </div>
        </div>
        <div className="flex-1 flex-col overflow-hidden bg-muted p-4">
          <Canvas className="flex-1" />
        </div>
      </div>
      <Overlay />
    </DndContext>
  )
}

const sortableSchema = z.object({
  type: z.literal('draggable'),
  id: z.string(),
  index: z.number(),
})

type DraggableProps = {
  index: number
  id: string
  className?: string
  style?: React.CSSProperties
}

function Draggable({ id, index, className, style }: DraggableProps) {
  const { setNodeRef, attributes, listeners } = useDraggable({
    id,
    data: {
      type: 'draggable',
      id,
      index,
    },
  })

  return (
    <BaseDraggable {...listeners} {...attributes} ref={setNodeRef} className={className} style={style} index={index} />
  )
}

type BaseDraggableProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  index: number
}

const BaseDraggable = forwardRef<React.ElementRef<'div'>, BaseDraggableProps>(({ index, className, ...rest }, ref) => {
  return (
    <div
      className={cn('flex aspect-square items-center justify-center border bg-background', className)}
      {...rest}
      ref={ref}
    >
      {index + 1}
    </div>
  )
})
BaseDraggable.displayName = 'BaseDraggable'

function Overlay() {
  const { active } = useDndContext()

  const activeData = useMemo(() => {
    const result = sortableSchema.safeParse(active?.data.current)
    if (result.success) {
      return result.data
    }
    return undefined
  }, [active])

  return (
    <DragOverlay>
      {match(activeData)
        .with(undefined, () => null)
        .otherwise(({ index }) => {
          return <BaseDraggable index={index} className="z-50" />
        })}
    </DragOverlay>
  )
}

function usePageStyles() {
  const [pageStyles, setPageStyles] = useState<string | undefined>(undefined)

  useEffect(function getPageStyles() {
    const styles = Array.from(document.head.querySelectorAll('style'))
      .map((style) => {
        return style.innerHTML
      })
      .join('\n')
    setPageStyles(styles)
  }, [])

  return pageStyles
}

type CanvasProps = {
  containerWidth?: number
  className?: string
  style?: React.CSSProperties
}

function Canvas({ containerWidth = 1800, className, style }: CanvasProps) {
  const pageStyles = usePageStyles()
  const [ref, { width }] = useMeasure()

  return (
    <div className={cn('h-full w-full', className)} ref={ref} style={style}>
      <FrameComponent
        className="h-full w-full origin-top-left overflow-hidden border bg-background"
        initialContent={`<!DOCTYPE html><html><head><style>${pageStyles}</style></head><body><div id="mountPoint"></div></body></html>`}
        mountTarget="#mountPoint"
        style={{
          width: containerWidth,
          transform: `scale(${(width ?? 0) / containerWidth})`,
        }}
      >
        <div className="h-full overflow-auto">
          <Droppable id="droppable-1" />
        </div>
      </FrameComponent>
    </div>
  )
}

type DroppableProps = {
  id: string
  className?: string
  style?: React.CSSProperties
}

function Droppable({ id, className, style }: DroppableProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex items-center justify-center gap-2 px-4 py-2 text-xs shadow-inner',
        isOver ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        className,
      )}
      style={style}
    >
      <DashboardIcon className="h-5 w-5" />
      <div>Drop Here</div>
    </div>
  )
}
