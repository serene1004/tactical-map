import type { FeatureCollection, Point } from 'geojson'

import { getPresetById } from '../data/symbolPresets'
import { koreaCenter } from '../data/mapStyle'
import type { MilitarySymbolFeature, SymbolAffiliation } from '../types/military'

interface ExportProperties {
  id: string
  sidc: string
  presetId: string
  presetName: string
  category: string
  affiliation: SymbolAffiliation
  title: string
  description: string
  status: string
  quantity: number
  createdAt: string
  lastUpdated: string
}

export interface ExportDocument extends FeatureCollection<Point, ExportProperties> {
  name: string
  metadata: {
    exportedAt: string
    symbolCount: number
    mapCenter: [number, number]
    coordinateSystem: 'EPSG:4326'
  }
}

export function buildExportDocument(symbols: MilitarySymbolFeature[]): ExportDocument {
  return {
    type: 'FeatureCollection',
    name: '전술 오버레이',
    metadata: {
      exportedAt: new Date().toISOString(),
      symbolCount: symbols.length,
      mapCenter: koreaCenter,
      coordinateSystem: 'EPSG:4326'
    },
    features: symbols.map((symbol) => {
      const preset = getPresetById(symbol.presetId)

      return {
        type: 'Feature',
        id: symbol.id,
        geometry: {
          type: 'Point',
          coordinates: symbol.position
        },
        properties: {
          id: symbol.id,
          sidc: symbol.sidc,
          presetId: symbol.presetId,
          presetName: preset.name,
          category: symbol.category,
          affiliation: symbol.affiliation,
          title: symbol.title,
          description: symbol.description,
          status: symbol.status,
          quantity: symbol.quantity,
          createdAt: symbol.createdAt,
          lastUpdated: symbol.lastUpdated
        }
      }
    })
  }
}
