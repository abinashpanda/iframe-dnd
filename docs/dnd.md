# Drag and Drop

```tsx
function App() {
  return (
    <DndProvider onDropComplete={(active, over) => {}} onDragStart={(active) => {}}>
      <div className="flex h-screen">
        <div className="bg-background h-[280px] border-r p-4">
          <Draggable id="draggable-1">Drag Me</Draggable>
        </div>
        <div className="bg-muted flex-1 overflow-hidden p-4">
          <div>1</div>
          <Droppable id="droppable-1"></Droppable>
        </div>
      </div>
      <DragOverlay>
        <Overlay />
      </DragOverlay>
    </DndProvider>
  )
}
```
