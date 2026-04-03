<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import type { FeatureCollection, Point } from 'geojson'
import maplibregl, { type GeoJSONSource } from 'maplibre-gl'
import mlcontour from 'maplibre-contour'

import MapActionToolbar from './MapActionToolbar.vue'
import MapRosterSheet from './MapRosterSheet.vue'
import MapTerrainControls from './MapTerrainControls.vue'
import { getAffiliationLabel, getPresetById } from '../data/symbolPresets'
import {
  contourThresholds,
  defaultMapZoom,
  defaultTerrainPitch,
  demTileUrl,
  koreaCenter,
  tacticalMapStyle,
  terrainExaggeration
} from '../data/mapStyle'
import { useMapEditorStore } from '../stores/mapEditorStore'
import type { MilitarySymbolFeature, SymbolAffiliation } from '../types/military'
import { createMapIconId, renderFeatureSvg } from '../utils/renderMilitarySymbol'
import { formatCoordinatePair, getSymbolStatusLabel } from '../utils/symbolFormatting'

const SYMBOL_SOURCE_ID = 'military-symbols'
const SYMBOL_AURA_LAYER_ID = 'military-symbol-aura'
const SYMBOL_SELECTION_LAYER_ID = 'military-symbol-selection'
const DEM_TERRAIN_SOURCE_ID = 'terrain-dem-terrain'
const DEM_HILLSHADE_SOURCE_ID = 'terrain-dem-hillshade'
const HILLSHADE_LAYER_ID = 'terrain-hillshade'
const CONTOUR_SOURCE_ID = 'terrain-contours'
const CONTOUR_LINE_LAYER_ID = 'terrain-contour-lines'
const MIN_ZOOM = 7
const MAX_ZOOM = 12.5

interface SymbolMapProperties {
  id: string
  affiliation: SymbolAffiliation
}

declare global {
  interface Window {
    __TACTICAL_DEBUG__?: {
      getMap: () => maplibregl.Map | null
      getSymbolDiagnostics: () => Array<{
        id: string
        sidc: string
        iconId: string
        hasImage: boolean
      }>
      hasImage: (iconId: string) => boolean
    }
  }
}

const store = useMapEditorStore()

const mapContainer = ref<HTMLDivElement | null>(null)
const mapInstance = shallowRef<maplibregl.Map | null>(null)
const draggingSymbolId = ref<string | null>(null)
const exportFeedback = ref('GeoJSON 내보내기 준비가 완료되었습니다.')
const rosterOpen = ref(false)
const rosterHighlightedSymbolId = ref<string | null>(null)
const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
const debugSymbolImages = queryParams?.has('debug-symbols') ?? false
const debugConsoleEnabled = debugSymbolImages && import.meta.env.DEV
const reliefFeatureAvailable = !(queryParams?.has('disable-relief') ?? false)
const contourFeatureAvailable = reliefFeatureAvailable && !(queryParams?.has('disable-contours') ?? false)
const demEnabled = ref(reliefFeatureAvailable)
const contourEnabled = ref(false)
const contourControlAvailable = ref(contourFeatureAvailable)

let popup: maplibregl.Popup | null = null
let resizeObserver: ResizeObserver | null = null
let terrainDemSource: InstanceType<typeof mlcontour.DemSource> | null = null
const symbolMarkers = new Map<string, maplibregl.Marker>()

const addDraftPreset = computed(() => getPresetById(store.addDraft.presetId))
const activeHighlightSymbolId = computed(
  () => store.selectedSymbolId ?? rosterHighlightedSymbolId.value
)

function debugSymbolLog(message: string, payload?: unknown): void {
  if (!debugConsoleEnabled) {
    return
  }

  if (payload === undefined) {
    console.info('[symbol-debug]', message)
    return
  }

  console.info('[symbol-debug]', message, payload)
}

function updateDebugBridge(): void {
  if (!debugSymbolImages || typeof window === 'undefined') {
    return
  }

  window.__TACTICAL_DEBUG__ = {
    getMap: () => mapInstance.value,
    getSymbolDiagnostics: () =>
      store.symbols.map((symbol) => {
        const iconId = createMapIconId(symbol.sidc)
        return {
          id: symbol.id,
          sidc: symbol.sidc,
          iconId,
          hasImage: mapInstance.value?.hasImage(iconId) ?? false
        }
      }),
    hasImage: (iconId: string) => mapInstance.value?.hasImage(iconId) ?? false
  }
}

