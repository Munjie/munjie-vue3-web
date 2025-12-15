<template>
    <svg
        class="meta-logo"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 100"
        fill="none"
        :style="logoStyle"
    >
        <line x1="10" y1="90" x2="10" y2="10"
              stroke="currentColor"
              stroke-width="8"
              stroke-linecap="round"/>

        <line x1="10" y1="10" x2="60" y2="60"
              stroke="currentColor"
              stroke-width="8"
              stroke-linecap="round"/>

        <line x1="60" y1="60" x2="110" y2="10"
              stroke="currentColor"
              stroke-width="8"
              stroke-linecap="round"/>

        <line x1="110" y1="10" x2="110" y2="90"
              stroke="currentColor"
              stroke-width="8"
              stroke-linecap="round"/>
    </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    size?: number | string
}>()

const logoStyle = computed(() => {
    const height = props.size ?? 36
    return {
        height: typeof height === 'number' ? `${height}px` : height,
        width: 'auto'
    }
})
</script>

<style scoped>
.meta-logo {
    display: block;
}
</style>
