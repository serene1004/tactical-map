import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getPresetById, symbolPresets } from '../data/symbolPresets'
import { buildExportDocument } from '../utils/exportSymbols'
import { normalizeQuantity } from '../utils/symbolFormatting'
import type { MilitarySymbolFeature, SymbolDraft, SymbolStatus } from '../types/military'

const scenarioBlueprint: Array<{
  presetId: string
  position: [number, number]
  quantity?: number
  overrides?: Partial<MilitarySymbolFeature>
}> = [
  {
    presetId: 'friendly-command-post',
    position: [128.204, 38.242]
  },
  {
    presetId: 'friendly-infantry-company',
    position: [128.245, 38.286],
    quantity: 3,
    overrides: {
      title: '아군 보병 알파',
      description: '능선 서측 전방 경계선을 유지하는 보병 전력'
    }
  },
  {
    presetId: 'friendly-infantry-company',
    position: [128.276, 38.323],
    quantity: 2,
    overrides: {
      title: '아군 보병 브라보',
      description: '중앙 방어선을 맡는 주 방어 중대'
    }
  },
  {
    presetId: 'friendly-armor-platoon',
    position: [128.288, 38.296],
    quantity: 2,
    overrides: {
      title: '아군 기갑 예비대',
      description: '중앙 계곡 축선에서 역습을 준비하는 기갑 예비대'
    }
  },
  {
    presetId: 'friendly-field-artillery',
    position: [128.162, 38.226],
    quantity: 4,
    overrides: {
      title: '아군 야포대 A',
      description: '차단 사격과 제압 사격을 담당하는 화력 진지'
    }
  },
  {
    presetId: 'friendly-mortar-section',
    position: [128.231, 38.271],
    quantity: 3,
    overrides: {
      title: '아군 박격포반',
      description: '전방 중대를 근접 지원하는 박격포 화력'
    }
  },
  {
    presetId: 'friendly-recon-team',
    position: [128.333, 38.386],
    quantity: 1,
    overrides: {
      title: '아군 정찰팀',
      description: '북측 주 능선 일대에서 관측 임무를 수행하는 정찰팀'
    }
  },
  {
    presetId: 'friendly-air-defense',
    position: [128.258, 38.247],
    quantity: 2,
    overrides: {
      title: '아군 방공부대',
      description: '후방 지역 저고도 위협을 방어하는 방공 전력'
    }
  },
  {
    presetId: 'friendly-engineer',
    position: [128.219, 38.309],
    quantity: 1,
    overrides: {
      title: '아군 공병부대',
      description: '기동로 확보와 장애물 처리를 준비하는 공병 전력'
    }
  },
  {
    presetId: 'hostile-command-post',
    position: [128.472, 38.392]
  },
  {
    presetId: 'hostile-infantry-company',
    position: [128.431, 38.357],
    quantity: 3,
    overrides: {
      title: '적 보병 북부대',
      description: '북동 접근로로 전개한 적 보병 집결 전력'
    }
  },
  {
    presetId: 'hostile-infantry-company',
    position: [128.392, 38.326],
    quantity: 2,
    overrides: {
      title: '적 보병 중앙대',
      description: '중앙 접근축에서 돌입을 준비하는 적 보병 전력'
    }
  },
  {
    presetId: 'hostile-armor-platoon',
    position: [128.444, 38.307],
    quantity: 2,
    overrides: {
      title: '적 기갑소대',
      description: '동측 축선에서 기동 중인 적 기갑 전력'
    }
  },
  {
    presetId: 'hostile-field-artillery',
    position: [128.503, 38.274],
    quantity: 4,
    overrides: {
      title: '적 야포대',
      description: '후방에서 지원 사격을 제공하는 적 화력 진지'
    }
  },
  {
    presetId: 'hostile-recon-team',
    position: [128.365, 38.398],
    quantity: 1,
    overrides: {
      title: '적 정찰팀',
      description: '능선 부근에서 표적을 식별하는 전방 관측팀'
    }
  },
  {
    presetId: 'hostile-air-defense',
    position: [128.463, 38.339],
    quantity: 2,
    overrides: {
      title: '적 방공진지',
      description: '후사면에서 항공 접근을 차단하는 방공 진지'
    }
  }
]

function createSymbolId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `symbol-${Date.now()}-${Math.round(Math.random() * 1e6)}`
}

function createDraftFromPreset(presetId: string): SymbolDraft {
  const preset = getPresetById(presetId)

  return {
    presetId: preset.id,
    title: preset.defaultTitle,
    description: preset.defaultDescription,
    status: preset.defaultStatus,
    quantity: 1
  }
}

function createSymbolFromPreset(
  presetId: string,
  position: [number, number],
  overrides?: Partial<MilitarySymbolFeature>
): MilitarySymbolFeature {
  const preset = getPresetById(presetId)
  const now = new Date().toISOString()

  return {
    id: createSymbolId(),
    presetId: preset.id,
    sidc: preset.sidc,
    title: preset.defaultTitle,
    description: preset.defaultDescription,
    category: preset.category,
    affiliation: preset.affiliation,
    status: preset.defaultStatus,
    quantity: 1,
    position,
    createdAt: now,
    lastUpdated: now,
    ...overrides
  }
}

