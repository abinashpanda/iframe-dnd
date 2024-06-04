import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { ImmerStateCreator } from '@/lib/store'

type MousePos = {
  x: number
  y: number
}

type DndStore = {
  active?: string
  over?: string
  mousePos?: MousePos
  setMousePos: (mousePos: MousePos) => void
  setActive: (active?: string) => void
  setDragOver: (over: string) => void
}

const dndStoreCreator: ImmerStateCreator<DndStore> = (set) => ({
  active: undefined,
  over: undefined,
  setActive: (active) => {
    set((state) => {
      state.active = active
    })
  },
  setDragOver: (over) => {
    set((state) => {
      state.over = over
    })
  },
  setMousePos: (mousePos) => {
    set((state) => {
      state.mousePos = mousePos
    })
  },
})

export const useDndStore = create<DndStore>()(immer((set, ...args) => dndStoreCreator(set, ...args)))
