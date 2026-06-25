<template>
  <div class="face-thumb" :class="[size, { masked, unregistered: !registered }]" :style="thumbStyle">
    <span class="face-char">{{ displayChar }}</span>
    <div v-if="ringWidth > 0" class="face-ring" :style="{ borderColor: ringColor, borderWidth: ringWidth + 'px' }" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { STATE_COLORS } from '@/types'

const props = withDefaults(defineProps<{
  name: string
  state?: string
  size?: 'sm' | 'md' | 'lg'
  masked?: boolean
  registered?: boolean
  confidence?: number
}>(), { state: 'unknown', size: 'md', registered: true })

const displayChar = computed(() => props.masked ? '?' : props.name[0] ?? '?')
const ringColor = computed(() => STATE_COLORS[props.state] ?? '#D1D5DB')
const ringWidth = computed(() => props.confidence ? Math.max(1, Math.round(props.confidence * 4)) : 2)

const sizeMap = { sm: 32, md: 44, lg: 64 }
const thumbStyle = computed(() => ({
  width: sizeMap[props.size] + 'px',
  height: sizeMap[props.size] + 'px',
}))

const charSize = computed(() => ({ sm: 13, md: 18, lg: 26 }[props.size]))
</script>

<style scoped>
.face-thumb {
  position: relative;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  flex-shrink: 0;
  transition: all 0.2s;
}
.face-thumb.unregistered { background: #F5F5F5; opacity: 0.6; }
.face-thumb.masked { background: #E0E0E0; }
.face-char { font-weight: 700; color: #15803D; z-index: 1; pointer-events: none; }
.face-thumb.masked .face-char { color: #9CA3AF; }
.face-ring {
  position: absolute; inset: -3px; border-radius: 50%;
  border-style: solid; transition: all 0.3s;
}
</style>
