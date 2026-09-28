import type { WidgetInstance } from './types'

// Fixed sizes instead of free resizing: every combination fits cleanly in the
// 4-column grid and still collapses sensibly on tablets and phones.
export const SIZE_PRESETS = [
  { label: 'S', width: 1, height: 2 },
  { label: 'M', width: 2, height: 2 },
  { label: 'L', width: 2, height: 4 },
  { label: 'XL', width: 4, height: 2 },
] as const

function presetIndex(instance: WidgetInstance): number {
  return SIZE_PRESETS.findIndex(
    (preset) => preset.width === instance.width && preset.height === instance.height,
  )
}

export function sizeLabel(instance: WidgetInstance): string {
  return SIZE_PRESETS[presetIndex(instance)]?.label ?? '?'
}

// A size that isn't a preset (e.g. an old row) returns index -1, so the next
// size is the first preset.
export function nextSize(instance: WidgetInstance): { width: number; height: number } {
  const { width, height } = SIZE_PRESETS[(presetIndex(instance) + 1) % SIZE_PRESETS.length]
  return { width, height }
}
