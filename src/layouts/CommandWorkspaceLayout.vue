<template>
  <div class="workspace-shell">
    <div class="workspace-shell__backdrop" />
    <div class="workspace-shell__grid" />

    <main class="workspace-main">
      <slot name="hero" />

      <section class="workspace-stage">
        <div class="workspace-stage__map">
          <slot />
        </div>

        <div v-if="$slots.right" class="workspace-stage__rail workspace-stage__rail--right">
          <slot name="right" />
        </div>
      </section>
    </main>
  </div>
</template>