function buildFeatureCollection(
  symbols: MilitarySymbolFeature[]
): FeatureCollection<Point, SymbolMapProperties> {
  return {
    type: 'FeatureCollection',
    features: symbols.map((symbol) => ({
      type: 'Feature',
      id: symbol.id,
      geometry: {
        type: 'Point',
        coordinates: symbol.position
      },
      properties: {
        id: symbol.id,
        affiliation: symbol.affiliation
      }
    }))
  }
}

function buildPopupContent(symbol: MilitarySymbolFeature): HTMLElement {
  const preset = getPresetById(symbol.presetId)
  const wrapper = document.createElement('div')
  wrapper.className = 'popup-card'

  const header = document.createElement('div')
  header.className = 'popup-card__header'

  const title = document.createElement('p')
  title.className = 'popup-card__title'
  title.textContent = symbol.title

  const kicker = document.createElement('span')
  kicker.className = 'popup-card__kicker'
  kicker.dataset.affiliation = symbol.affiliation
  kicker.textContent = getAffiliationLabel(symbol.affiliation)

  const subtitle = document.createElement('p')
  subtitle.className = 'popup-card__subtitle'
  subtitle.textContent = symbol.description

  const grid = document.createElement('div')
  grid.className = 'popup-card__grid'

  const rows: Array<[string, string]> = [
    ['유형', preset.name],
    ['분류', symbol.category],
    ['상태', getSymbolStatusLabel(symbol.status)],
    ['수량', String(symbol.quantity)],
    ['좌표', formatCoordinatePair(symbol.position)]
  ]

  for (const [label, value] of rows) {
    const row = document.createElement('div')
    row.className = 'popup-card__row'

    const key = document.createElement('span')
    key.className = 'popup-card__row-label'
    key.textContent = label

    const content = document.createElement('span')
    content.className = 'popup-card__row-value'
    content.textContent = value

    row.append(key, content)
    grid.append(row)
  }

  header.append(title, kicker)
  wrapper.append(header, subtitle, grid)
  return wrapper
}

function hidePopup(): void {
  popup?.remove()
}

function showPopup(symbolId: string, coordinates?: [number, number]): void {
  const map = mapInstance.value
  const symbol = store.symbols.find((entry) => entry.id === symbolId)

  if (!map || !symbol || !popup) {
    return
  }

  popup
    .setLngLat(coordinates ?? symbol.position)
    .setDOMContent(buildPopupContent(symbol))
    .addTo(map)
}

function focusSymbol(symbolId: string): void {
  const map = mapInstance.value
  const symbol = store.symbols.find((entry) => entry.id === symbolId)

  if (!map || !symbol) {
    return
  }

  map.easeTo({
    center: symbol.position,
    duration: 420,
    essential: true
  })
}

function clearRosterHighlight(): void {
  rosterHighlightedSymbolId.value = null
}

function closeTransientLayers(): void {
  hidePopup()
  clearRosterHighlight()
  rosterOpen.value = false
  store.closeExportPanel()
  store.cancelAddMode()
  store.selectSymbol(null)
}

function handleWindowKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') {
    return
  }

  closeTransientLayers()
}

function handleWindowDebugError(event: ErrorEvent): void {
  debugSymbolLog('window:error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error instanceof Error ? event.error.stack : null
  })
}

function handleWindowDebugRejection(event: PromiseRejectionEvent): void {
  const reason = event.reason
  debugSymbolLog('window:unhandledrejection', {
    message: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : null
  })
}

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function buildSymbolMarkerElement(symbol: MilitarySymbolFeature): HTMLDivElement {
  const element = document.createElement('div')
  element.className = 'symbol-marker'
  element.dataset.symbolId = symbol.id
  element.dataset.sidc = symbol.sidc
  element.style.width = '52px'
  element.style.height = '52px'
  element.style.display = 'flex'
  element.style.alignItems = 'center'
  element.style.justifyContent = 'center'
  element.style.cursor = 'pointer'
  element.style.transform = 'translateZ(0)'

  const image = document.createElement('img')
  image.alt = symbol.title
  image.draggable = false
  image.decoding = 'async'
  image.width = 48
  image.height = 48
  image.src = svgToDataUrl(renderFeatureSvg(symbol, 48))
  image.style.display = 'block'
  image.style.width = '48px'
  image.style.height = '48px'
  image.style.pointerEvents = 'none'

  element.replaceChildren(image)
  return element
}