export const useMapEditorStore = defineStore('mapEditor', () => {
  const selectedSymbolId = ref<string | null>(null)
  const symbols = ref<MilitarySymbolFeature[]>([])
  const isAddMode = ref(false)
  const exportPanelOpen = ref(false)
  const addDraft = ref<SymbolDraft>(createDraftFromPreset(symbolPresets[0].id))

  const selectedSymbol = computed(
    () => symbols.value.find((symbol) => symbol.id === selectedSymbolId.value) ?? null
  )
  const exportJson = computed(() => JSON.stringify(buildExportDocument(symbols.value), null, 2))
  const friendlySymbols = computed(() =>
    symbols.value.filter((symbol) => symbol.affiliation === 'friendly')
  )
  const hostileSymbols = computed(() =>
    symbols.value.filter((symbol) => symbol.affiliation === 'hostile')
  )
  const friendlyCount = computed(() => friendlySymbols.value.length)
  const hostileCount = computed(() => hostileSymbols.value.length)

  function seedScenario(): void {
    symbols.value = scenarioBlueprint.map((entry) =>
      createSymbolFromPreset(entry.presetId, entry.position, {
        quantity: entry.quantity ?? 1,
        ...entry.overrides
      })
    )
    selectedSymbolId.value = null
    isAddMode.value = false
  }

  function ensureSeeded(): void {
    if (symbols.value.length === 0) {
      seedScenario()
    }
  }

  function openAddMode(presetId = addDraft.value.presetId): void {
    selectedSymbolId.value = null
    addDraft.value = createDraftFromPreset(presetId)
    isAddMode.value = true
  }

  function cancelAddMode(): void {
    isAddMode.value = false
  }

  function updateAddDraft(patch: Partial<SymbolDraft>): void {
    addDraft.value = {
      ...addDraft.value,
      ...patch
    }
  }

  function setAddDraftPreset(presetId: string): void {
    addDraft.value = createDraftFromPreset(presetId)
  }

  function placeDraftAt(position: [number, number]): MilitarySymbolFeature {
    const preset = getPresetById(addDraft.value.presetId)
    const symbol = createSymbolFromPreset(addDraft.value.presetId, position, {
      title: addDraft.value.title.trim() || preset.defaultTitle,
      description: addDraft.value.description.trim() || preset.defaultDescription,
      status: addDraft.value.status,
      quantity: normalizeQuantity(addDraft.value.quantity)
    })

    symbols.value = [...symbols.value, symbol]
    selectedSymbolId.value = symbol.id
    isAddMode.value = false
    return symbol
  }

  function updateSymbol(
    symbolId: string,
    patch: Partial<Omit<MilitarySymbolFeature, 'id' | 'createdAt'>>
  ): void {
    symbols.value = symbols.value.map((symbol) =>
      symbol.id === symbolId
        ? {
            ...symbol,
            ...patch,
            lastUpdated: new Date().toISOString()
          }
        : symbol
    )
  }

  function updatePosition(symbolId: string, position: [number, number]): void {
    updateSymbol(symbolId, {
      position: [Number(position[0].toFixed(6)), Number(position[1].toFixed(6))]
    })
  }

  function applyPreset(symbolId: string, presetId: string): void {
    const preset = getPresetById(presetId)
    updateSymbol(symbolId, {
      presetId: preset.id,
      sidc: preset.sidc,
      category: preset.category,
      affiliation: preset.affiliation
    })
  }

  function setSymbolStatus(symbolId: string, status: SymbolStatus): void {
    updateSymbol(symbolId, { status })
  }

  function removeSymbol(symbolId: string): void {
    symbols.value = symbols.value.filter((symbol) => symbol.id !== symbolId)
    if (selectedSymbolId.value === symbolId) {
      selectedSymbolId.value = null
    }
  }

  function selectSymbol(symbolId: string | null): void {
    selectedSymbolId.value = symbolId
    if (symbolId) {
      isAddMode.value = false
    }
  }

  function toggleExportPanel(): void {
    exportPanelOpen.value = !exportPanelOpen.value
  }

  function closeExportPanel(): void {
    exportPanelOpen.value = false
  }

  return {
    addDraft,
    applyPreset,
    cancelAddMode,
    closeExportPanel,
    ensureSeeded,
    exportJson,
    exportPanelOpen,
    friendlyCount,
    friendlySymbols,
    hostileCount,
    hostileSymbols,
    isAddMode,
    openAddMode,
    placeDraftAt,
    removeSymbol,
    selectedSymbol,
    selectedSymbolId,
    selectSymbol,
    setAddDraftPreset,
    setSymbolStatus,
    symbols,
    toggleExportPanel,
    updateAddDraft,
    updatePosition,
    updateSymbol
  }
})
