<script setup lang="ts">
import { computed } from 'vue'

import { getAffiliationLabel, getPresetById, symbolPresets } from '../data/symbolPresets'
import { useMapEditorStore } from '../stores/mapEditorStore'
import type { SymbolStatus } from '../types/military'
import { renderFeatureSvg, renderPresetSvg } from '../utils/renderMilitarySymbol'
import {
  formatCoordinatePair,
  getSymbolStatusLabel,
  normalizeQuantity,
  symbolStatusOptions
} from '../utils/symbolFormatting'

const store = useMapEditorStore()

const selectedSymbol = computed(() => store.selectedSymbol)
const selectedPreset = computed(() =>
  selectedSymbol.value ? getPresetById(selectedSymbol.value.presetId) : null
)
const addDraftPreset = computed(() => getPresetById(store.addDraft.presetId))

const selectedCoordinates = computed(() => {
  if (!selectedSymbol.value) {
    return '-'
  }

  return formatCoordinatePair(selectedSymbol.value.position)
})

function updateTextField(field: 'title' | 'description', value: string): void {
  if (!selectedSymbol.value) {
    return
  }

  store.updateSymbol(selectedSymbol.value.id, { [field]: value })
}

function updateQuantity(value: string): void {
  if (!selectedSymbol.value) {
    return
  }

  store.updateSymbol(selectedSymbol.value.id, {
    quantity: normalizeQuantity(value)
  })
}

function updatePreset(presetId: string): void {
  if (!selectedSymbol.value) {
    return
  }

  store.applyPreset(selectedSymbol.value.id, presetId)
}

function updateStatus(status: SymbolStatus): void {
  if (!selectedSymbol.value) {
    return
  }

  store.setSymbolStatus(selectedSymbol.value.id, status)
}

function updateDraftQuantity(value: string): void {
  store.updateAddDraft({
    quantity: normalizeQuantity(value)
  })
}

function removeSelected(): void {
  if (!selectedSymbol.value) {
    return
  }

  store.removeSymbol(selectedSymbol.value.id)
}
</script>