function removeSymbolMarker(symbolId: string): void {
  const marker = symbolMarkers.get(symbolId)

  if (!marker) {
    return
  }

  marker.remove()
  symbolMarkers.delete(symbolId)
}

function setMapCursor(cursor: string): void {
  mapInstance.value?.getCanvas().style.setProperty('cursor', cursor)
}

function bindMarkerElementInteractions(
  element: HTMLDivElement,
  symbol: MilitarySymbolFeature
): void {
  element.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    clearRosterHighlight()
    store.selectSymbol(symbol.id)
    showPopup(symbol.id)
  })

  element.addEventListener('mouseenter', () => {
    if (draggingSymbolId.value) {
      return
    }

    setMapCursor('pointer')
    showPopup(symbol.id)
  })

  element.addEventListener('mouseleave', () => {
    if (draggingSymbolId.value) {
      return
    }

    setMapCursor('')
    if (store.selectedSymbolId !== symbol.id) {
      hidePopup()
    }
  })
}

function createDraggedPosition(marker: maplibregl.Marker): [number, number] {
  const lngLat = marker.getLngLat()

  return [
    Number(lngLat.lng.toFixed(6)),
    Number(lngLat.lat.toFixed(6))
  ]
}

function createSymbolMarker(symbol: MilitarySymbolFeature, map: maplibregl.Map): maplibregl.Marker {
  const element = buildSymbolMarkerElement(symbol)
  bindMarkerElementInteractions(element, symbol)

  const marker = new maplibregl.Marker({
    element,
    anchor: 'center',
    pitchAlignment: 'viewport',
    rotationAlignment: 'viewport',
    opacityWhenCovered: '1'
  })
    .setLngLat(symbol.position)
    .addTo(map)

  debugSymbolLog('marker:create', {
    id: symbol.id,
    sidc: symbol.sidc,
    lng: symbol.position[0],
    lat: symbol.position[1]
  })

  marker.setDraggable(true)
  marker.on('dragstart', () => {
    draggingSymbolId.value = symbol.id
    clearRosterHighlight()
    store.selectSymbol(symbol.id)
    hidePopup()
  })
  marker.on('dragend', () => {
    const nextPosition = createDraggedPosition(marker)

    draggingSymbolId.value = null
    setMapCursor('')
    store.updatePosition(symbol.id, nextPosition)
    showPopup(symbol.id, nextPosition)
  })

  return marker
}

function updateMarkerHighlightState(): void {
  for (const [symbolId, marker] of symbolMarkers) {
    const element = marker.getElement() as HTMLDivElement
    const highlighted = activeHighlightSymbolId.value === symbolId
    element.style.filter = highlighted ? 'drop-shadow(0 0 10px rgba(245, 231, 167, 0.9))' : ''
  }
}

function syncSymbolMarkers(): void {
  const map = mapInstance.value

  if (!map) {
    return
  }

  const symbolsById = new Map(store.symbols.map((symbol) => [symbol.id, symbol]))

  for (const [symbolId] of [...symbolMarkers.entries()]) {
    if (symbolsById.has(symbolId)) {
      continue
    }

    removeSymbolMarker(symbolId)
  }

  for (const symbol of store.symbols) {
    const existingMarker = symbolMarkers.get(symbol.id)
    const markerElement = existingMarker?.getElement() as HTMLDivElement | undefined
    const needsRebuild = !existingMarker || markerElement?.dataset.sidc !== symbol.sidc

    if (needsRebuild) {
      removeSymbolMarker(symbol.id)
      symbolMarkers.set(symbol.id, createSymbolMarker(symbol, map))
      continue
    }

    const markerImage = markerElement?.querySelector('img')
    if (markerImage) {
      markerImage.alt = symbol.title
    }
    existingMarker.setLngLat(symbol.position)
  }

  updateMarkerHighlightState()
  debugSymbolLog('marker:sync', {
    count: symbolMarkers.size,
    symbolCount: store.symbols.length
  })
}

