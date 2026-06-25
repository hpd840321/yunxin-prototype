<template>
  <div class="student-card" :style="{ borderLeftColor: RISK_LEVEL_COLORS[profile.currentLevel] }" @click="$emit('click')">
    <div class="card-top">
      <div class="student-info">
        <span class="name">{{ displayName }}</span>
        <RiskBadge :level="profile.currentLevel" :trend="profile.trend" size="sm" />
      </div>
      <span class="class-name">{{ profile.student.className }}</span>
    </div>
    <div class="metrics-row">
      <div class="metric-item">
        <span class="metric-value" :class="{ high: profile.metrics.W_Ratio >= 30 }">{{ profile.metrics.W_Ratio }}%</span>
        <span class="metric-label">异常占比</span>
      </div>
      <div class="metric-item">
        <span class="metric-value">{{ profile.metrics.Consecutive_Days }}天</span>
        <span class="metric-label">连续异常</span>
      </div>
      <div class="metric-item">
        <span class="metric-value">{{ profile.metrics.W_Event_1 }}</span>
        <span class="metric-label">异常事件</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StudentRiskProfile } from '@/types'
import { RISK_LEVEL_COLORS } from '@/types'
import RiskBadge from './RiskBadge.vue'
import { useAppStore } from '@/stores/app'

const props = defineProps<{
  profile: StudentRiskProfile
}>()

defineEmits<{ click: [] }>()

const store = useAppStore()
const displayName = computed(() => store.maskMode ? props.profile.student.name[0] + '同学' : props.profile.student.name)
</script>

<style scoped>
.student-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #E2EFE7;
  border-left-width: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.student-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  transform: translateY(-1px);
}
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.student-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.name { font-weight: 700; font-size: 14px; color: #1F2937; }
.class-name { font-size: 12px; color: #9CA3AF; }
.metrics-row {
  display: flex;
  gap: 16px;
}
.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
}
.metric-value { font-weight: 700; font-size: 15px; color: #1F2937; }
.metric-value.high { color: #EF4444; }
.metric-label { font-size: 11px; color: #9CA3AF; }
</style>