<template>
  <aside class="panel-surface panel-shell reveal-panel">
    <template v-if="store.isAddMode">
      <header class="panel-banner panel-banner--compact">
        <div>
          <p class="panel-heading">유닛 추가</p>
          <h2 class="panel-title">배치 설정</h2>
        </div>

        <button type="button" class="action-button" @click="store.cancelAddMode">
          취소
        </button>
      </header>

      <section class="panel-section">
        <div class="selection-board">
          <span
            class="selection-board__icon"
            :data-affiliation="addDraftPreset.affiliation"
            v-html="renderPresetSvg(addDraftPreset, 44)"
          />

          <div class="selection-board__body">
            <div class="selection-board__header">
              <p class="selection-board__title">{{ addDraftPreset.name }}</p>
              <span class="force-chip" :data-affiliation="addDraftPreset.affiliation">
                {{ getAffiliationLabel(addDraftPreset.affiliation) }}
              </span>
            </div>

            <div class="selection-facts">
              <div class="selection-facts__item">
                <span>분류</span>
                <strong>{{ addDraftPreset.category }}</strong>
              </div>
              <div class="selection-facts__item">
                <span>상태</span>
                <strong>{{ getSymbolStatusLabel(store.addDraft.status) }}</strong>
              </div>
              <div class="selection-facts__item selection-facts__item--wide">
                <span>안내</span>
                <strong>입력값을 조정한 뒤 지도 클릭으로 객체를 배치합니다.</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="panel-section">
        <div class="panel-form-grid">
          <label class="field-stack field-stack--wide">
            <span class="field-stack__label">심볼 유형</span>
            <select
              :value="store.addDraft.presetId"
              class="field-input"
              @change="store.setAddDraftPreset(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="preset in symbolPresets" :key="preset.id" :value="preset.id">
                {{ preset.name }}
              </option>
            </select>
          </label>

          <label class="field-stack field-stack--wide">
            <span class="field-stack__label">명칭</span>
            <input
              :value="store.addDraft.title"
              type="text"
              class="field-input"
              @input="store.updateAddDraft({ title: ($event.target as HTMLInputElement).value })"
            />
          </label>

          <label class="field-stack field-stack--wide">
            <span class="field-stack__label">설명</span>
            <textarea
              :value="store.addDraft.description"
              rows="3"
              class="field-input field-input--textarea"
              @input="store.updateAddDraft({ description: ($event.target as HTMLTextAreaElement).value })"
            />
          </label>

          <label class="field-stack">
            <span class="field-stack__label">상태</span>
            <select
              :value="store.addDraft.status"
              class="field-input"
              @change="store.updateAddDraft({ status: ($event.target as HTMLSelectElement).value as SymbolStatus })"
            >
              <option v-for="status in symbolStatusOptions" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </label>

          <label class="field-stack">
            <span class="field-stack__label">수량</span>
            <input
              :value="store.addDraft.quantity"
              type="number"
              min="1"
              class="field-input"
              @input="updateDraftQuantity(($event.target as HTMLInputElement).value)"
            />
          </label>
        </div>
      </section>
    </template>

    <template v-else-if="selectedSymbol && selectedPreset">
      <header class="panel-banner panel-banner--compact">
        <div>
          <p class="panel-heading">선택 객체</p>
          <h2 class="panel-title">객체 편집</h2>
        </div>

        <button type="button" class="action-button action-button--danger" @click="removeSelected">
          삭제
        </button>
      </header>

      <section class="panel-section">
        <div class="selection-board">
          <span
            class="selection-board__icon"
            :data-affiliation="selectedSymbol.affiliation"
            v-html="renderFeatureSvg(selectedSymbol, 44)"
          />

          <div class="selection-board__body">
            <div class="selection-board__header">
              <p class="selection-board__title">{{ selectedSymbol.title }}</p>
              <div class="selection-board__chips">
                <span class="force-chip" :data-affiliation="selectedSymbol.affiliation">
                  {{ getAffiliationLabel(selectedSymbol.affiliation) }}
                </span>
                <span class="status-chip" :data-status="selectedSymbol.status">
                  {{ getSymbolStatusLabel(selectedSymbol.status) }}
                </span>
              </div>
            </div>

            <div class="selection-facts">
              <div class="selection-facts__item">
                <span>심볼 유형</span>
                <strong>{{ selectedPreset.name }}</strong>
              </div>
              <div class="selection-facts__item">
                <span>분류</span>
                <strong>{{ selectedPreset.category }}</strong>
              </div>
              <div class="selection-facts__item">
                <span>진영</span>
                <strong>{{ getAffiliationLabel(selectedSymbol.affiliation) }}</strong>
              </div>
              <div class="selection-facts__item">
                <span>수량</span>
                <strong>{{ selectedSymbol.quantity }}</strong>
              </div>
              <div class="selection-facts__item selection-facts__item--wide">
                <span>좌표</span>
                <strong>{{ selectedCoordinates }}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="panel-section">
        <div class="panel-form-grid">
          <label class="field-stack field-stack--wide">
            <span class="field-stack__label">명칭</span>
            <input
              :value="selectedSymbol.title"
              type="text"
              class="field-input"
              @input="updateTextField('title', ($event.target as HTMLInputElement).value)"
            />
          </label>

          <label class="field-stack field-stack--wide">
            <span class="field-stack__label">설명</span>
            <textarea
              :value="selectedSymbol.description"
              rows="3"
              class="field-input field-input--textarea"
              @input="updateTextField('description', ($event.target as HTMLTextAreaElement).value)"
            />
          </label>

          <label class="field-stack">
            <span class="field-stack__label">심볼 유형</span>
            <select
              :value="selectedSymbol.presetId"
              class="field-input"
              @change="updatePreset(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="preset in symbolPresets" :key="preset.id" :value="preset.id">
                {{ preset.name }}
              </option>
            </select>
          </label>

          <label class="field-stack">
            <span class="field-stack__label">상태</span>
            <select
              :value="selectedSymbol.status"
              class="field-input"
              @change="updateStatus(($event.target as HTMLSelectElement).value as SymbolStatus)"
            >
              <option v-for="status in symbolStatusOptions" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </label>

          <label class="field-stack">
            <span class="field-stack__label">수량</span>
            <input
              :value="selectedSymbol.quantity"
              type="number"
              min="1"
              class="field-input"
              @input="updateQuantity(($event.target as HTMLInputElement).value)"
            />
          </label>

          <label class="field-stack">
            <span class="field-stack__label">좌표</span>
            <input :value="selectedCoordinates" type="text" readonly class="field-input field-input--readonly" />
          </label>
        </div>
      </section>
    </template>
  </aside>
</template>