function setLayerVisibility(layerId: string, visible: boolean): void {
  const map = mapInstance.value

  if (!map || !map.getLayer(layerId)) {
    return
  }

  map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none')
}

function applyDemState(animate = false): void {
  const map = mapInstance.value

  if (!map || !map.getSource(DEM_TERRAIN_SOURCE_ID)) {
    return
  }

  setLayerVisibility(HILLSHADE_LAYER_ID, demEnabled.value)
  map.setTerrain(demEnabled.value ? { source: DEM_TERRAIN_SOURCE_ID, exaggeration: terrainExaggeration } : null)

  const nextPitch = demEnabled.value ? defaultTerrainPitch : 0
  if (animate) {
    map.easeTo({
      pitch: nextPitch,
      duration: 260,
      essential: true
    })
    return
  }

  map.setPitch(nextPitch)
}

function applyContourState(): void {
  const map = mapInstance.value

  if (!map || !map.getLayer(CONTOUR_LINE_LAYER_ID)) {
    return
  }

  map.setPaintProperty(
    CONTOUR_LINE_LAYER_ID,
    'line-opacity',
    contourEnabled.value ? 1 : 0
  )
}

function disableContourFeature(message: string): void {
  debugSymbolLog('contour:disable', { message })
  contourEnabled.value = false
}

function ensureContourLayers(): void {
  const map = mapInstance.value

  if (!map || !terrainDemSource || !contourControlAvailable.value || map.getSource(CONTOUR_SOURCE_ID)) {
    return
  }

  map.addSource(CONTOUR_SOURCE_ID, {
    type: 'vector',
    tiles: [
      terrainDemSource.contourProtocolUrl({
        overzoom: 1,
        thresholds: contourThresholds,
        elevationKey: 'ele',
        levelKey: 'level',
        contourLayer: 'contours'
      })
    ],
    maxzoom: 16
  })

  map.addLayer({
    id: CONTOUR_LINE_LAYER_ID,
    type: 'line',
    source: CONTOUR_SOURCE_ID,
    'source-layer': 'contours',
    paint: {
      'line-opacity': 0,
      'line-color': [
        'case',
        ['==', ['get', 'level'], 1],
        'rgba(145, 104, 54, 0.7)',
        'rgba(145, 104, 54, 0.34)'
      ],
      'line-width': [
        'case',
        ['==', ['get', 'level'], 1],
        1.35,
        0.72
      ]
    }
  })
}

function updateSelectionFilter(): void {
  const map = mapInstance.value

  if (!map || !map.getLayer(SYMBOL_SELECTION_LAYER_ID)) {
    return
  }

  map.setFilter(SYMBOL_SELECTION_LAYER_ID, [
    '==',
    ['get', 'id'],
    activeHighlightSymbolId.value ?? '__none__'
  ])
}

async function syncSymbolSource(): Promise<void> {
  const map = mapInstance.value
  const source = map?.getSource(SYMBOL_SOURCE_ID) as GeoJSONSource | undefined

  if (!map || !source) {
    return
  }

  source.setData(buildFeatureCollection(store.symbols))
  updateSelectionFilter()
  syncSymbolMarkers()
  updateDebugBridge()
}

async function copyExport(): Promise<void> {
  try {
    await navigator.clipboard.writeText(store.exportJson)
    exportFeedback.value = 'GeoJSON을 클립보드에 복사했습니다.'
  } catch {
    exportFeedback.value = '클립보드 복사에 실패했습니다. 아래 텍스트를 직접 사용하세요.'
  }
}

