import type { StyleSpecification } from 'maplibre-gl'

export const koreaCenter: [number, number] = [128.31293, 38.33035]
export const defaultMapZoom = 10.05
export const defaultTerrainPitch = 48
export const terrainExaggeration = 1.14
export const rasterTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const demTileUrl = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
export const contourThresholds: Record<number, [number, number]> = {
  10: [200, 1000],
  11: [100, 500],
  12: [50, 200],
  13: [20, 100]
}

export const tacticalMapStyle: StyleSpecification = {
  version: 8,
  sources: {
    openStreetMap: {
      type: 'raster',
      tiles: [rasterTileUrl],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors'
    }
  },
  layers: [
    {
      id: 'openStreetMap',
      type: 'raster',
      source: 'openStreetMap',
      paint: {
        'raster-opacity': 1,
        'raster-contrast': 0.02,
        'raster-saturation': 0,
        'raster-brightness-min': 0.14,
        'raster-brightness-max': 1
      }
    }
  ]
}

