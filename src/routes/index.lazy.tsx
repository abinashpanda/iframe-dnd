import { createLazyFileRoute } from '@tanstack/react-router'
import {
  DndContext,
  useDndContext,
  useDraggable,
  DragOverlay,
  useDroppable,
  CollisionDetection,
  rectIntersection,
  closestCenter,
} from '@dnd-kit/core'
import { z } from 'zod'
import { forwardRef, useEffect, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import FrameComponent from 'react-frame-component'
import { DashboardIcon } from '@radix-ui/react-icons'
import { useMeasure } from '@uidotdev/usehooks'
import { cn } from '@/lib/utils'
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from '@/components/ui/select'

export const Route = createLazyFileRoute('/')({
  component: Home,
})

const SIZES = [480, 768, 1024, 1440, 1800] as const
type Size = (typeof SIZES)[number]

const CANVAS_DROPPABLE_CONTAINER_ID = 'canvas-container'
const COLLISION_THRESHOLD = 600

const collisonDetection: CollisionDetection = ({ droppableContainers, active, ...args }) => {
  const activeId = active.id.toString()

  if (activeId.startsWith('draggable')) {
    const rectIntersectionCollisions = rectIntersection({
      ...args,
      droppableContainers: droppableContainers.filter(({ id }) => id === CANVAS_DROPPABLE_CONTAINER_ID),
      active,
    })

    if (rectIntersectionCollisions.length === 0) {
      return []
    }

    const collisions = closestCenter({
      ...args,
      droppableContainers: droppableContainers.filter(({ id }) => id !== CANVAS_DROPPABLE_CONTAINER_ID),
      active,
    })
    return collisions.filter((collision) => collision.data?.value < COLLISION_THRESHOLD)
  }

  return []
}

function Home() {
  const [canvasSize, setCanvasSize] = useState<Size>(1440)

  return (
    <DndContext collisionDetection={collisonDetection}>
      <div className="flex h-screen">
        <div className="w-[320px] overflow-auto border-r bg-background p-4">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }, (_, i) => i).map((i) => {
              return <Draggable key={i} index={i} id={i.toString()} />
            })}
          </div>
        </div>
        <div className="h-screen w-[calc(100vw-320px)] space-y-4 overflow-hidden bg-muted p-4">
          <div className="flex h-12 items-center justify-end">
            <Select
              value={canvasSize.toString()}
              onValueChange={(sizeSelected) => {
                setCanvasSize(parseInt(sizeSelected) as Size)
              }}
            >
              <SelectTrigger className="w-40 bg-background">
                <SelectValue placeholder="Canvas width" />
              </SelectTrigger>
              <SelectContent>
                {SIZES.map((size) => {
                  return (
                    <SelectItem key={size} value={size.toString()}>
                      {size}px
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <Canvas canvasSize={canvasSize} className="h-[calc(100%-64px)]" />
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
    id: `draggable-${id}`,
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
      className={cn('flex aspect-square select-none items-center justify-center border bg-background', className)}
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
  canvasSize?: number
  className?: string
  style?: React.CSSProperties
}

function Canvas({ canvasSize = 1800, className, style }: CanvasProps) {
  const pageStyles = usePageStyles()
  const [ref, { width, height }] = useMeasure()

  const scale = useMemo(() => {
    return (width ?? 0) / Math.max(canvasSize, width ?? 0)
  }, [width, canvasSize])
  const canvasHeight = useMemo(() => {
    if (height) {
      return (height - 32) / scale
    }
    return undefined
  }, [height, scale])

  return (
    <div className={cn('h-full w-full', className)} ref={ref} style={style}>
      <div
        className="mx-auto flex h-8 items-center gap-2 rounded-t-md border-l border-r border-t px-2"
        style={{
          width: Math.min(canvasSize, width ?? 0),
        }}
      >
        <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
      </div>
      <FrameComponent
        className="mx-auto origin-top-left overflow-hidden border bg-background"
        initialContent={`
        <!DOCTYPE html>
        <html>
          <head>
            <style>${pageStyles}</style>
            <style>.frame-content { width: 100%; height: 100%; }</style>
          </head>
          <body>
            <div id="mountPoint" class="h-screen"></div>
          </body>
        </html>
        `}
        mountTarget="#mountPoint"
        style={{
          width: canvasSize,
          height: canvasHeight,
          transform: `scale(${scale})`,
        }}
      >
        <CanvasDroppable className={cn('h-full w-full overflow-auto')} style={{ transform: 'translate3d(0, 0, 0)' }}>
          <Droppable id="droppable-1" />
        </CanvasDroppable>
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
    id: `droppable-${id}`,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        isOver
          ? 'flex items-center justify-center gap-2 bg-primary px-4 py-2 text-xs text-primary-foreground shadow-inner'
          : 'h-0',
        className,
      )}
      style={style}
    >
      {isOver ? (
        <>
          <DashboardIcon className="h-5 w-5" />
          <div>Drop Here</div>
        </>
      ) : null}
    </div>
  )
}

type CanvasDroppableProps = React.ComponentProps<'div'>

function CanvasDroppable({ children, className, style }: CanvasDroppableProps) {
  const { setNodeRef } = useDroppable({
    id: CANVAS_DROPPABLE_CONTAINER_ID,
  })

  return (
    <div ref={setNodeRef} className={className} style={style}>
      {children}
    </div>
  )
}
