<script setup lang="ts">
const props = defineProps<{
  reliefFeatureAvailable: boolean
  contourControlAvailable: boolean
  demEnabled: boolean
  contourEnabled: boolean
}>()

const emit = defineEmits<{
  'toggle-dem': []
  'toggle-contours': []
}>()
</script>

<template>
  <div v-if="props.reliefFeatureAvailable || props.contourControlAvailable" class="map-terrain-controls">
    <button
      v-if="props.reliefFeatureAvailable"
      type="button"
      class="map-icon-button"
      :class="{ 'is-active': props.demEnabled }"
      :aria-pressed="props.demEnabled"
      title="DEM 표시 전환"
      @click="emit('toggle-dem')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" class="map-icon-button__icon">
        <path d="M3 18 8.2 9.8l3.2 4.4 3.3-5.2L21 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
        <path d="M5 18h14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" />
      </svg>
      <span class="sr-only">DEM 표시 전환</span>
    </button>

    <button
      v-if="props.contourControlAvailable"
      type="button"
      class="map-icon-button"
      :class="{ 'is-active': props.contourEnabled }"
      :aria-pressed="props.contourEnabled"
      title="등고선 표시 전환"
      @click="emit('toggle-contours')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" class="map-icon-button__icon">
        <path d="M4 8.2c1.8 0 1.8-.9 3.5-.9s1.8.9 3.5.9 1.8-.9 3.5-.9 1.8.9 3.5.9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" />
        <path d="M4 12c1.8 0 1.8-.9 3.5-.9s1.8.9 3.5.9 1.8-.9 3.5-.9 1.8.9 3.5.9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" />
        <path d="M4 15.8c1.8 0 1.8-.9 3.5-.9s1.8.9 3.5.9 1.8-.9 3.5-.9 1.8.9 3.5.9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" />
      </svg>
      <span class="sr-only">등고선 표시 전환</span>
    </button>
  </div>
</template>
