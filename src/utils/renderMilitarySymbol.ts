import ms from 'milsymbol'

import type { MilitarySymbolFeature, SymbolPreset } from '../types/military'

const defaultSymbolOptions = {
  fill: true,
  frame: true,
  outlineWidth: 6,
  outlineColor: '#f4f0e4',
  colorMode: 'Light' as const
}

export function createMapIconId(sidc: string): string {
  return `mil-symbol-${sidc.replace(/[^a-zA-Z0-9_-]/g, '_')}`
}

export function renderPresetSvg(preset: SymbolPreset, size = 38): string {
  return renderSymbolSvg({
    sidc: preset.sidc,
    size
  })
}

export function renderFeatureSvg(feature: MilitarySymbolFeature, size = 46): string {
  return renderSymbolSvg({
    sidc: feature.sidc,
    size
  })
}

function renderSymbolSvg({
  sidc,
  label,
  size
}: {
  sidc: string
  label?: string
  size: number
}): string {
  try {
    return new ms.Symbol(sidc, {
      ...defaultSymbolOptions,
      size
    }).asSVG()
  } catch {
    const fallbackLabel = label ?? 'MIL'

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="${size}" height="${size}" aria-hidden="true">`,
      '<circle cx="40" cy="40" r="28" fill="#5b6b4b" stroke="#ede7d2" stroke-width="4" />',
      `<text x="40" y="47" text-anchor="middle" font-size="16" fill="#f6f1e1" font-family="IBM Plex Sans KR, sans-serif">${fallbackLabel}</text>`,
      '</svg>'
    ].join('')
  }
}
