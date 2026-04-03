export type SymbolStatus = 'planned' | 'active' | 'watch'
export type SymbolAffiliation = 'friendly' | 'hostile'

export interface SymbolPreset {
  id: string
  sidc: string
  name: string
  shortLabel: string
  summary: string
  category: string
  affiliation: SymbolAffiliation
  defaultTitle: string
  defaultDescription: string
  defaultStatus: SymbolStatus
}

export interface MilitarySymbolFeature {
  id: string
  sidc: string
  presetId: string
  title: string
  description: string
  category: string
  affiliation: SymbolAffiliation
  status: SymbolStatus
  position: [number, number]
  quantity: number
  createdAt: string
  lastUpdated: string
}

export interface SymbolDraft {
  presetId: string
  title: string
  description: string
  status: SymbolStatus
  quantity: number
}
