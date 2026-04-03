<script setup lang="ts">
const props = defineProps<{
  isAddMode: boolean
  rosterOpen: boolean
  exportPanelOpen: boolean
  exportFeedback: string
  exportJson: string
}>()

const emit = defineEmits<{
  'toggle-add-mode': []
  'toggle-roster': []
  'toggle-export-panel': []
  'copy-export': []
  'download-export': []
}>()
</script>

<template>
  <div class="map-toolbar">
    <div class="map-toolbar__buttons">
      <button
        type="button"
        class="map-floating-button"
        :class="{ 'is-active': props.isAddMode }"
        @click="emit('toggle-add-mode')"
      >
        {{ props.isAddMode ? '추가 취소' : '유닛 추가' }}
      </button>

      <button
        type="button"
        class="map-floating-button"
        :class="{ 'is-active': props.rosterOpen }"
        @click="emit('toggle-roster')"
      >
        편성현황
      </button>

      <button
        type="button"
        class="map-floating-button"
        :class="{ 'is-active': props.exportPanelOpen }"
        @click="emit('toggle-export-panel')"
      >
        내보내기
      </button>
    </div>

    <div class="map-accordion" :class="{ 'is-open': props.exportPanelOpen }">
      <div class="map-accordion__body">
        <div class="map-export-panel">
          <div class="map-export-panel__header">
            <div>
              <p class="map-export-panel__title">GeoJSON 내보내기</p>
              <p class="map-export-panel__copy">{{ props.exportFeedback }}</p>
            </div>

            <div class="map-export-panel__actions">
              <button type="button" class="action-button" @click="emit('copy-export')">복사</button>
              <button type="button" class="action-button action-button--primary" @click="emit('download-export')">
                다운로드
              </button>
            </div>
          </div>

          <textarea :value="props.exportJson" readonly class="export-console map-export-panel__console" />
        </div>
      </div>
    </div>
  </div>
</template>
