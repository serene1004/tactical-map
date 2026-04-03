<script setup lang="ts">
import { computed, onMounted } from 'vue'

import AppHeader from '../components/AppHeader.vue'
import DetailsPanel from '../components/DetailsPanel.vue'
import TacticalMap from '../components/TacticalMap.vue'
import CommandWorkspaceLayout from '../layouts/CommandWorkspaceLayout.vue'
import { useMapEditorStore } from '../stores/mapEditorStore'

const store = useMapEditorStore()

onMounted(() => {
  store.ensureSeeded()
})

const heroStats = computed(() => [
  {
    id: 'friendly',
    label: '아군',
    value: store.friendlyCount,
    valueClass: 'ops-stat__value--friendly'
  },
  {
    id: 'hostile',
    label: '적군',
    value: store.hostileCount,
    valueClass: 'ops-stat__value--hostile'
  }
])
</script>

<template>
  <CommandWorkspaceLayout>
    <template #hero>
      <AppHeader title="TACTICAL MAP" :stats="heroStats" />
    </template>

    <TacticalMap />

    <template v-if="store.isAddMode || store.selectedSymbol" #right>
      <DetailsPanel />
    </template>
  </CommandWorkspaceLayout>
</template>
