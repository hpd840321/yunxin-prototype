<template>
  <span class="risk-badge" :class="[level, { 'has-trend': !!trend }]" :style="{ '--badge-color': color }">
    <span class="dot" />
    <span class="label">{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RiskLevel } from '@/types'
import { RISK_LEVEL_LABELS, RISK_LEVEL_COLORS } from '@/types'

const props = defineProps<{
  level: RiskLevel
  trend?: RiskLevel | null
  size?: 'sm' | 'md' | 'lg'
}>()

const color = computed(() => RISK_LEVEL_COLORS[props.level])
const label = computed(() => RISK_LEVEL_LABELS[props.level])
</script>

<style scoped>
.risk-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  border: 1.5px solid var(--badge-color);
  color: var(--badge-color);
  background: color-mix(in srgb, var(--badge-color) 10%, transparent);
}
.risk-badge.sm { padding: 2px 8px; font-size: 11px; }
.risk-badge.lg { padding: 6px 16px; font-size: 14px; }

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--badge-color);
  flex-shrink: 0;
}

.has-trend::after {
  content: '↗';
  font-size: 11px;
  margin-left: 2px;
  opacity: 0.8;
}
</style>