function downloadExport(): void {
  const blob = new Blob([store.exportJson], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

  anchor.href = url
  anchor.download = `tactical-map-${timestamp}.json`
  anchor.click()
  URL.revokeObjectURL(url)
  exportFeedback.value = 'JSON 다운로드를 시작했습니다.'
}

function toggleAddMode(): void {
  if (store.isAddMode) {
    store.cancelAddMode()
    return
  }

  clearRosterHighlight()
  rosterOpen.value = false
  store.closeExportPanel()
  store.openAddMode()
}

function toggleRoster(): void {
  if (!rosterOpen.value) {
    store.closeExportPanel()
  }

  rosterOpen.value = !rosterOpen.value
}

function toggleDem(): void {
  if (!reliefFeatureAvailable) {
    return
  }

  demEnabled.value = !demEnabled.value
}

function toggleContours(): void {
  if (!contourControlAvailable.value) {
    return
  }

  contourEnabled.value = !contourEnabled.value
}

function selectFromRoster(symbolId: string): void {
  store.cancelAddMode()
  store.selectSymbol(null)
  rosterHighlightedSymbolId.value = symbolId
  focusSymbol(symbolId)
  hidePopup()
}

onMounted(() => {
  if (!mapContainer.value) {
    return
  }

  terrainDemSource =
    reliefFeatureAvailable || contourFeatureAvailable
      ? new mlcontour.DemSource({
          url: demTileUrl,
          encoding: 'terrarium',
          maxzoom: 15,
          worker: false,
          timeoutMs: 10000,
          cacheSize: 100
        })
      : null
  terrainDemSource?.setupMaplibre(maplibregl)

  popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: [0, -22],
    className: 'tactical-popup'
  })

  const map = new maplibregl.Map({
    container: mapContainer.value,
    style: tacticalMapStyle,
    center: koreaCenter,
    zoom: defaultMapZoom,
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    pitch: demEnabled.value ? defaultTerrainPitch : 0,
    maxPitch: 75,
    bearing: 0,
    renderWorldCopies: false
  })

  map.addControl(new maplibregl.NavigationControl(), 'bottom-left')
  map.touchZoomRotate.disableRotation()

  if (debugSymbolImages) {
    map.on('error', (event) => {
      const message = event.error instanceof Error ? event.error.message : String(event.error)
      debugSymbolLog('map:error', {
        message,
        stack: event.error instanceof Error ? event.error.stack : null
      })
    })

    map.on('styleimagemissing', (event) => {
      debugSymbolLog('map:styleimagemissing', {
        id: (event as { id?: string }).id ?? null
      })
    })
  }

  map.on('load', async () => {
    if (terrainDemSource && reliefFeatureAvailable) {
      map.addSource(DEM_TERRAIN_SOURCE_ID, {
        type: 'raster-dem',
        tiles: [terrainDemSource.sharedDemProtocolUrl],
        encoding: 'terrarium',
        tileSize: 256,
        maxzoom: 15,
        attribution: 'Elevation ⓒ Mapzen via AWS Terrain Tiles'
      })

      map.addSource(DEM_HILLSHADE_SOURCE_ID, {
        type: 'raster-dem',
        tiles: [terrainDemSource.sharedDemProtocolUrl],
        encoding: 'terrarium',
        tileSize: 256,
        maxzoom: 15,
        attribution: 'Elevation ⓒ Mapzen via AWS Terrain Tiles'
      })

      map.addLayer({
        id: HILLSHADE_LAYER_ID,
        type: 'hillshade',
        source: DEM_HILLSHADE_SOURCE_ID,
        paint: {
          'hillshade-exaggeration': 0.3,
          'hillshade-shadow-color': 'rgba(0, 0, 0, 0.34)',
          'hillshade-highlight-color': 'rgba(255, 255, 255, 0.72)',
          'hillshade-accent-color': 'rgba(41, 51, 42, 0.22)'
        }
      })

      applyDemState()
    }

    if (contourFeatureAvailable) {
      try {
        ensureContourLayers()
        applyContourState()
      } catch (error) {
        disableContourFeature(error instanceof Error ? error.message : String(error))
      }
    }

    map.addSource(SYMBOL_SOURCE_ID, {
      type: 'geojson',
      data: buildFeatureCollection(store.symbols)
    })

    map.addLayer({
      id: SYMBOL_AURA_LAYER_ID,
      type: 'circle',
      source: SYMBOL_SOURCE_ID,
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          MIN_ZOOM,
          15,
          9.5,
          18,
          MAX_ZOOM,
          24
        ],
        'circle-color': [
          'match',
          ['get', 'affiliation'],
          'friendly',
          'rgba(86, 164, 255, 0.18)',
          'hostile',
          'rgba(255, 118, 92, 0.18)',
          'rgba(218, 224, 211, 0.16)'
        ],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': [
          'match',
          ['get', 'affiliation'],
          'friendly',
          'rgba(140, 204, 255, 0.62)',
          'hostile',
          'rgba(255, 160, 138, 0.64)',
          'rgba(228, 232, 220, 0.52)'
        ],
        'circle-blur': 0.2
      }
    })

    map.addLayer({
      id: SYMBOL_SELECTION_LAYER_ID,
      type: 'circle',
      source: SYMBOL_SOURCE_ID,
      filter: ['==', ['get', 'id'], '__none__'],
      paint: {
        'circle-radius': 32,
        'circle-color': 'rgba(222, 214, 140, 0.18)',
        'circle-stroke-width': 2,
        'circle-stroke-color': 'rgba(245, 231, 167, 0.82)'
      }
    })

    updateSelectionFilter()
    syncSymbolMarkers()
  })

  map.on('click', (event) => {
    hidePopup()

    if (store.isAddMode) {
      const createdSymbol = store.placeDraftAt([event.lngLat.lng, event.lngLat.lat])
      showPopup(createdSymbol.id, createdSymbol.position)
      return
    }

    clearRosterHighlight()
    store.selectSymbol(null)
  })

  resizeObserver = new ResizeObserver(() => {
    map.resize()
  })
  resizeObserver.observe(mapContainer.value)
  window.addEventListener('keydown', handleWindowKeydown)
  if (debugSymbolImages) {
    window.addEventListener('error', handleWindowDebugError)
    window.addEventListener('unhandledrejection', handleWindowDebugRejection)
  }

  mapInstance.value = map
  updateDebugBridge()
})

