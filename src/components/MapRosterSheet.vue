<script setup lang="ts">
import { computed } from 'vue'

import type { MilitarySymbolFeature, SymbolAffiliation } from '../types/military'
import { renderFeatureSvg } from '../utils/renderMilitarySymbol'
import { getSymbolStatusLabel } from '../utils/symbolFormatting'

const props = defineProps<{
  friendlySymbols: MilitarySymbolFeature[]
  hostileSymbols: MilitarySymbolFeature[]
  activeHighlightSymbolId: string | null
}>()

const emit = defineEmits<{
  close: []
  'select-symbol': [symbolId: string]
}>()

const symbolGroups = computed<
  Array<{
    affiliation: SymbolAffiliation
    title: string
    emptyMessage: string
    symbols: MilitarySymbolFeature[]
  }>
>(() => [
  {
    affiliation: 'friendly',
    title: '아군',
    emptyMessage: '배치된 아군 개체가 없습니다.',
    symbols: props.friendlySymbols
  },
  {
    affiliation: 'hostile',
    title: '적군',
    emptyMessage: '배치된 적군 개체가 없습니다.',
    symbols: props.hostileSymbols
  }
])
</script>

<template>
  <section class="roster-sheet">
    <div class="roster-sheet__header">
      <h2 class="roster-sheet__title">편성현황</h2>

      <button type="button" class="action-button" @click="emit('close')">닫기</button>
    </div>

    <div class="roster-sheet__grid">
      <section
        v-for="group in symbolGroups"
        :key="group.affiliation"
        class="roster-column"
        :data-affiliation="group.affiliation"
      >
        <div class="roster-column__header">
          <p class="roster-column__title">{{ group.title }}</p>
          <span class="roster-column__count" :data-affiliation="group.affiliation">
            {{ group.symbols.length }}개
          </span>
        </div>

        <div class="roster-column__list">
          <button
            v-for="symbol in group.symbols"
            :key="symbol.id"
            type="button"
            class="roster-item"
            :class="{ 'is-emphasized': props.activeHighlightSymbolId === symbol.id }"
            :data-affiliation="group.affiliation"
            @click="emit('select-symbol', symbol.id)"
          >
            <span class="roster-item__icon" v-html="renderFeatureSvg(symbol, 32)" />
            <span class="roster-item__body">
              <span class="roster-item__title">{{ symbol.title }}</span>
              <span class="roster-item__meta">
                {{ symbol.category }} · {{ getSymbolStatusLabel(symbol.status) }} · 수량 {{ symbol.quantity }}
              </span>
            </span>
          </button>

          <div v-if="group.symbols.length === 0" class="roster-sheet__empty">{{ group.emptyMessage }}</div>
        </div>
      </section>
    </div>
  </section>
</template>
