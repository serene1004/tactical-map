<script setup lang="ts">
interface HeaderStat {
  id: string
  label: string
  value: string | number
  valueClass?: string
}

const props = defineProps<{
  title: string
  stats: HeaderStat[]
}>()
</script>

<template>
  <header class="ops-header reveal-panel">
    <div class="ops-header__title">
      <h1 class="ops-header__headline">{{ props.title }}</h1>
    </div>

    <div class="ops-header__stats">
      <div v-for="stat in props.stats" :key="stat.id" class="ops-stat">
        <span class="ops-stat__label">{{ stat.label }}</span>
        <strong :class="['ops-stat__value', stat.valueClass]">{{ stat.value }}</strong>
      </div>
    </div>
  </header>
</template>
