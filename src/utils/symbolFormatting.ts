import type { SymbolStatus } from '../types/military'

export const symbolStatusOptions: Array<{ value: SymbolStatus; label: string }> = [
  { value: 'planned', label: '계획' },
  { value: 'active', label: '활성' },
  { value: 'watch', label: '주시' }
]

export function getSymbolStatusLabel(status: SymbolStatus): string {
  return symbolStatusOptions.find((option) => option.value === status)?.label ?? status
}

export function normalizeQuantity(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? 1 : Math.max(Math.trunc(parsed), 1)
}

export function formatCoordinatePair([lng, lat]: [number, number]): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}