watch(
  () => store.symbols,
  () => {
    void syncSymbolSource()
  },
  { deep: true }
)

watch(activeHighlightSymbolId, (symbolId) => {
  updateSelectionFilter()
  updateMarkerHighlightState()

  if (draggingSymbolId.value) {
    return
  }

  if (!symbolId) {
    hidePopup()
    return
  }

  const symbol = store.symbols.find((entry) => entry.id === symbolId)
  if (!symbol) {
    hidePopup()
    return
  }

  focusSymbol(symbolId)

  if (store.selectedSymbolId === symbolId) {
    showPopup(symbolId, symbol.position)
    return
  }

  hidePopup()
})

watch(demEnabled, () => {
  applyDemState(true)
})

watch(contourEnabled, () => {
  applyContourState()
})

onBeforeUnmount(() => {
  hidePopup()
  resizeObserver?.disconnect()
  resizeObserver = null
  window.removeEventListener('keydown', handleWindowKeydown)
  if (debugSymbolImages) {
    window.removeEventListener('error', handleWindowDebugError)
    window.removeEventListener('unhandledrejection', handleWindowDebugRejection)
  }
  if (typeof window !== 'undefined') {
    delete window.__TACTICAL_DEBUG__
  }
  terrainDemSource = null
  for (const marker of symbolMarkers.values()) {
    marker.remove()
  }
  symbolMarkers.clear()
  mapInstance.value?.remove()
  mapInstance.value = null
})
</script>

<template>
  <section class="tactical-stage reveal-panel" :data-roster-open="rosterOpen ? 'true' : 'false'">
    <div ref="mapContainer" class="map-surface" />

    <div class="map-overlay-grid" />
    <div class="map-vignette" />

    <MapActionToolbar
      :is-add-mode="store.isAddMode"
      :roster-open="rosterOpen"
      :export-panel-open="store.exportPanelOpen"
      :export-feedback="exportFeedback"
      :export-json="store.exportJson"
      @toggle-add-mode="toggleAddMode"
      @toggle-roster="toggleRoster"
      @toggle-export-panel="store.toggleExportPanel"
      @copy-export="copyExport"
      @download-export="downloadExport"
    />

    <MapTerrainControls
      :relief-feature-available="reliefFeatureAvailable"
      :contour-control-available="contourControlAvailable"
      :dem-enabled="demEnabled"
      :contour-enabled="contourEnabled"
      @toggle-dem="toggleDem"
      @toggle-contours="toggleContours"
    />

    <div v-if="store.isAddMode" class="map-mode-chip">
      배치 준비 상태입니다. 지도 위를 클릭하면 {{ addDraftPreset?.name ?? '심볼' }}이 추가됩니다.
    </div>

    <MapRosterSheet
      v-if="rosterOpen"
      :friendly-symbols="store.friendlySymbols"
      :hostile-symbols="store.hostileSymbols"
      :active-highlight-symbol-id="activeHighlightSymbolId"
      @close="toggleRoster"
      @select-symbol="selectFromRoster"
    />
  </section>
</template>
